/**
 * mock-actions.js
 * - Gắn sự kiện button giả lập (js-mock-action) để hiện toast/modal
 * - Quản lý modal & drawer cơ bản
 */
(function () {
  // Toast
  function ensureToastContainer() {
    let c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      c.className = 'toast__container';
      document.body.appendChild(c);
    }
    return c;
  }

  function showToast(message, type = 'success') {
    const container = ensureToastContainer();
    const item = document.createElement('div');
    item.className = `toast toast--${type}`;
    item.textContent = message || 'Đã thực hiện hành động (mock)';
    container.appendChild(item);
    setTimeout(() => {
      item.classList.add('is-hide');
      setTimeout(() => item.remove(), 300);
    }, 2000);
  }

  // Modal
  function wireModals() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('.js-modal-close')) {
        const wrap = e.target.closest('.modal__wrapper');
        if (wrap) wrap.classList.remove('is-open');
      }
      if (e.target.closest('.js-open-modal')) {
        const id = e.target.closest('[data-modal]')?.getAttribute('data-modal');
        const wrap = id ? document.getElementById(id) : document.getElementById('modal-wrapper');
        if (wrap) wrap.classList.add('is-open');
      }
    });
  }

  // Drawer
  function wireDrawers() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('.js-drawer-close')) {
        const wrap = e.target.closest('.drawer__wrapper');
        if (wrap) wrap.classList.remove('is-open');
      }
      if (e.target.closest('.js-show-link-builder')) {
        const wrap = document.getElementById('drawer-campaign-details');
        if (wrap) wrap.classList.add('is-open');
      }
    });
  }

  // Mock action buttons
  function wireMockActions() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.js-mock-action');
      if (!btn) return;
      showToast('Đã thực hiện hành động (mock)');
      // cũng mở modal chung nếu có
      const modal = document.getElementById('modal-wrapper');
      if (modal) modal.classList.add('is-open');
    });
  }

  function initMockActions() {
    ensureToastContainer();
    wireModals();
    wireDrawers();
    wireMockActions();
  }

  window.initMockActions = initMockActions;
})();
