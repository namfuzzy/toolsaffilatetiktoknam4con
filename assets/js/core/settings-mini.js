(function(){
  if (typeof window !== 'object') return;

  // ====== KV (localStorage) keys ======
  const PS_K = {
    proxy:  'proxy_url',
    gemini: 'gemini_key',
    model:  'gemini_model',
  };
  
  function saveKV(k,v){ 
    try { 
      // [SỬA] Dùng window.KV (từ kv.js)
      if (window.KV) window.KV.set(k, v || '');
      else localStorage.setItem(k, v||''); 
    } catch(_){ /*noop*/ } 
  }
  function loadKV(k){ 
    try { 
      // [SỬA] Dùng window.KV (từ kv.js)
      if (window.KV) return window.KV.get(k, '');
      return localStorage.getItem(k) || ''; 
    } catch(_){ return ''; } 
  }

  // ====== Tiny DOM helpers ======
  function $qs(sel){ try { return document.querySelector(sel); } catch(_) { return null; } }
  function $id(id){ try { return document.getElementById(id); } catch(_) { return null; } }

  function getInputValue(candidates) {
    for (const sel of candidates) {
      const el = $qs(sel);
      if (el && typeof el.value === 'string' && el.value.trim() !== '') return el.value.trim();
    }
    return '';
  }

  // ====== ID ánh xạ (dùng chung) ======
  const ID_MAP = {
      // [SỬA] Đổi ID cho thống nhất
      proxy:  '#settings-proxy-url',
      gemini: '#settings-gemini-key',
      model:  '#settings-gemini-model', // ID của select mirror (ẩn)
      qs_model: '#ps-qs-model'         // ID của select trong popup
  };

  function getProxyUrl(){
    const v = getInputValue([
      ID_MAP.proxy, // Đọc input mới
      '#ps-qs-proxy', // Đọc input cũ (dự phòng)
      '#ps-proxy-url',
    ]);
    return v || loadKV(PS_K.proxy);
  }
  function getApiKey(provider){
    if (provider === 'gemini') {
      const v = getInputValue([
        ID_MAP.gemini, // Đọc input mới
        '#ps-qs-gemini', // Đọc input cũ (dự phòng)
        '#ps-api-gemini',
      ]);
      return v || loadKV(PS_K.gemini);
    }
    return '';
  }

  // ====== Model select ======
  function ensureModelSelect(){
    let sel = $id(ID_MAP.model.substring(1)); // Select mirror (ẩn)
    if (!sel) {
      sel = document.createElement('select');
      sel.id = ID_MAP.model.substring(1);
      sel.style.position = 'fixed';
      sel.style.left = '-9999px';
      sel.style.top = '-9999px';
      sel.setAttribute('aria-hidden', 'true');
      document.body.appendChild(sel);
    }
    
    let qs = $id(ID_MAP.qs_model.substring(1)); // Select trong popup
    const container = $id('ps-qs-model-container');
    
    if (container && !qs) {
      qs = document.createElement('select');
      qs.id = ID_MAP.qs_model.substring(1);
      qs.style.width = '100%';
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
      
      qs.addEventListener('change', ()=>{
         if (sel) sel.value = qs.value;
      });
    }
    return sel; // Trả về select mirror (ẩn)
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
    const qs = $id(ID_MAP.qs_model.substring(1)); 
    const last = loadKV(PS_K.model); 
    
    let currentModels = [];
    if (qs) {
        currentModels = Array.from(qs.options).map(opt => opt.value);
    }
    
    if (last && !models.includes(last) && !currentModels.includes(last)) {
        models.unshift(last); 
    }
    
    if (!models.length && currentModels.length > 0) {
        return;
    }

    const html = models.map(id => 
        `<option value="${id}"${id === last ? ' selected' : ''}>${id}</option>`
    ).join('');
    
    if (sel) sel.innerHTML = html;
    if (qs) qs.innerHTML = html;
    
    const currentVal = last && models.includes(last) ? last : (models[0] || '');
    if (qs) qs.value = currentVal;
    if (sel) sel.value = currentVal;
  }

  // ====== Hidden mirrors ======
  function ensureHiddenInputs(){
    const ids = [
      [ID_MAP.proxy.substring(1), 'text'],
      [ID_MAP.gemini.substring(1), 'password'],
    ];
    for (const [id, type] of ids) {
      if (!$id(id)) {
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
    // [SỬA LỖI] Đọc từ input TRỰC TIẾP trong popup, không phải getProxyUrl()
    const proxyUrl = (getInputValue([ID_MAP.proxy]) || '').trim() || loadKV(PS_K.proxy) || '';
    const apiKey = (getInputValue([ID_MAP.gemini]) || '').trim() || loadKV(PS_K.gemini) || '';
  
    if (!proxyUrl || proxyUrl.trim() === '') return { ok:false, error:'Missing proxyUrl' }; // LỖI ĐÃ FIX: Kiểm tra chặt hơn
    if (!apiKey || apiKey.trim() === '') return { ok:false, error:'Missing apiKey' };

    const payload = {
      provider,
      apiKey,
      model: "",
      body: { listModels: true }
    };
    
    const fetchFn = window.robustFetch || fetch;
    const opts = {
        method: 'POST',
        body: JSON.stringify(payload)
    };
    if (!window.robustFetch) {
       opts.headers = { 'Content-Type':'text/plain;charset=utf-8' };
    }

    const res = await fetchFn(proxyUrl, opts, 1);
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

    const existed = $id('ps-quick-settings');
    if (existed) existed.remove();

    const wrap = document.createElement('div');
    wrap.id = 'ps-quick-settings';
    Object.assign(wrap.style, {
      position:'fixed', inset:'0', background:'rgba(0,0,0,.35)', zIndex:'99999'
    });
    wrap.addEventListener('click', (e)=>{ if(e.target===wrap) wrap.remove(); });

    const panel = document.createElement('div');
    panel.id = 'ps-qs-panel';
    // ... (Giữ nguyên style của panel) ...
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
    
    // HTML của popup
    panel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <strong>Quick Settings</strong>
        <button type="button" id="ps-qs-close" style="background:#334155;color:#fff;border:0;border-radius:8px;padding:6px 10px;cursor:pointer">✕</button>
      </div>
      <label style="display:block;font-size:12px;margin-top:6px">GAS Proxy URL</label>
      <input id="${ID_MAP.proxy.substring(1)}" type="text" placeholder="https://script.google.com/.../exec" style="width:100%;padding:8px;border-radius:8px;border:1px solid #374151;background:#0b1220;color:#fff">
      
      <label style="display:block;font-size:12px;margin-top:10px">Gemini API Key</label>
      <input id="${ID_MAP.gemini.substring(1)}" type="password" placeholder="AIza..." style="width:100%;padding:8px;border-radius:8px;border:1px solid #374151;background:#0b1220;color:#fff">
      
      <!-- Container cho Model Select -->
      <div id="ps-qs-model-container" style="margin-top:10px;"></div>
      
      <!-- Nút Save và Refresh -->
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;border-top:1px solid #374151;padding-top:12px;">
        <button id="ps-qs-ref-gem" type="button" style="background:#334155;color:#fff;border:0;border-radius:8px;padding:8px 12px;cursor:pointer">Refresh Gemini</button>
        <button id="ps-qs-save" type="button" style="background:#2563eb;color:#fff;border:0;border-radius:8px;padding:8px 12px;cursor:pointer">Lưu cấu hình</button>
      </div>
    `;
    wrap.appendChild(panel);
    document.body.appendChild(wrap);
    $id('ps-qs-close').onclick = ()=> wrap.remove();

    // Luôn tải lại giá trị từ KV (localStorage) khi mở
    const proxyKV  = loadKV(PS_K.proxy);
    const geminiKV = loadKV(PS_K.gemini);
    const modelKV = loadKV(PS_K.model);
    
    const pv = $id(ID_MAP.proxy.substring(1));  if (pv) pv.value = proxyKV || '';
    const gv = $id(ID_MAP.gemini.substring(1)); if (gv) gv.value = geminiKV || '';

    // Tạo select và điền model đã lưu (nếu có)
    ensureModelSelect(); 
    const qs = $id(ID_MAP.qs_model.substring(1));
    if (qs && modelKV && !qs.querySelector(`option[value="${modelKV}"]`)) {
        const opt = document.createElement('option');
        opt.value = modelKV;
        opt.textContent = modelKV;
        opt.selected = true;
        qs.appendChild(opt);
    }
    
    // Logic cho nút "Lưu cấu hình"
    const btnSave = $id('ps-qs-save');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const p = (pv && pv.value || '').trim();
            const g = (gv && gv.value || '').trim();
            const m = ($id(ID_MAP.qs_model.substring(1)) && $id(ID_MAP.qs_model.substring(1)).value || '').trim();

            // 1. Lưu vào KV (localStorage)
            saveKV(PS_K.proxy,  p);
            saveKV(PS_K.gemini, g);
            saveKV(PS_K.model,  m);
            
            // 2. Đồng bộ vào các input/select ẩn (mirrors)
            const ph = $id(ID_MAP.proxy.substring(1));
            const gh = $id(ID_MAP.gemini.substring(1));
            const mh = $id(ID_MAP.model.substring(1)); 
            
            if (ph) ph.value = p;
            if (gh) gh.value = g;
            if (mh) mh.value = m; 

            // Thêm thông báo
            btnSave.textContent = 'Đã lưu!';
            btnSave.style.background = '#22c55e'; // Màu xanh lá
            
            setTimeout(() => { 
                btnSave.textContent = 'Lưu cấu hình'; 
                btnSave.style.background = '#2563eb'; // Trả lại màu xanh dương
            }, 1500);
        });
    }

    // Logic cho nút "Refresh Gemini"
    const btnGem = $id('ps-qs-ref-gem');
    if (btnGem && !btnGem.__psBound) {
      btnGem.__psBound = true;
      btnGem.addEventListener('click', async ()=>{
        try{
          // Tự động lưu key/proxy hiện tại TRƯỚC KHI refresh
          const p = (pv && pv.value || '').trim();
          const g = (gv && gv.value || '').trim();
          saveKV(PS_K.proxy,  p);
          saveKV(PS_K.gemini, g);
          
          // [SỬA] Đảm bảo các input ẩn (mirrors) cũng được cập nhật
          const ph = $id(ID_MAP.proxy.substring(1));
          const gh = $id(ID_MAP.gemini.substring(1));
          if (ph) ph.value = p;
          if (gh) gh.value = g;

          // Bắt đầu refresh
          btnGem.textContent = 'Đang tải...';
          const out = await refreshModels('gemini');
          console.log('[PS] Refresh Gemini =>', out);
          btnGem.textContent = 'Refresh Gemini';
          
          if (!out || !out.ok || (Array.isArray(out.data?.models) && out.data.models.length === 0)) {
            // [SỬA] Sử dụng alert chuẩn
            alert('Refresh lỗi: ' + (out.error || 'Không tìm thấy model. Kiểm tra lại Key/Proxy.'));
          }

        }catch(e){ 
            alert('Refresh Gemini error: '+e); 
            btnGem.textContent = 'Refresh Gemini';
        }
      });
    }
  }

  // ====== [SỬA LỖI] Nhét nút bánh răng (luôn luôn) ======
  function injectQuickGear(){
    // Chỉ kiểm tra xem nút bánh răng nổi đã tồn tại chưa
    if ($id('ps-quick-gear')) return; // Đã chèn rồi
    
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
    injectQuickGear(); // [SỬA] Hàm này giờ sẽ luôn tạo nút ⚙️ nổi

    // Autofill mirrors từ KV ngay khi load
    const ph = $id(ID_MAP.proxy.substring(1)); 
    const gh = $id(ID_MAP.gemini.substring(1)); 
    if (ph && !ph.value) ph.value = loadKV(PS_K.proxy);
    if (gh && !gh.value) gh.value = loadKV(PS_K.gemini);

    // Nếu đã có proxy & key thì auto-refresh models
    const url = getProxyUrl();
    const key = getApiKey('gemini');
    if (url && key) {
        console.log('[PS] Tự động làm mới model khi tải trang...');
        refreshModels('gemini');
    }

    // Tự re-select model cuối
    const last = loadKV(PS_K.model);
    const sel  = $id(ID_MAP.model.substring(1)); 
    if (sel && last) {
        if (!sel.querySelector(`option[value="${last}"]`)) {
            const opt = document.createElement('option');
            opt.value = last;
            opt.textContent = last;
            sel.appendChild(opt);
        }
        sel.value = last;
    }
  });

})();
