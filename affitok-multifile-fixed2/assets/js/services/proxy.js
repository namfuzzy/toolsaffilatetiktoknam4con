// assets/js/services/proxy.js
// Gateway gọi Google Apps Script (GAS) để vượt CORS/chính sách khi chạy file:/// hoặc localhost.
// Yêu cầu: window.ENV (env.js) và khuyến nghị có window.KV (kv.js) để lấy key/model người dùng đã lưu.

(function () {
  if (window.ProxyAPI) return;

  const ProxyAPI = {
    // --- Utils lấy cấu hình ---
    getKV(key, fallback = "") {
      try { return (window.KV && window.KV.get(key)) || fallback; } catch { return fallback; }
    },
    getProxyURL() {
      // Ưu tiên người dùng nhập trong Settings, sau đó tới ENV
      const kv = ProxyAPI.getKV("proxy_url", "");
      return kv || (window.ENV && window.ENV.PROXY_URL) || "";
    },
    getProvider() {
      return ProxyAPI.getKV("provider", (window.ENV && window.ENV.DEFAULT_PROVIDER) || "gemini");
    },
    getGeminiKey() {
      return ProxyAPI.getKV("gemini_key", (window.ENV && window.ENV.GOOGLE_API_KEY) || "");
    },
    getGeminiModel() {
      return ProxyAPI.getKV("gemini_model", (window.ENV && window.ENV.GEMINI_MODEL) || "gemini-2.5-pro");
    },
    getPPLXKey() {
      return ProxyAPI.getKV("pplx_key", (window.ENV && window.ENV.PPLX_API_KEY) || "");
    },
    getPPLXModel() {
      return ProxyAPI.getKV("pplx_model", (window.ENV && window.ENV.PPLX_MODEL) || "sonar-small-chat");
    },

    // --- HTTP helper ---
    async postJSON(url, payload) {
      // Tránh preflight: để net-patch.js ép Content-Type 'text/plain;charset=utf-8' khi dùng robustFetch.
      // Nếu thiếu robustFetch, ta tự set Content-Type phù hợp.
      const usingRF = typeof window.robustFetch === "function";
      const opts = { method: "POST", body: JSON.stringify(payload) };
      if (!usingRF) {
        opts.headers = { "Content-Type": "text/plain;charset=utf-8" };
      }
      const res = await (usingRF ? window.robustFetch(url, opts, 1) : fetch(url, opts));
      const data = await res.json().catch(() => ({}));
      // GAS không set status code tự do, nên kiểm tra trường `ok`/`status` trong body
      if (!data || data.ok === false) {
        const msg = (data && data.error) || `Proxy error`;
        throw new Error(msg + (data && data.status ? ` (status ${data.status})` : ""));
      }
      return data;
    },

    // --- API công khai ---
    /**
     * Liệt kê model của Perplexity qua GAS (Gemini list models dùng luồng riêng ở settings).
     * @param {Object} opts { provider="perplexity", apiKey?, viaProxy? }
     */
    async listModels(opts = {}) {
      const provider = (opts.provider || "perplexity").toLowerCase();
      if (provider !== "perplexity") throw new Error("listModels hiện chỉ hỗ trợ Perplexity");

      const proxy = ProxyAPI.getProxyURL();
      if (!proxy) throw new Error("Chưa cấu hình Proxy URL (GAS). Vào ⚙ API để nhập.");

      const apiKey = opts.apiKey || ProxyAPI.getPPLXKey();
      if (!apiKey) throw new Error("Thiếu Perplexity API Key. Vào ⚙ API để nhập.");

      const payload = {
        provider: "perplexity",
        apiKey,
        // model bỏ trống khi list
        model: "",
        body: { listModels: true }
      };
      return ProxyAPI.postJSON(proxy, payload);
    },

    /**
     * Gọi chat/JSON với Gemini qua GAS proxy.
     * @param {Object} params { model?, input?, contents?, temperature?, top_p?, max_tokens?, apiKey? }
     */
    async chatGemini(params = {}) {
      const proxy = ProxyAPI.getProxyURL();
      if (!proxy) throw new Error("Chưa cấu hình Proxy URL (GAS). Vào ⚙ API để nhập.");

      const apiKey = params.apiKey || ProxyAPI.getGeminiKey();
      if (!apiKey) throw new Error("Thiếu Gemini API Key. Vào ⚙ API để nhập.");

      const model = params.model || ProxyAPI.getGeminiModel();
      if (!model) throw new Error("Thiếu Gemini model.");

      const body = {
        input: params.input,
        contents: params.contents, // nếu đã chuẩn parts
        temperature: params.temperature,
        top_p: params.top_p,
        max_tokens: params.max_tokens
      };

      const payload = {
        provider: "gemini",
        apiKey,
        model,
        body
      };

      return ProxyAPI.postJSON(proxy, payload);
    },

    /**
     * Gọi chat Perplexity (OpenAI-compatible) qua GAS proxy.
     * @param {Object} params { model?, messages?, input?, temperature?, top_p?, max_tokens?, apiKey? }
     */
    async chatPerplexity(params = {}) {
      const proxy = ProxyAPI.getProxyURL();
      if (!proxy) throw new Error("Chưa cấu hình Proxy URL (GAS). Vào ⚙ API để nhập.");

      const apiKey = params.apiKey || ProxyAPI.getPPLXKey();
      if (!apiKey) throw new Error("Thiếu Perplexity API Key. Vào ⚙ API để nhập.");

      const model = params.model || ProxyAPI.getPPLXModel();
      if (!model) throw new Error("Thiếu Perplexity model.");

      const body = {
        messages: params.messages, // [{role, content}], nếu không có sẽ map từ input
        input: params.input,
        temperature: params.temperature,
        top_p: params.top_p,
        max_tokens: params.max_tokens
      };

      const payload = {
        provider: "perplexity",
        apiKey,
        model,
        body
      };

      return ProxyAPI.postJSON(proxy, payload);
    }
  };

  window.ProxyAPI = ProxyAPI;
})();