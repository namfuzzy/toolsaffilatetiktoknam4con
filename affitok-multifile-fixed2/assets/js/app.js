
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initI18n === 'function') initI18n();
    if (typeof initSidebar === 'function') initSidebar();
    if (typeof initThemeToggle === 'function') initThemeToggle();
    if (typeof initModals === 'function') initModals();
    if (typeof initDrawers === 'function') initDrawers();
    if (typeof initMockActions === 'function') initMockActions();
    if (typeof initStaticNavigation === 'function') initStaticNavigation();
});

        
        // Khai báo biến global cho navigation
        let globalNavigateToPage;

        // 1. Module I18n
        function getI18nText(key) {
            try {
                return key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : null, i18n);
            } catch (e) {
                console.warn(`Không tìm thấy key I18n: ${key}`);
                return null;
            }
        }

        function initI18n() {
            // Thay thế textContent
            document.querySelectorAll('[data-i18n-key]').forEach(el => {
                const key = el.dataset.i18nKey;
                let text = getI18nText(key);
                if (text !== null) {
                    if (el.dataset.i18nValue) {
                        text = text.replace('{value}', el.dataset.i18nValue);
                    }
                    el.textContent = text;
                }
            });
            // Thay thế placeholder
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.dataset.i18nPlaceholder;
                const text = getI18nText(key);
                if (text) el.placeholder = text;
            });
             // Thay thế aria-label
            document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
                const key = el.dataset.i18nArialabel;
                const text = getI18nText(key);
                if (text) el.setAttribute('aria-label', text);
            });
        }

        // 2. Module Điều hướng (SPA)
        
// removed initNavigation


        // 3. Module Sidebar (Mobile)
        let sidebar, menuToggle, sidebarOverlay;
        function initSidebar() {
            sidebar = document.getElementById('sidebar');
            menuToggle = document.getElementById('menu-toggle');
            sidebarOverlay = document.getElementById('sidebar-overlay');
            
            if(menuToggle) menuToggle.addEventListener('click', toggleSidebar);
            if(sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);
        }
        function toggleSidebar() {
            sidebar.classList.toggle('open');
            sidebarOverlay.classList.toggle('active');
        }

        // 4. Module Chế độ Sáng/Tối
        function initThemeToggle() {
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                themeToggle.addEventListener('change', () => {
                    document.body.classList.toggle('light-mode', themeToggle.checked);
                });
            }
        }
        
        // 5. Module Modals
        function initModals() {
            document.querySelectorAll('.modal__wrapper').forEach(wrapper => {
                wrapper.addEventListener('click', (e) => {
                    if (e.target === wrapper || e.target.closest('.js-modal-close')) {
                        wrapper.classList.remove('show');
                    }
                });
            });
            
            // Trigger cho modal cụ thể
            document.querySelectorAll('.js-show-modal').forEach(trigger => {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    const modalId = trigger.dataset.modal;
                    const modal = document.getElementById(`modal-${modalId}`);
                    if (modal) {
                        modal.classList.add('show');
                    } else {
                        // Fallback modal chung
                        showModal('modal.title', 'modal.actionSuccess');
                    }
                });
            });
        }
        
        function showModal(titleKey, messageKey) {
            const modalWrapper = document.getElementById('modal-wrapper');
            document.getElementById('modal-title').textContent = getI18nText(titleKey) || getI18nText('modal.title');
            document.getElementById('modal-message').textContent = getI18nText(messageKey) || getI18nText('modal.actionSuccess');
            modalWrapper.classList.add('show');
        }
        
        // 6. Module Drawers (MỚI)
        function initDrawers() {
             document.querySelectorAll('.drawer__wrapper').forEach(wrapper => {
                wrapper.addEventListener('click', (e) => {
                    if (e.target === wrapper || e.target.closest('.js-drawer-close')) {
                        wrapper.classList.remove('show');
                    }
                });
            });
            
             // Trigger cho drawer (ví dụ)
            document.querySelectorAll('.js-show-drawer').forEach(trigger => {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    const drawerId = trigger.dataset.drawer;
                    const drawer = document.getElementById(`drawer-${drawerId}`);
                    if (drawer) {
                        drawer.classList.add('show');
                    }
                });
            });
        }
        
        function showDrawer(drawerId) {
             const drawer = document.getElementById(drawerId);
             if (drawer) drawer.classList.add('show');
        }

        // 7. Module Toasts
        function showToast(messageKey, type = 'success') {
            const toastContainer = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            
            const iconClass = {
                success: 'ri-check-line',
                danger: 'ri-error-warning-line',
                warning: 'ri-alarm-warning-line'
            }[type];
            
            toast.innerHTML = `
                <i class="${iconClass}"></i>
                <span>${getI18nText(messageKey) || messageKey}</span>
            `;
            
            toastContainer.appendChild(toast);
            
            setTimeout(() => {
                toast.classList.add('toast-out');
                toast.addEventListener('animationend', () => toast.remove());
            }, 3000);
        }

        // 8. Module Mock Actions
        function initMockActions() {
            document.querySelectorAll('.js-mock-action').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Quyết định hiển thị toast hay modal
                    if (btn.closest('#page-facebook-poster') || btn.closest('#page-tiktok-uploader')) {
                        showToast('toast.uploadSuccess', 'success');
                    } else if(btn.closest('#page-accounts') || btn.closest('#modal-connect-network')) {
                        showModal('modal.title', 'modal.actionSuccess');
                        document.getElementById('modal-connect-network').classList.remove('show');
                    }
                    else {
                        showToast('toast.saveSuccess', 'success');
                    }
                });
            });
        }


function initTiktokUploader() {
            const dragArea = document.getElementById('drag-drop-area');
            const fileInput = document.getElementById('file-upload-input');
            const preview = document.getElementById('video-preview');
            const fileName = document.getElementById('video-file-name');
            const player = document.getElementById('video-preview-player');

            if (!dragArea) return;

            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dragArea.addEventListener(eventName, preventDefaults, false);
            });
            ['dragenter', 'dragover'].forEach(eventName => {
                dragArea.addEventListener(eventName, () => dragArea.classList.add('drag-over'), false);
            });
            ['dragleave', 'drop'].forEach(eventName => {
                dragArea.addEventListener(eventName, () => dragArea.classList.remove('drag-over'), false);
            });
            dragArea.addEventListener('drop', handleDrop, false);
            fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

            function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }
            function handleDrop(e) { handleFiles(e.dataTransfer.files); }
            function handleFiles(files) {
                if (files.length > 0 && files[0].type.startsWith('video/')) {
                    fileName.textContent = files[0].name;
                    player.src = URL.createObjectURL(files[0]);
                    preview.style.display = 'block';
                } else {
                    showToast('Lỗi: Vui lòng chỉ tải lên tệp video.', 'danger');
                }
            }
        }


function initAccountsPage() {
            const tableBody = document.getElementById('accounts-list-body');
            if (!tableBody || tableBody.dataset.rendered) return;
            
            MOCK_API.accounts.forEach(acc => {
                const statusKey = `status.${acc.status}`;
                const platformIcon = acc.platform === 'Facebook' ? 'ri-facebook-box-fill' : 'ri-tiktok-fill';
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${acc.name}</strong></td>
                    <td><i class="${platformIcon}"></i> ${acc.platform}</td>
                    <td><span class="status-dot ${acc.status}" data-i18n-key="${statusKey}"></span></td>
                    <td>${acc.expires}</td>
                    <td>
                        <button class="btn-icon primary" data-i18n-aria-label="Làm mới"><i class="ri-refresh-line"></i></button>
                        <button class="btn-icon danger" data-i18n-aria-label="Ngắt kết nối"><i class="ri-link-unlink-m"></i></button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
            tableBody.dataset.rendered = true; // Đánh dấu đã render
            initI18n(); // Chạy lại i18n
        }


function initLogsPage() {
            const tableBody = document.getElementById('logs-list-body');
            if (!tableBody || tableBody.dataset.rendered) return;
            
            MOCK_API.logs.forEach(log => {
                const statusClass = log.status === 'success' ? 'badge-success' : 'badge-danger';
                const statusKey = log.status === 'success' ? 'status.completed' : 'status.error';
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${log.time}</td>
                    <td>${log.platform}</td>
                    <td>${log.action}</td>
                    <td><span class="badge ${statusClass}" data-i18n-key="${statusKey}"></span></td>
                    <td>
                        <button class="btn btn-secondary btn-sm js-mock-action" data-i18n-key="common.view">Xem</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
            tableBody.dataset.rendered = true;
            initI18n();
        }


function initSettingsTabs() {
            document.querySelectorAll('.tabs__nav').forEach(tabsNav => {
                const tabButtons = tabsNav.querySelectorAll('.tabs__btn');
                const tabContentsContainer = tabsNav.nextElementSibling;
                
                tabButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        tabButtons.forEach(btn => btn.classList.remove('active'));
                        button.classList.add('active');
                        
                        const tabId = button.getAttribute('data-tab');
                        
                        // Ẩn tất cả content trong container
                        Array.from(tabContentsContainer.children).forEach(content => {
                            if (content.classList.contains('tabs__content')) {
                                content.classList.remove('active');
                            }
                        });
                        
                        // Hiển thị content tương ứng
                        const targetContent = tabContentsContainer.querySelector(`#tab-${tabId}`);
                        if (targetContent) {
                            targetContent.classList.add('active');
                        }
                    });
                });
            });
        }


function initAccordion() {
            const accordion = document.getElementById('faq-accordion');
            if (accordion) {
                accordion.addEventListener('click', (e) => {
                    const header = e.target.closest('.accordion__header');
                    if (!header) return;
                    
                    const content = header.nextElementSibling;
                    header.classList.toggle('active');
                    if (header.classList.contains('active')) {
                        content.style.maxHeight = content.scrollHeight + "px";
                    } else {
                        content.style.maxHeight = null;
                    }
                });
            }
        }


// Render bảng Chiến dịch (Campaigns)
        function initAffCampaignsPage() {
            const tableBody = document.getElementById('aff-campaigns-list-body');
            if (!tableBody || tableBody.dataset.rendered) return;
            
            MOCK_API.affCampaigns.forEach(c => {
                const statusKey = `status.${c.status}`;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${c.name}</strong></td>
                    <td>${c.network}</td>
                    <td><span class="status-dot ${c.status}" data-i18n-key="${statusKey}"></span></td>
                    <td>${c.payout}</td>
                    <td>${c.expires}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm js-show-drawer" data-drawer="campaign-details" data-i18n-key="common.view">Xem</button>
                        <button class="btn-icon primary js-show-link-builder" data-i18n-aria-label="Lấy Link"><i class="ri-links-line"></i></button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
            tableBody.dataset.rendered = true;
            initI18n();
            
            // Gán sự kiện cho các nút vừa tạo
            tableBody.querySelectorAll('.js-show-drawer').forEach(btn => btn.addEventListener('click', () => showDrawer('drawer-campaign-details')));
            tableBody.querySelectorAll('.js-show-link-builder').forEach(btn => btn.addEventListener('click', () => globalNavigateToPage('affiliate-links')));
        }
        
        // Render bảng Báo cáo (Reports)
        function initAffReportsPage() {
             const tableBody = document.getElementById('aff-reports-list-body');
            if (!tableBody || tableBody.dataset.rendered) return;
            
            MOCK_API.affReports.forEach(r => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${r.date}</td>
                    <td>${r.clicks.toLocaleString()}</td>
                    <td>${r.leads}</td>
                    <td>${r.approvals}</td>
                    <td>${r.rejects}</td>
                    <td><strong>$${r.revenue.toFixed(2)}</strong></td>
                `;
                tableBody.appendChild(tr);
            });
            tableBody.dataset.rendered = true;
        }
        
        // Render bảng Thanh toán (Payouts)
        function initAffPayoutsPage() {
             const tableBody = document.getElementById('aff-payouts-list-body');
            if (!tableBody || tableBody.dataset.rendered) return;
            
            MOCK_API.affPayouts.forEach(p => {
                const statusKey = `status.${p.status}`;
                const statusClass = p.status === 'completed' ? 'badge-success' : 'badge-warning';
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${p.date}</td>
                    <td><strong>$${p.amount.toFixed(2)}</strong></td>
                    <td>${p.method}</td>
                    <td><span class="badge ${statusClass}" data-i18n-key="${statusKey}"></span></td>
                `;
                tableBody.appendChild(tr);
            });
            tableBody.dataset.rendered = true;
            initI18n();
        }
        
        // Render bảng Mạng (Networks)
        function initAffNetworksPage() {
             const tableBody = document.getElementById('aff-networks-list-body');
            if (!tableBody || tableBody.dataset.rendered) return;
            
            MOCK_API.affNetworks.forEach(n => {
                const statusKey = `status.${n.status}`;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${n.name}</strong></td>
                    <td>${n.vertical}</td>
                    <td><span class="status-dot ${n.status}" data-i18n-key="${statusKey}"></span></td>
                    <td>
                        <button class="btn-icon primary" data-i18n-aria-label="Làm mới"><i class="ri-refresh-line"></i></button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
            tableBody.dataset.rendered = true;
            initI18n();
        }
        
        // Logic cho các nút "Chèn Link Affiliate"
        function initAffLinkBuilder() {
            document.querySelectorAll('.js-show-link-builder').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    globalNavigateToPage('affiliate-links');
                    
                    // (Nâng cao) Tự động điền SubID
                    const form = document.getElementById('page-affiliate-links');
                    if (btn.closest('#page-facebook-poster')) {
                        form.querySelector('#aff-sub1').value = 'facebook';
                        form.querySelector('#aff-sub2').value = 'fb_post_1';
                    } else if (btn.closest('#page-tiktok-uploader')) {
                        form.querySelector('#aff-sub1').value = 'tiktok';
                        form.querySelector('#aff-sub2').value = 'tk_video_1';
                    }
                });
            });
        }


function initStaticNavigation() {
    const currentPage = window.location.pathname.split('/').pop();
    const pageName = currentPage === '' || currentPage === 'index.html'
        ? 'dashboard'
        : currentPage.replace('.html', '');
    const link = document.querySelector('.sidebar__nav-link[data-page-id="' + pageName + '"]');
    if (link) {
        link.classList.add('active');
        const text = link.querySelector('span') ? link.querySelector('span').textContent.trim() : pageName;
        const bc = document.getElementById('breadcrumb-current');
        if (bc) bc.textContent = text;
        document.title = 'Affitok Win - ' + text;
    }
}

