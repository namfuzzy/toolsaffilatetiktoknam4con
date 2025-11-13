/**
 * theme.js
 * - Lưu trạng thái theme (dark/light) vào localStorage
 * - Hỗ trợ checkbox #theme-toggle nếu có
 */
(function () {
  function applySavedTheme() {
    const saved = localStorage.getItem('theme'); // 'light' | 'dark' | null
    if (saved === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }

  function wireToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    toggle.checked = document.body.classList.contains('light-mode');
    toggle.addEventListener('change', () => {
      document.body.classList.toggle('light-mode', toggle.checked);
      localStorage.setItem('theme', toggle.checked ? 'light' : 'dark');
    });
  }

  function initTheme() {
    applySavedTheme();
    wireToggle();
  }

  window.initThemeToggle = initTheme;
})();
