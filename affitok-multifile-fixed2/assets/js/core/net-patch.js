/* net-patch.js — define window.robustFetch with GAS-safe defaults */
(function () {
  if (typeof window !== 'object') return;
  if (window.robustFetch && typeof window.robustFetch === 'function') {
    // Already defined elsewhere — keep existing to avoid double-patch.
    return;
  }

  /**
   * robustFetch(url, opts, retries=1)
   * - For GAS /exec POST: force simple request to avoid CORS preflight.
   * - Returns the real Response object from fetch.
   * - On network failure, retries; if all fail, returns a synthetic Response-like object.
   */
  function robustFetch(url, opts = {}, retries = 1) {
    try {
      const u = String(url || '');
      const isGasExec = /\/exec(\?|$)/.test(u) && /^https:\/\/script\.google\.com\//.test(u);

      const method = String((opts && opts.method) || 'GET').toUpperCase();
      const init = Object.assign({}, opts);

      // Ensure body is a string when posting JSON to GAS to avoid preflight
      if (isGasExec && method === 'POST') {
        const payload = (init && init.body != null) ? init.body : '';
        init.headers = Object.assign({}, init.headers, {
          'Content-Type': 'text/plain;charset=utf-8'
        });
        init.mode = 'cors';
        init.credentials = 'omit';
        if (typeof payload === 'string') {
          init.body = payload;
        } else {
          try {
            init.body = JSON.stringify(payload);
          } catch (e) {
            init.body = String(payload);
          }
        }
      }

      // Avoid accidental preflight by not adding custom headers unless necessary.
      return fetch(u, init).catch(async (err) => {
        if (retries > 0) {
          // small backoff
          await new Promise(r => setTimeout(r, 250));
          return robustFetch(url, opts, retries - 1);
        }
        // Synthetic minimal Response-like object so call-sites using res.json()/res.text() won't crash
        const msg = String(err && err.message ? err.message : err || 'Network error');
        const synthetic = {
          ok: false,
          status: 0,
          statusText: 'NETWORK_ERROR',
          headers: new Headers(),
          url: u,
          clone() { return this; },
          async json() { return { ok: false, error: msg }; },
          async text() { return msg; }
        };
        return synthetic;
      });
    } catch (err) {
      // Same synthetic response on unexpected sync errors
      const msg = String(err && err.message ? err.message : err || 'Error');
      return Promise.resolve({
        ok: false,
        status: 0,
        statusText: 'CLIENT_ERROR',
        headers: new Headers(),
        url: String(url || ''),
        clone() { return this; },
        async json() { return { ok: false, error: msg }; },
        async text() { return msg; }
      });
    }
  }

  window.robustFetch = robustFetch;
})();