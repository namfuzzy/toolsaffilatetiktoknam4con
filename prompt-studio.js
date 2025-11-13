(function () {
  'use strict';

  // [0] PHỤ LỤC PRESET (Theo đặc tả)
  // (Đã thêm 'id', 'fields', 'tabs' theo yêu cầu)
  const PRESET_DATA = [
    {
      group: "Video bán hàng (TikTok/Shorts/Reels)",
      items: [
        {
          id: "vid_aida_60s",
          name: "Hook + Script 45-60s (AIDA)",
          fields: ["product_name", "target_audience", "key_benefits", "pain_points", "unique_mechanism", "proof", "price_range", "affiliate_link", "examples"],
          required: ["product_name", "target_audience", "key_benefits"],
          tabs: ["Script", "Caption", "Hashtag", "Title"]
        },
        {
          id: "vid_compare_avsb",
          name: "So sánh A vs B",
          fields: ["product_name", "competitor", "target_audience", "key_benefits", "proof", "affiliate_link"],
          required: ["product_name", "competitor", "target_audience"],
          tabs: ["Script", "Caption", "Title"]
        },
        {
          id: "vid_objection",
          name: "Giải objection (Đập tan nghi ngờ)",
          fields: ["product_name", "target_audience", "pain_points", "key_benefits", "proof", "affiliate_link"],
          required: ["product_name", "target_audience", "pain_points"],
          tabs: ["Script", "Caption"]
        },
        {
          id: "vid_pov_review",
          name: "Review POV người dùng",
          fields: ["product_name", "key_benefits", "target_audience", "proof", "affiliate_link"],
          required: ["product_name", "key_benefits"],
          tabs: ["Script", "Caption", "Hashtag"]
        },
        {
          id: "vid_bab",
          name: "Before–After–Bridge",
          fields: ["product_name", "pain_points", "key_benefits"],
          required: ["product_name", "pain_points", "key_benefits"],
          tabs: ["Script", "Caption"]
        },
      ]
    },
    {
      group: "Xây kênh & Giải trí/Giáo dục",
      items: [
        { id: "vid_story_30s", name: "Story 30-45s", fields: ["topic", "product_name"], required: ["topic"], tabs: ["Script", "Caption"] },
        { id: "vid_tiplist_5", name: "Tip-list (5 gạch đầu dòng)", fields: ["topic", "product_name"], required: ["topic"], tabs: ["Caption", "Hashtag"] },
        { id: "vid_mythfact", name: "Myth vs Fact", fields: ["topic", "product_name"], required: ["topic"], tabs: ["Script", "Caption"] },
      ]
    },
    {
      group: "Facebook",
      items: [
        {
          id: "fb_pas",
          name: "PR mềm (PAS)",
          fields: ["product_name", "target_audience", "key_benefits", "pain_points", "proof", "affiliate_link"],
          required: ["product_name", "target_audience", "key_benefits"],
          tabs: ["Post"]
        },
        { id: "fb_mini_500", name: "Post bán hàng mini (≤500 ký tự)", fields: ["product_name", "key_benefits"], required: ["product_name", "key_benefits"], tabs: ["Post"] },
        { id: "fb_title_lead", name: "Tiêu đề + lead 2 dòng (A/B)", fields: ["product_name", "target_audience"], required: ["product_name", "target_audience"], tabs: ["Title", "Lead"] },
      ]
    },
    {
      group: "Listing/Shop",
      items: [
        { id: "shop_bullets", name: "Mô tả bullet", fields: ["product_name", "key_benefits", "specs", "proof"], required: ["product_name", "key_benefits"], tabs: ["Listing"] },
        { id: "shop_faq", name: "FAQ mua hàng", fields: ["product_name", "pain_points", "proof", "warranty"], required: ["product_name"], tabs: ["FAQ"] },
      ]
    },
    {
      group: "Nâng cao (JSON)",
      items: [
        {
          // [MỤC 3.1] Trường hợp đặc biệt VEO 3.1
          id: "json_veo_3_1",
          name: "Prompt Video VEO 3.1 (JSON)",
          fields: ["product_name", "target_audience", "key_benefits", "pain_points", "unique_mechanism", "proof", "price_range", "affiliate_link", "examples"],
          required: ["product_name", "target_audience", "key_benefits"],
          tabs: ["JSON"], // Chỉ có tab JSON
          isVeo31: true // Flag đặc biệt
        }
      ]
    }
  ];

  // [0] ĐỊNH NGHĨA TẤT CẢ FIELDS (Theo mục 2.3)
  const ALL_FIELDS = {
    product_name: { label: "Tên sản phẩm", type: "text", placeholder: "Ví dụ: Tai nghe XYZ" },
    competitor: { label: "Đối thủ (Sản phẩm B)", type: "text", placeholder: "Ví dụ: Tai nghe ABC" },
    topic: { label: "Chủ đề", type: "text", placeholder: "Ví dụ: 5 mẹo dùng iPhone" },
    target_audience: { label: "Tệp khách hàng", type: "text", placeholder: "Ví dụ: Gen Z, dân văn phòng" },
    key_benefits: { label: "Lợi ích chính (tối đa 3)", type: "textarea", placeholder: "1. Pin trâu\n2. Chống ồn tốt\n3. Giá rẻ" },
    pain_points: { label: "Nỗi đau/Vấn đề", type: "text", placeholder: "Ví dụ: Đeo tai nghe hay bị đau tai, ồn" },
    unique_mechanism: { label: "Cơ chế/Tính năng độc đáo", type: "text", placeholder: "Ví dụ: Chip AI xử lý âm thanh riêng" },
    proof: { label: "Bằng chứng/Social Proof", type: "text", placeholder: "Ví dụ: 10,000 lượt bán, KOC A đã review" },
    price_range: { label: "Phân khúc giá", type: "text", placeholder: "Ví dụ: 500k - 1 triệu" },
    affiliate_link: { label: "Link Affiliate (tùy chọn)", type: "text", placeholder: "https://short.link/xyz" },
    examples: { label: "Ví dụ tham khảo (Link/Text)", type: "textarea", placeholder: "Dán link video hoặc mô tả style bạn muốn..." },
    specs: { label: "Thông số nổi bật", type: "text", placeholder: "Ví dụ: Bluetooth 5.3, Nặng 10g" },
    warranty: { label: "Bảo hành/Đổi trả", type: "text", placeholder: "Ví dụ: 1 đổi 1 trong 30 ngày" }
  };

  // [0] Biến toàn cục cho module
  const $ = document.querySelector.bind(document);
  const $$ = document.querySelectorAll.bind(document);
  let CURRENT_PRESET = null; // Lưu preset đang chọn
  let CURRENT_FILES = []; // Lưu các file ảnh
  const MAX_FILES = 4;

  // [0] DOM Elements (Cache lại)
  const DOM = {
    // Header
    statusChip: $('#ps-status-chip'),
    statusModel: $('#ps-status-model'),
    btnNew: $('#ps-btn-new'),
    
    // Preset & Mục tiêu
    presetCard: $('#ps-preset-card'),
    presetSelect: $('#ps-preset'),
    voiceSelect: $('#ps-voice'),
    angleSelect: $('#ps-angle'),
    variantsSelect: $('#ps-variants'),
    lengthSelect: $('#ps-length'),
    
    // Fields
    fieldsCard: $('#ps-fields-card'),
    fieldsContainer: $('#ps-fields-container'),
    
    // Image Assist
    imageCard: $('#ps-image-card'),
    imageAddBtn: $('#ps-image-add-btn'),
    imageInput: $('#ps-image-input'),
    imageDropzone: $('#ps-image-dropzone'),
    imagePreviewGrid: $('#ps-image-preview-grid'),
    imageOptions: $('#ps-image-options'),
    imageOcr: $('#ps-image-ocr'),
    imageMode: $('#ps-image-mode'),
    
    // Generate
    generateBtn: $('#ps-btn-generate'),
    
    // Output
    outputContainer: $('#ps-output-container'),
    outputActions: $('#ps-output-actions'),
    outputCopyAllBtn: $('#ps-output-copy-all'),
    outputTabsNav: $('#ps-output-tabs-nav'),
    outputBody: $('#ps-output-body'),
    outputEmpty: $('#ps-output-empty'),
    outputTabsContent: $('#ps-output-tabs-content'),
    outputFooter: $('#ps-output-footer')
  };

  /**
   * [1] Khởi tạo trang
   */
  function boot() {
    console.log("Booting Prompt Studio (UI Mới)...");
    
    // Tải danh sách Preset vào dropdown (mục 2.2)
    loadPresetsIntoSelect();
    
    // Tải cài đặt đã lưu (mục 1)
    loadSavedSettings();
    
    // Gắn sự kiện (mục 2, 3, 4, 5, 6)
    bindEvents();
    
    // Cập nhật UI lần đầu
    onPresetChanged();
    updateGenerateButtonState(); // [MỤC 2.5]
    
    // Cập nhật chip trạng thái (mục 2.1)
    updateStatusChip();
  }

  /**
   * [1.1] Tải Preset vào Dropdown
   */
  function loadPresetsIntoSelect() {
    if (!DOM.presetSelect) return;
    
    DOM.presetSelect.innerHTML = '<option value="" data-i18n-key="ps.presetSelect">-- Vui lòng chọn Preset --</option>';
    
    PRESET_DATA.forEach(group => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = group.group;
      group.items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        optgroup.appendChild(option);
      });
      DOM.presetSelect.appendChild(optgroup);
    });
  }

  /**
   * [1.2] Tải cài đặt đã lưu từ KV (localStorage)
   */
  function loadSavedSettings() {
    if (!window.KV) return;
    
    DOM.presetSelect.value = KV.get('ps_preset') || '';
    DOM.voiceSelect.value = KV.get('ps_voice') || 'Chuyên gia';
    DOM.angleSelect.value = KV.get('ps_angle') || 'Giá trị';
    DOM.variantsSelect.value = KV.get('ps_variants') || '1';
    DOM.lengthSelect.value = KV.get('ps_length') || 'Vừa';
  }

  /**
   * [1.3] Gắn các sự kiện cho UI
   */
  function bindEvents() {
    // Sự kiện lưu tự động (mục 1)
    DOM.presetSelect.addEventListener('change', savePresetSettings);
    DOM.voiceSelect.addEventListener('change', savePresetSettings);
    DOM.angleSelect.addEventListener('change', savePresetSettings);
    DOM.variantsSelect.addEventListener('change', savePresetSettings);
    DOM.lengthSelect.addEventListener('change', savePresetSettings);
    
    // Sự kiện thay đổi Preset (mục 2.3)
    DOM.presetSelect.addEventListener('change', onPresetChanged);
    
    // Sự kiện Header (mục 2.1)
    DOM.statusChip.addEventListener('click', onStatusChipClick);
    DOM.btnNew.addEventListener('click', onNewClick);

    // Sự kiện Image Assist (mục 2.4)
    DOM.imageAddBtn.addEventListener('click', () => DOM.imageInput.click());
    DOM.imageInput.addEventListener('change', onFilesSelected);
    DOM.imageDropzone.addEventListener('dragover', onDragOver);
    DOM.imageDropzone.addEventListener('dragleave', onDragLeave);
    DOM.imageDropzone.addEventListener('drop', onDrop);
    DOM.imagePreviewGrid.addEventListener('click', onRemoveImageClick);

    // Sự kiện Generate (mục 2.5)
    DOM.generateBtn.addEventListener('click', onGenerateClick);
    
    // Sự kiện Validate khi gõ phím (mục 2.5)
    DOM.fieldsContainer.addEventListener('input', updateGenerateButtonState);
    
    // Sự kiện phím tắt (mục 2.5)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        DOM.generateBtn.click();
      }
    });
    
    // Sự kiện click vào Tabs kết quả (mục 2.6)
    DOM.outputTabsNav.addEventListener('click', onTabClick);
  }

  /**
   * [2] Xử lý sự kiện
   */

  // [2.1] Lưu cài đặt preset vào KV (mục 1)
  function savePresetSettings() {
    if (!window.KV) return;
    KV.set('ps_preset', DOM.presetSelect.value);
    KV.set('ps_voice', DOM.voiceSelect.value);
    KV.set('ps_angle', DOM.angleSelect.value);
    KV.set('ps_variants', DOM.variantsSelect.value);
    KV.set('ps_length', DOM.lengthSelect.value);
  }

  // [2.1] Xử lý khi chọn Preset (mục 2.3)
  function onPresetChanged() {
    const presetId = DOM.presetSelect.value;
    const allPresets = PRESET_DATA.flatMap(g => g.items);
    CURRENT_PRESET = allPresets.find(p => p.id === presetId);
    
    renderFields();
    updateGenerateButtonState();
    
    // Reset/ẩn khu vực kết quả (mục 2.6)
    DOM.outputTabsNav.innerHTML = '';
    DOM.outputTabsContent.innerHTML = '';
    DOM.outputTabsNav.style.display = 'none';
    DOM.outputActions.style.display = 'none';
    DOM.outputFooter.style.display = 'none';
    DOM.outputEmpty.style.display = 'block';
  }

  // [2.1] Xử lý click chip trạng thái (mục 2.1)
  function onStatusChipClick() {
    // Chỉ toast, không mở popup (theo yêu cầu)
    if (window.showToast) {
      window.showToast("Popup Cài đặt sẽ làm ở bước sau", "info");
    } else {
      alert("Popup Cài đặt sẽ làm ở bước sau");
    }
  }

  // [2.1] Xử lý click nút "Tạo mới" (mục 2.1)
  function onNewClick() {
    if (!confirm("Bạn có muốn xóa toàn bộ nội dung đã nhập và bắt đầu lại?")) return;
    
    DOM.presetSelect.value = '';
    DOM.voiceSelect.value = 'Chuyên gia';
    DOM.angleSelect.value = 'Giá trị';
    DOM.variantsSelect.value = '1';
    DOM.lengthSelect.value = 'Vừa';
    
    savePresetSettings(); // Lưu lại trạng thái reset
    onPresetChanged(); // Cập nhật UI (ẩn fields)
    
    // Xóa ảnh (mục 2.4)
    CURRENT_FILES = [];
    updateImagePreview();
  }

  // [2.4] Xử lý Image Assist
  function onDragOver(e) {
    e.preventDefault();
    DOM.imageDropzone.classList.add('drag-over');
  }
  function onDragLeave(e) {
    e.preventDefault();
    DOM.imageDropzone.classList.remove('drag-over');
  }
  function onDrop(e) {
    e.preventDefault();
    DOM.imageDropzone.classList.remove('drag-over');
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }
  function onFilesSelected(e) {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }
  function handleFiles(files) {
    for (const file of files) {
      if (CURRENT_FILES.length >= MAX_FILES) {
        showToast(`Chỉ được phép tải lên tối đa ${MAX_FILES} ảnh.`, "warning");
        break;
      }
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          CURRENT_FILES.push({ file, dataUrl: e.target.result });
          updateImagePreview();
        };
        reader.readAsDataURL(file);
      }
    }
    DOM.imageInput.value = ''; // Reset input
  }

  function onRemoveImageClick(e) {
    const thumb = e.target.closest('.ps-image-thumbnail');
    if (thumb) {
      const index = parseInt(thumb.dataset.index, 10);
      CURRENT_FILES.splice(index, 1);
      updateImagePreview();
    }
  }

  // [2.5] Xử lý click Generate (mục 2.5)
  function onGenerateClick() {
    // Validate
    if (DOM.generateBtn.disabled) {
      const missing = getMissingFields();
      const missingLabels = missing.map(f_id => ALL_FIELDS[f_id]?.label || f_id).join(', ');
      showToast(`Thiếu thông tin: ${missingLabels}`, "danger");
      return;
    }
    
    // Lấy tất cả input
    const inputs = getFieldValues();
    const settings = {
      preset: CURRENT_PRESET.id,
      voice: DOM.voiceSelect.value,
      angle: DOM.angleSelect.value,
      variants: parseInt(DOM.variantsSelect.value, 10),
      length: DOM.lengthSelect.value,
      images: CURRENT_FILES.length,
      ocr: DOM.imageOcr.checked,
      imageMode: DOM.imageMode.value
    };
    
    // Bắt đầu generate (Mock)
    console.log("Generating with:", { settings, inputs });
    setGenerateButtonLoading(true); // Bật spinner
    showToast("Đang tạo nội dung...", "info");

    // Giả lập gọi API (mục 7)
    setTimeout(() => {
      // Giả lập kết quả
      const mockResults = createMockResults(settings);
      
      // Hiển thị kết quả (mục 2.6)
      renderResults(mockResults);
      
      // Tắt spinner
      setGenerateButtonLoading(false);
      showToast("Đã tạo xong.", "success");
      
    }, 1500);
  }
  
  // [2.6] Xử lý click Tab
  function onTabClick(e) {
    const btn = e.target.closest('.tabs__btn');
    if (!btn) return;
    
    const tabId = btn.dataset.tab;
    
    // Cập nhật active cho nút tab
    DOM.outputTabsNav.querySelectorAll('.tabs__btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Cập nhật active cho content
    DOM.outputTabsContent.querySelectorAll('.tabs__content').forEach(c => c.classList.remove('active'));
    $(`#ps-output-tab-${tabId}`).classList.add('active');
    
    // Cập nhật nút "Copy All"
    updateCopyAllButton(tabId);
  }

  /**
   * [3] Các hàm logic phụ (Helpers)
   */

  // [3.1] Cập nhật chip trạng thái (mục 2.1)
  function updateStatusChip() {
    if (!window.KV) return;
    const model = KV.get('gemini_model') || 'N/A';
    // Đảm bảo DOM.statusModel tồn tại
    if (DOM.statusModel) {
      DOM.statusModel.textContent = model;
    } else {
      console.warn('Không tìm thấy #ps-status-model');
    }
  }

  // [3.2] Tạo HTML cho các fields (mục 2.3)
  function renderFields() {
    if (!CURRENT_PRESET) {
      DOM.fieldsContainer.innerHTML = `<div class="ps-field-placeholder" data-i18n-key="ps.fieldsPlaceholder">Vui lòng chọn một Preset ở trên...</div>`;
      // Chạy lại i18n cho placeholder
      if (window.initI18nDynamic) window.initI18nDynamic(DOM.fieldsContainer);
      return;
    }
    
    let html = '';
    const fieldsToShow = CURRENT_PRESET.fields;
    
    fieldsToShow.forEach(fieldId => {
      const fieldDef = ALL_FIELDS[fieldId];
      if (!fieldDef) return;
      
      const isRequired = CURRENT_PRESET.required.includes(fieldId);
      const label = `${fieldDef.label}${isRequired ? '*' : ''}`;
      const id = `ps-field-${fieldId}`;
      
      let fieldHtml = '';
      if (fieldDef.type === 'textarea') {
        fieldHtml = `<textarea id="${id}" class="form-control" data-field-id="${fieldId}" rows="3" placeholder="${fieldDef.placeholder || ''}"></textarea>`;
      } else {
        fieldHtml = `<input type="text" id="${id}" class="form-control" data-field-id="${fieldId}" placeholder="${fieldDef.placeholder || ''}">`;
      }
      
      html += `
        <div class="form-group" style="grid-column: 1 / -1;">
          <label for="${id}" class="form-label">${label}</label>
          ${fieldHtml}
        </div>
      `;
    });
    
    DOM.fieldsContainer.innerHTML = html;
  }
  
  // [3.3] Cập nhật UI kéo thả ảnh (mục 2.4)
  function updateImagePreview() {
    if (CURRENT_FILES.length > 0) {
      DOM.imageDropzone.style.display = 'none';
      DOM.imagePreviewGrid.style.display = 'grid';
      DOM.imageOptions.style.display = 'block';
      
      DOM.imagePreviewGrid.innerHTML = CURRENT_FILES.map((fileData, index) => `
        <div class="ps-image-thumbnail" data-index="${index}" title="${fileData.file.name}">
          <img src="${fileData.dataUrl}" alt="Preview">
          <button class="ps-image-remove-btn"><i class="ri-close-line"></i></button>
        </div>
      `).join('');
      
    } else {
      DOM.imageDropzone.style.display = 'flex';
      DOM.imagePreviewGrid.style.display = 'none';
      DOM.imageOptions.style.display = 'none';
    }
    
    // Tắt/Bật nút Thêm ảnh
    DOM.imageAddBtn.disabled = (CURRENT_FILES.length >= MAX_FILES);
  }

  // [3.4] Lấy danh sách fields còn thiếu (mục 2.5)
  function getMissingFields() {
    if (!CURRENT_PRESET) return ['preset'];
    
    const missing = [];
    const values = getFieldValues();
    
    CURRENT_PRESET.required.forEach(fieldId => {
      if (!values[fieldId]) {
        missing.push(fieldId);
      }
    });
    
    return missing;
  }
  
  // [3.4] Lấy giá trị các fields
  function getFieldValues() {
    const values = {};
    DOM.fieldsContainer.querySelectorAll('.form-control[data-field-id]').forEach(el => {
      values[el.dataset.fieldId] = el.value.trim();
    });
    return values;
  }

  // [3.4] Cập nhật trạng thái nút Generate (mục 2.5)
  function updateGenerateButtonState() {
    const missing = getMissingFields();
    
    if (missing.length > 0) {
      DOM.generateBtn.disabled = true;
      const missingLabels = missing.map(f_id => f_id === 'preset' ? 'Preset' : (ALL_FIELDS[f_id]?.label || f_id)).join(', ');
      DOM.generateBtn.title = `Thiếu thông tin: ${missingLabels}`;
    } else {
      DOM.generateBtn.disabled = false;
      DOM.generateBtn.title = 'Tạo nội dung (Ctrl+Enter)';
    }
  }

  // [3.4] Set trạng thái loading cho nút Generate
  function setGenerateButtonLoading(isLoading) {
    DOM.generateBtn.disabled = isLoading;
    if (isLoading) {
      DOM.generateBtn.innerHTML = `
        <i class="ri-loader-4-line ri-spin"></i>
        <span data-i18n-key="ps.generating">Đang tạo...</span>
      `;
    } else {
      DOM.generateBtn.innerHTML = `
        <i class="ri-magic-line"></i>
        <span data-i18n-key="ps.generate">Generate (Ctrl+Enter)</span>
      `;
    }
    // Chạy i18n cho nút
    if (window.initI18nDynamic) window.initI18nDynamic(DOM.generateBtn);
  }

  // [3.5] Tạo kết quả GIẢ (Mock) (mục 7)
  function createMockResults(settings) {
    const results = {};
    const n = settings.variants;
    
    CURRENT_PRESET.tabs.forEach(tabName => {
      results[tabName] = [];
      for (let i = 0; i < n; i++) {
        
        // [MỤC 3.1] Quy tắc VEO 3.1 (JSON)
        if (CURRENT_PRESET.isVeo31) {
          results[tabName].push({
            // Keys tiếng Anh
            "prompt": `(Mock) Kịch bản cho biến thể #${i + 1}`,
            "veo31": {
              "shotlist": ["(Mock) Cận cảnh sản phẩm", "(Mock) Người dùng trải nghiệm"],
              "product_sync": { "name": "Sản phẩm XYZ (Mock)" },
              "reviewer": {
                "nationality": "Vietnamese",
                "tone": settings.voice,
                // Value tiếng Việt
                "dialogue_example": `"Mock: Xin chào các bạn, đây là kịch bản cho biến thể ${i + 1}."`
              }
            }
          });
        } 
        // [MỤC 3.2] Quy tắc văn bản thuần
        else {
          let text = `(Mock) Đây là kết quả cho [${tabName}] - Biến thể #${i + 1} (Giọng ${settings.voice}).\n\n`;
          if (tabName === 'Script') text += "Cảnh 1: Mở đầu...\nCảnh 2: Thân bài...\nCảnh 3: Kết bài...";
          if (tabName === 'Hashtag') text = "#mock #affiliate #ketqua";
          results[tabName].push(text);
        }
      }
    });
    return results;
  }
  
  // [3.6] Hiển thị kết quả ra UI (mục 2.6)
  function renderResults(results) {
    // 1. Hiển thị các khối
    DOM.outputEmpty.style.display = 'none';
    DOM.outputTabsNav.style.display = 'flex';
    DOM.outputActions.style.display = 'block';
    DOM.outputFooter.style.display = 'block';
    
    // 2. Xóa nội dung cũ
    DOM.outputTabsNav.innerHTML = '';
    DOM.outputTabsContent.innerHTML = '';
    
    const tabs = Object.keys(results);
    
    tabs.forEach((tabName, index) => {
      const variants = results[tabName];
      const tabId = tabName.toLowerCase().replace(/[^a-z0-9]/g, '-'); // Đảm bảo ID hợp lệ
      const isActive = (index === 0);
      
      // 3. Tạo nút Tab
      DOM.outputTabsNav.innerHTML += `
        <button class="tabs__btn ${isActive ? 'active' : ''}" data-tab="${tabId}">
          ${tabName} (${variants.length})
        </button>
      `;
      
      // 4. Tạo nội dung Tab
      let contentHtml = '';
      
      // [MỤC 3.1] Quy tắc VEO 3.1 (JSON)
      if (CURRENT_PRESET.isVeo31) {
        contentHtml = variants.map((data, i) => `
          <div class="ps-result-card-json">
            <div class="ps-result-card-header">
              <span>JSON Biến thể #${i + 1}</span>
              <button class="btn btn-secondary btn-sm" onclick="copyToClipboard(this, ${JSON.stringify(JSON.stringify(data, null, 2))})">
                <i class="ri-file-copy-2-line"></i> Copy JSON
              </button>
            </div>
            <pre><code>${JSON.stringify(data, null, 2)}</code></pre>
          </div>
        `).join('');
        
        // Thêm ghi chú (mục 3.1)
        contentHtml += `<p class="ps-compliance-note" data-i18n-key="ps.jsonNote">Output is JSON. English for keys; Vietnamese only inside dialogue strings.</p>`;
      } 
      // [MỤC 3.2] Quy tắc văn bản thuần
      else {
        contentHtml = variants.map((text, i) => `
          <div class="ps-result-card">
            <div class="ps-result-card-header">
              <span>Biến thể #${i + 1}</span>
              <button class="btn btn-secondary btn-sm" onclick="copyToClipboard(this, ${JSON.stringify(text)})">
                <i class="ri-file-copy-2-line"></i> Copy
              </button>
            </div>
            <p>${text.replace(/\n/g, '<br>')}</p>
          </div>
        `).join('');
      }

      DOM.outputTabsContent.innerHTML += `
        <div class="tabs__content ${isActive ? 'active' : ''}" id="ps-output-tab-${tabId}" data-tab-name="${tabName}">
          ${contentHtml}
        </div>
      `;
    });
    
    // 5. Cập nhật nút Copy All
    if (tabs.length > 0) {
      const firstTabId = tabs[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
      updateCopyAllButton(firstTabId);
    }
    
    // Chạy i18n cho nội dung mới (nếu có key)
    if (window.initI18nDynamic) window.initI18nDynamic(DOM.outputTabsContent);
  }
  
  // [3.7] Cập nhật nút "Copy All"
  function updateCopyAllButton(activeTabId) {
    const tabContent = $(`#ps-output-tab-${activeTabId}`);
    if (!tabContent) return;
    
    const tabName = tabContent.dataset.tabName;
    DOM.outputCopyAllBtn.querySelector('span').textContent = `Copy tất cả (${tabName})`;
    
    // Gắn sự kiện click mới
    DOM.outputCopyAllBtn.onclick = () => {
      let allText = '';
      if (CURRENT_PRESET && CURRENT_PRESET.isVeo31) {
        // Copy nhiều JSON
        const codes = tabContent.querySelectorAll('pre code');
        codes.forEach((code, i) => {
          allText += `// Biến thể #${i + 1}\n${code.textContent}\n\n`;
        });
      } else {
        // Copy nhiều văn bản
        const cards = tabContent.querySelectorAll('.ps-result-card p');
        cards.forEach((p, i) => {
          allText += `--- BIẾN THỂ #${i + 1} ---\n${p.textContent.replace(/<br>/g, '\n')}\n\n`;
        });
      }
      
      copyToClipboard(DOM.outputCopyAllBtn, allText);
    }
  }

  // [3.8] Hàm helper copy (được gọi từ HTML)
  window.copyToClipboard = function(btn, text) {
    if (!navigator.clipboard) {
      showToast("Trình duyệt của bạn không hỗ trợ clipboard.", "danger");
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      const oldHtml = btn.innerHTML;
      btn.innerHTML = `<i class="ri-check-line"></i> Đã copy!`;
      setTimeout(() => { btn.innerHTML = oldHtml; }, 2000);
    }, (err) => {
      showToast("Copy thất bại: " + err, "danger");
    });
  }
  
  // [3.9] Hàm helper show toast (cần file app.js/nav.js)
  function showToast(message, type = 'success') {
    // Giả sử nav.js định nghĩa window.showToast
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      console.warn("showToast() not found. Falling back to alert.");
      alert(message);
    }
  }
  
  // [3.10] Hàm helper lấy i18n (cần file app.js/i18n.js)
  function getI18nText(key) {
    // Giả sử i18n.js định nghĩa window.getI18nText
    if (window.getI18nText) {
      return window.getI18nText(key) || `[${key}]`;
    }
    return `[${key}]`;
  }

  // Chạy khi DOM đã sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();