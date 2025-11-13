
(function(){
  if (typeof window !== 'object') return;

  // ====== KV (localStorage) keys ======
  const PS_K = {
    proxy: 'ps_proxy_url',
    gemini: 'ps_gemini_key',
    model: 'ps_model_id',
  };
  function saveKV(k,v){ try{ localStorage.setItem(k, v||''); }catch(_){ /*noop*/ } }
  function loadKV(k){ try{ return localStorage.getItem(k) || ''; }catch(_){ return ''; } }

  // ====== Tiny DOM helpers ======
  function $qs(sel){ try { return document.querySelector(sel); } catch(_) { return null; } }
  function getInputValue(candidates) {
    for (const sel of candidates) {
      const el = $qs(sel);
      if (el && typeof el.value === 'string' && el.value.trim() !== '') return el.value.trim();
    }
    return '';
  }

  // ====== Backward-compatible getters (đọc từ Quick Settings / input ẩn / KV) ======
  function getProxyUrl(){
    const v = getInputValue([
      '#ps-qs-proxy',           // Quick Settings
      '#ps-proxy-url',          // hidden mirror
      'input[name="proxyUrl"]',
      '[data-setting="proxyUrl"]',
      '#proxy-url'
    ]);
    return v || loadKV(PS_K.proxy);
  }
  function getApiKey(provider){
    if (provider === 'gemini') {
      const v = getInputValue([
        '#ps-qs-gemini',        // Quick Settings
        '#ps-api-gemini',       // hidden mirror
        'input[name="geminiKey"]',
        '[data-setting="geminiKey"]',
        '#gemini-key'
      ]);
      return v || loadKV(PS_K.gemini);
    }
    return '';
  }

  // ====== Model select (hidden + optional visible mirror trong Quick Settings) ======
  function ensureModelSelect(){
    let sel = document.getElementById('ps-model');
    if (!sel) {
      sel = document.createElement('select');
      sel.id = 'ps-model';
      sel.style.position = 'fixed';
      sel.style.left = '-9999px';
      sel.style.top = '-9999px';
      sel.setAttribute('aria-hidden', 'true');
      document.body.appendChild(sel);
    }
    let qs = document.getElementById('ps-qs-model');
    const container = document.getElementById('ps-qs-panel');
    if (container && !qs) {
      qs = document.createElement('select');
      qs.id = 'ps-qs-model';
      qs.style.width = '100%';
      qs.style.marginTop = '10px';
      qs.style.padding = '8px';
      qs.style.borderRadius = '8px';
      qs.style.border = '1px solid #374151';
      qs.style.background = '#0b1220';
      qs.style.color = '#fff';
      const label = document.createElement('label');
      label.textContent = 'Model';
      label.style.display = 'block';
      label.style.fontSize = '12px';
      label.style.marginTop = '10px';
      container.appendChild(label);
      container.appendChild(qs);
      // Sync 2 chiều
      qs.addEventListener('change', ()=>{
        sel.value = qs.value;
        saveKV(PS_K.model, qs.value || '');
      });
    }
    return sel;
  }
  function normalizeModels(raw){
    let arr = [];
    if (raw && Array.isArray(raw)) arr = raw;
    else if (raw && raw.data && Array.isArray(raw.data.models)) arr = raw.data.models;
    else if (raw && Array.isArray(raw.models)) arr = raw.models;

    const ids = [];
    for (const m of arr) {
      if (!m) continue;
      const name = (typeof m.name === 'string' && m.name)
                || (typeof m.id === 'string' && m.id)
                || (typeof m.model === 'string' && m.model)
                || '';
      if (!name) continue;
      const id = name.includes('/') ? name.split('/').pop() : name;
      ids.push(id);
    }
    return Array.from(new Set(ids)).sort();
  }
  function fillModelSelect(models){
    const sel = ensureModelSelect();
    const last = loadKV(PS_K.model);
    const html = models.map(id => `<option value="${id}">${id}</option>`).join('');
    sel.innerHTML = html;
    // gán lại model cuối cùng nếu còn tồn tại
    if (last && models.includes(last)) sel.value = last;
    else if (models.length) sel.value = models[0];

    const qs = document.getElementById('ps-qs-model');
    if (qs){
      qs.innerHTML = html;
      if (last && models.includes(last)) qs.value = last;
      else qs.value = sel.value;
    }
    // lưu lựa chọn
    saveKV(PS_K.model, sel.value || '');
  }

  // ====== Hidden mirrors để module khác có thể đọc ======
  function ensureHiddenInputs(){
    const ids = [
      ['ps-proxy-url', 'text'],
      ['ps-api-gemini', 'password'],
    ];
    for (const [id, type] of ids) {
      if (!document.getElementById(id)) {
        const inp = document.createElement('input');
        inp.type = type;
        inp.id = id;
        inp.style.position = 'fixed';
        inp.style.left = '-9999px';
        inp.style.top = '-9999px';
        inp.setAttribute('aria-hidden', 'true');
        document.body.appendChild(inp);
      }
    }
  }

  // ====== Gọi GAS để lấy models (Gemini) ======
  async function postListModels(provider){
    const proxyUrl = getProxyUrl();
    const apiKey   = getApiKey(provider);
    if (!proxyUrl) return { ok:false, error:'Missing proxyUrl' };
    if (!apiKey)   return { ok:false, error:'Missing apiKey' };

    const payload = {
      provider,
      apiKey,
      model: "",
      body: { listModels: true }
    };
    const res = await (window.robustFetch ? window.robustFetch(proxyUrl, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, 1) : fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type':'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }));
    let data;
    try { data = await res.json(); } catch(_) { data = { ok:false, error:'Bad JSON' }; }
    return data;
  }
  async function refreshModels(provider){
    try {
      const resp = await postListModels(provider);
      const models = normalizeModels(resp && (resp.data || resp));
      if (Array.isArray(models) && models.length) {
        fillModelSelect(models);
      } else {
        console.warn('[PromptStudio] No models returned.', resp);
      }
      return resp;
    } catch (err) {
      console.error('[PromptStudio] refreshModels error:', err);
    }
  }

  // ====== Quick Settings popup (chỉ còn Gemini) ======
  function openQuickSettings(){
    ensureHiddenInputs();
    ensureModelSelect();

    const existed = document.getElementById('ps-quick-settings');
    if (existed) existed.remove();

    const wrap = document.createElement('div');
    wrap.id = 'ps-quick-settings';
    Object.assign(wrap.style, {
      position:'fixed', inset:'0', background:'rgba(0,0,0,.35)', zIndex:'99999'
    });
    wrap.addEventListener('click', (e)=>{ if(e.target===wrap) wrap.remove(); });

    const panel = document.createElement('div');
    panel.id = 'ps-qs-panel';
    panel.style.position = 'absolute';
    panel.style.right = '16px';
    panel.style.bottom = '96px';
    panel.style.width = '360px';
    panel.style.maxWidth = '96vw';
    panel.style.background = 'var(--card, #111827)';
    panel.style.color = 'var(--text, #fff)';
    panel.style.padding = '16px';
    panel.style.borderRadius = '12px';
    panel.style.boxShadow = '0 10px 30px rgba(0,0,0,.35)';
    panel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <strong>Quick Settings</strong>
        <button type="button" id="ps-qs-close" style="background:#334155;color:#fff;border:0;border-radius:8px;padding:6px 10px;cursor:pointer">✕</button>
      </div>
      <label style="display:block;font-size:12px;margin-top:6px">GAS Proxy URL</label>
      <input id="ps-qs-proxy" type="text" placeholder="https://script.google.com/.../exec" style="width:100%;padding:8px;border-radius:8px;border:1px solid #374151;background:#0b1220;color:#fff">
      <label style="display:block;font-size:12px;margin-top:10px">Gemini API Key</label>
      <input id="ps-qs-gemini" type="password" placeholder="AIza..." style="width:100%;padding:8px;border-radius:8px;border:1px solid #374151;background:#0b1220;color:#fff">
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">
        <button id="ps-qs-ref-gem" type="button" style="background:#2563eb;color:#fff;border:0;border-radius:8px;padding:8px 12px;cursor:pointer">Refresh Gemini</button>
      </div>
    `;
    wrap.appendChild(panel);
    document.body.appendChild(wrap);
    document.getElementById('ps-qs-close').onclick = ()=> wrap.remove();

    // Nạp từ KV vào popup
    const proxyKV  = loadKV(PS_K.proxy);
    const geminiKV = loadKV(PS_K.gemini);
    const pv = document.getElementById('ps-qs-proxy');  if (pv) pv.value = proxyKV || '';
    const gv = document.getElementById('ps-qs-gemini'); if (gv) gv.value = geminiKV || '';

    // Đồng bộ popup -> hidden mirrors + KV
    function persist(){
      const p = (pv && pv.value || '').trim();
      const g = (gv && gv.value || '').trim();
      const ph = document.getElementById('ps-proxy-url');
      const gh = document.getElementById('ps-api-gemini');
      if (ph) ph.value = p;
      if (gh) gh.value = g;
      saveKV(PS_K.proxy,  p);
      saveKV(PS_K.gemini, g);
    }
    if (pv) pv.addEventListener('input', persist);
    if (gv) gv.addEventListener('input', persist);

    const btnGem = document.getElementById('ps-qs-ref-gem');
    if (btnGem && !btnGem.__psBound) {
      btnGem.__psBound = true;
      btnGem.addEventListener('click', async ()=>{
        try{
          persist();
          const out = await refreshModels('gemini');
          console.log('[PS] Refresh Gemini =>', out);
        }catch(e){ alert('Refresh Gemini error: '+e); }
      });
    }
  }

  // ====== Nhét nút bánh răng nếu trang chưa có nút cài đặt ======
  function injectQuickGear(){
    const maybeExisting = document.querySelector('[data-action="open-settings"],#ps-open-settings,.ps-open-settings,[title*="Cài đặt"],[aria-label*="Cài đặt"]');
    if (maybeExisting) return;
    const btn = document.createElement('button');
    btn.id = 'ps-quick-gear';
    btn.type = 'button';
    btn.title = 'Cài đặt API';
    btn.textContent = '⚙️';
    Object.assign(btn.style, {
      position:'fixed', right:'16px', bottom:'96px',
      width:'44px', height:'44px', borderRadius:'50%', border:'0', cursor:'pointer',
      zIndex:'99998', boxShadow:'0 8px 24px rgba(0,0,0,.25)', background:'#0ea5e9', color:'#fff'
    });
    btn.addEventListener('click', openQuickSettings);
    document.body.appendChild(btn);
  }

  // ====== Expose cho module khác dùng ======
  window.PS_refreshModels = refreshModels;

  // ====== Bootstrap ======
  document.addEventListener('DOMContentLoaded', () => {
    ensureHiddenInputs();
    injectQuickGear();

    // Autofill mirrors từ KV ngay khi load
    const ph = document.getElementById('ps-proxy-url');
    const gh = document.getElementById('ps-api-gemini');
    if (ph && !ph.value) ph.value = loadKV(PS_K.proxy);
    if (gh && !gh.value) gh.value = loadKV(PS_K.gemini);

    // Nếu đã có proxy & key thì auto-refresh models
    const url = getProxyUrl();
    const key = getApiKey('gemini');
    if (url && key) refreshModels('gemini');

    // Tự re-select model cuối
    const last = loadKV(PS_K.model);
    const sel  = document.getElementById('ps-model');
    if (sel && last) sel.value = last;

    // Khi đổi model ở select ẩn (nếu có), vẫn lưu KV
    if (sel) sel.addEventListener('change', e => saveKV(PS_K.model, e.target.value || ''));
  });

})();
