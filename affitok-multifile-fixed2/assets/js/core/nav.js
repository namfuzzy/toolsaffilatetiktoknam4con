/**
 * nav.js
 * - Xử lý sidebar active, breadcrumb, toggle mobile
 * - Lưu trang gần nhất để tự mở lại
 */
(function () {
  function setActiveFromPageId() {
    const pageId = window.__PAGE_ID__;
    if (!pageId) return;
    const links = document.querySelectorAll('.sidebar__nav-link');
    let currentText = '';
    links.forEach(a => {
      const pid = a.getAttribute('data-page-id');
      if (pid === pageId) {
        a.classList.add('is-active');
        const span = a.querySelector('span');
        currentText = span ? span.textContent.trim() : a.textContent.trim();
      } else {
        a.classList.remove('is-active');
      }
    });
    // breadcrumb
    const bc = document.getElementById('breadcrumb-current');
    if (bc && currentText) bc.textContent = currentText;

    try { localStorage.setItem('lastPage', pageId); } catch (e) {}
  }

  function restoreLastPageIfEmpty() {
    if (window.__PAGE_ID__) return;
    const last = localStorage.getItem('lastPage');
    if (!last) return;
    const link = document.querySelector(`.sidebar__nav-link[data-page-id="${last}"]`);
    if (link && link.getAttribute('href')) {
      window.location.href = link.getAttribute('href');
    }
  }

  function wireSidebarToggle() {
    const btn = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!btn || !sidebar || !overlay) return;

    function open() {
      sidebar.classList.add('is-open');
      overlay.classList.add('is-visible');
      document.body.classList.add('no-scroll');
    }
    function close() {
      sidebar.classList.remove('is-open');
      overlay.classList.remove('is-visible');
      document.body.classList.remove('no-scroll');
    }

    btn.addEventListener('click', () => {
      if (sidebar.classList.contains('is-open')) close();
      else open();
    });
    overlay.addEventListener('click', close);
  }

  function initNavigation() {
    setActiveFromPageId();
    restoreLastPageIfEmpty();
    wireSidebarToggle();
  }

  window.initNavigation = initNavigation;
})();
