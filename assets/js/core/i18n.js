/**
 * i18n.js
 * - Quét các phần tử có data-i18n-* và gán text/placeholder/aria-label
 * - Hỗ trợ ngôn ngữ 'vi' mặc định, có thể mở rộng 'en' sau này.
 */
(function () {
  const DICT = (window.I18N_DICT || {
    vi: {},
  });

  const LANG = (localStorage.getItem('lang') || 'vi');
  const dict = DICT[LANG] || {};

  function getText(key) {
    if (!key) return '';
    // Hỗ trợ key dạng a.b.c
    const parts = key.split('.');
    let cur = dict;
    for (const p of parts) {
      if (cur && Object.prototype.hasOwnProperty.call(cur, p)) {
        cur = cur[p];
      } else {
        return ''; // không tìm thấy -> trả rỗng (UI fallback text sẵn có)
      }
    }
    return (typeof cur === 'string') ? cur : '';
  }

  function translateTextNodes() {
    document.querySelectorAll('[data-i18n-key]').forEach(el => {
      const key = el.getAttribute('data-i18n-key');
      const text = getText(key);
      if (text) el.textContent = text;
    });
  }

  function translateAriaLabels() {
    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
      const key = el.dataset.i18nAriaLabel; // ✅ camelCase đúng
      const text = getText(key);
      if (text) el.setAttribute('aria-label', text);
    });
  }

  function translatePlaceholders() {
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = getText(key);
      if (text && 'placeholder' in el) el.placeholder = text;
    });
  }

  function onLangSwitchClick(e) {
    const btn = e.target.closest('[data-lang]');
    if (!btn) return;
    const lang = btn.getAttribute('data-lang');
    if (!lang) return;
    localStorage.setItem('lang', lang);
    location.reload();
  }

  function wireLangSwitchers() {
    document.addEventListener('click', onLangSwitchClick);
  }

  function initI18n() {
    translateTextNodes();
    translateAriaLabels();
    translatePlaceholders();
    wireLangSwitchers();
  }

  window.initI18n = initI18n;
})();
