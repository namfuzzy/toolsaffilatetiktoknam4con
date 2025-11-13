(function(){
 if (typeof window !== 'object') return;
 // ====== KV (localStorage) keys ======
 const PS_K = {
 proxy: 'proxy_url',
 gemini: 'gemini_key',
 model: 'gemini_model',
 };
 
 function saveKV(k,v){ 
 try { 
 if (window.KV) window.KV.set(k, v || '');
 else localStorage.setItem(k, v||''); 
 } catch(_){ /**noop**/ } 
 }
 function loadKV(k){ 
 try { 
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
 proxy: '#settings-proxy-url',
 gemini: '#settings-gemini-key',
 model: '#settings-gemini-model',
 qs_model: '#ps-qs-model'
 };
 function getProxyUrl(){
 const v = getInputValue([
 ID_MAP.proxy,
 '#ps-qs-proxy',
 '#ps-proxy-url',
 ]);
 return v || loadKV(PS_K.proxy);
 }
 function getApiKey(provider){
 if (provider === 'gemini') {
 const v = getInputValue([
 ID_MAP.gemini,
 '#ps-qs-gemini',
 '#ps-api-gemini',
 ]);
 return v || loadKV(PS_K.gemini);
 }
 return '';
 }
 // ====== Model select ======
 function ensureModelSelect(){
 let sel = $id(ID_MAP.model.substring(1));
 if (!sel) {
 sel = document.createElement('select');
 sel.id = ID_MAP.model.substring(1);
 sel.style.position = 'fixed';
 sel.style.left = '-9999px';
 sel.style.top = '-9999px';
 sel.setAttribute('aria-hidden', 'true');
 document.body.appendChild(sel);
 }
 
 let qs = $id(ID_MAP.qs_model.substring(1));
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
 const proxyUrl = (getInputValue([ID_MAP.proxy]) || '').trim() || loadKV(PS_K.proxy) || '';
 const apiKey = (getInputValue([ID_MAP.gemini]) || '').trim() || loadKV(PS_K.gemini) || '';
 
 if (!proxyUrl || proxyUrl.trim() === '') return { ok:false, error:'Missing proxyUrl' };
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
 <input id="${ID_MAP.proxy.substring(1)}" type="text" placeholder="https://script.google.com/.../exec" style="width:100%;padding:8px;border-radius:8px;border:1px solid #374151;background:#0b1220;color:#fff">
 
 <label style="display:block;font-size:12px;margin-top:10px">Gemini API Key</label>
 <input id="${ID_MAP.gemini.substring(1)}" type="password" placeholder="AIza..." style="width:100%;padding:8px;border-radius:8px;border:1px solid #374151;background:#0b1220;color:#fff">
 
 <div id="ps-qs-model-container" style="margin-top:10px;"></div>
 
 <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;border-top:1px solid #374151;padding-top:12px;">
 <button id="ps-qs-ref-gem" type="button" style="background:#334155;color:#fff;border:0;border-radius:8px;padding:8px 12px;cursor:pointer">Refresh Gemini</button>
 <button id="ps-qs-save" type="button" style="background:#2563eb;color:#fff;border:0;border-radius:8px;padding:8px 12px;cursor:pointer">Lưu cấu hình</button>
 </div>
 `;
 wrap.appendChild(panel);
 document.body.appendChild(wrap);
 $id('ps-qs-close').onclick = ()=> wrap.remove();
 const proxyKV = loadKV(PS_K.proxy);
 const geminiKV = loadKV(PS_K.gemini);
 const modelKV = loadKV(PS_K.model);
 
 const pv = $id(ID_MAP.proxy.substring(1)); if (pv) pv.value = proxyKV || '';
 const gv = $id(ID_MAP.gemini.substring(1)); if (gv) gv.value = geminiKV || '';
 ensureModelSelect(); 
 const qs = $id(ID_MAP.qs_model.substring(1));
 if (qs && modelKV && !qs.querySelector(`option[value="${modelKV}"]`)) {
 const opt = document.createElement('option');
 opt.value = modelKV;
 opt.textContent = modelKV;
 opt.selected = true;
 qs.appendChild(opt);
 }
 
 const btnSave = $id('ps-qs-save');
 if (btnSave) {
 btnSave.addEventListener('click', () => {
 const p = (pv && pv.value || '').trim();
 const g = (gv && gv.value || '').trim();
 const m = ($id(ID_MAP.qs_model.substring(1)) && $id(ID_MAP.qs_model.substring(1)).value || '').trim();
 saveKV(PS_K.proxy, p);
 saveKV(PS_K.gemini, g);
 saveKV(PS_K.model, m);
 
 const ph = $id(ID_MAP.proxy.substring(1));
 const gh = $id(ID_MAP.gemini.substring(1));
 const mh = $id(ID_MAP.model.substring(1)); 
 
 if (ph) ph.value = p;
 if (gh) gh.value = g;
 if (mh) mh.value = m; 
 btnSave.textContent = 'Đã lưu!';
 btnSave.style.background = '#22c55e';
 
 setTimeout(() => { 
 btnSave.textContent = 'Lưu cấu hình'; 
 btnSave.style.background = '#2563eb';
 }, 1500);
 });
 }
 // ====== [FIX LỖI] Logic cho nút "Refresh Gemini" ======
 const btnGem = $id('ps-qs-ref-gem');
 if (btnGem && !btnGem.__psBound) {
 btnGem.__psBound = true;
 btnGem.addEventListener('click', async ()=>{
 try{
 // BƯỚC 1: Lấy trực tiếp input hiện tại từ DOM (không dựa vào biến outer scope)
 const proxyInput = $id(ID_MAP.proxy.substring(1));
 const apiInput = $id(ID_MAP.gemini.substring(1));
 const proxy
