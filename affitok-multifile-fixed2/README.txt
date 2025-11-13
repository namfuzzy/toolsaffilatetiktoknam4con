Affitok Patch Kit — Chuẩn hoá tất cả *.html

Chức năng:
1) Thêm/Sửa `window.__PAGE_ID__ = '<ten-trang>';`
   - Mặc định PAGE_ID = tên file (không .html), ví dụ accounts.html -> 'accounts'
   - Riêng index.html -> 'dashboard'
2) Đảm bảo đủ 4 script core (không chèn trùng):
   <script src="./assets/js/core/i18n.js"></script>
   <script src="./assets/js/core/theme.js"></script>
   <script src="./assets/js/core/nav.js"></script>
   <script src="./assets/js/core/mock-actions.js"></script>
3) Luôn tạo file backup .bak trước khi ghi chèn.

Cách dùng (Windows):
- Giải nén kit này vào THƯ MỤC CÓ CÁC FILE .html
- Double-click: run-patch.bat  (sẽ chạy PowerShell tự động)
- Xong có thể chạy: test-all.bat để kiểm tra nhanh

Ghi chú:
- Bộ kiểm tra chỉ quét nội dung file (không cần mở web qua HTTP).
- Nếu muốn chạy qua HTTP: `python -m http.server 5173` rồi truy cập http://localhost:5173
