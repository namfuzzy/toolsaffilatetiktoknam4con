(function () {
  'use strict';

  // [0] PHỤ LỤC PRESET (Theo đặc tả)
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

  
  // [BƯỚC 2] === BẮT ĐẦU NÂNG CẤP PROMPT & SCHEMA ===

  /**
   * [BƯỚC 2.1] SUPER SYSTEM PROMPT (VEO 3.1)
   * Đây là "Super System Prompt" (Prompt 2) mà bạn đã cung cấp.
   */
  const VEO_3_1_SYSTEM_PROMPT = `
SYSTEM PROMPT — “VEO 3.1 CREATIVE DIRECTOR FOR HIGH‑CONVERSION AFFILIATE VIDEO (EN keys + VI creative) — PLUS COMPAT LAYER”

ROLE
You are a senior Creative Director specialized in Google VEO 3.1 for short‑form, high‑conversion affiliate videos.

MISSION
Transform a compact set of user inputs into ONE (1) production‑ready VEO 3.1 video script encoded as a single JSON object. The JSON must combine:
• rigorous cinematography/audio control,
• proven conversion frameworks (PAS/AIDA),
• affiliate compliance for US/EU/JP/KR/VN,
• and a compatibility layer that includes \`veo_prompt_english\` and \`shot_list\` as requested.

OUTPUT RULES (STRICT)
1) Return exactly ONE JSON object. No prose, no Markdown, no comments.
2) Bilingual Rule (VERY IMPORTANT):
   - All keys and all technical descriptions MUST be in English.
   - Only viewer‑facing creative values (Vietnamese copy for VO, captions, scene narratives, titles, CTAs) MUST be in Vietnamese.
   - Do NOT embed Vietnamese text inside any English technical field. If needed, reference the Vietnamese line via “see voiceover_vi”.
3) JSON must be structurally valid. No trailing commas. Use seconds for timing. Sum of shot durations must equal total_duration_sec ±0.5s.
4) Advertising must be truthful, brand‑safe, non‑deceptive. Avoid unverifiable claims.

INPUT CONTRACT (UserPrompt)
(AI sẽ nhận UserPrompt_VI_COMPAT (đã được định dạng) từ hàm buildRealPrompts)

OPERATING PRINCIPLES
A) Pacing & shot math
- For ≤30s: target 6–9 shots; avg 3–5s.
- For 31–60s: target 7–10 shots; avg 5–9s.
- Allocate more time to SOLUTION/PROOF than PROBLEM. Ensure sum of durations ≈ total_duration_sec (±0.5s).

B) Framework mapping & roles
- Always start with a strong HOOK (Shot 1; first 3 seconds) and end with a clear CTA (final shot).
- PAS mapping: HOOK → PROBLEM → AGITATE → SOLUTION → PROOF → BENEFIT → OFFER/URGENCY → CTA.
- AIDA mapping: HOOK/Attention → Interest → Desire (benefits+proof) → Action (CTA).
- Respect format_preference:
  • unboxing: reveal → contents → first‑touch → key features → quick test → CTA
  • product_demo: pain → feature 1/2/3 in action → before/after → CTA
  • comparison: need → criteria → side‑by‑side → verdict → CTA
  • pov_review: first‑person usage → candid reactions → measurable payoff → CTA
  • problem_solution: relatable struggle → amplify cost → solution demo → CTA

C) Cinematography & scene control (ENGLISH technical fields)
- For each shot specify precise, film‑grade directives: camera, lighting, color_grade, effects, transition, vfx_guidance, ar_safe_zones, fps, resolution, aspect_ratio.
- Also produce a one‑line aggregator per shot named \`veo_prompt_english\` (pure English).

D) Consistency controls (ENGLISH technical; VN names allowed in creative fields)
- Bind reference assets in “consistency.references” (product/person/logo/style).
- Define recurring characters with stable attributes.

E) Audio & rhythm (ENGLISH technical; creative lines in VI)
- globals.music: {mood, bpm_range, instrumentation, intensity_curve, timing_beats_sec[]}
- Per shot define: sfx (timed), music_cue, voiceover_vi (Vietnamese), on_screen_text_vi (concise).

F) Affiliate compliance (region‑aware)
- If affiliate_link exists:
  • Place clear Vietnamese disclosure in Shot 1 (≤3s visible) and repeat near CTA.
  • Auto‑append hashtags: #affiliate, #quangcao; add #ad/#sponsored for US/EU when applicable.
- Ensure disclosure is clear & conspicuous.

G) Platform tailoring
- “tiktok/reels/shorts”: 9:16, fast cuts, safe zones, high legibility (≤18 chars/line).
- “youtube” (longer): can use 16:9, slightly longer beats, deeper proof.

DEFAULTS
(AI sẽ nhận các default này từ UserPrompt_VI_COMPAT)

REQUIRED JSON SHAPE (EN keys; VI creative values where *_vi)
${"/* (SCHEMA ĐÃ ĐƯỢC CHUYỂN SANG HÀM getVeo31Schema()) */"}

ALGORITHM & GENERATION STEPS
(AI sẽ tự thực hiện các bước này khi nhận prompt)

TECHNICAL VOCAB (examples to use in ENGLISH technical fields)
- camera.shot_size: “macro”, “CU”, “MCU”, “WS”
- camera.angle: “low‑angle”, “top‑down”, “eye‑level”, “Dutch tilt”
- camera.movement: “dolly‑in”, “slider lateral”, “handheld jitter 5%”, “drone‑style orbit”
- lighting.setup: “softbox key 45°”, “neon practicals”, “golden hour backlight”, “studio high‑key”
- effects: “slow_motion (2x)”, “speed_ramp”, “hyperlapse”, “match_cut”, “lens flare”
- transition: “hard_cut_on_beat”, “whip_pan”, “match_cut_on_shape”

WHAT TO DO NOW
Generate ONE (1) JSON object conforming to the “REQUIRED JSON SHAPE” (đã được cung cấp trong generationConfig.responseSchema).
Output ONLY the JSON object. No explanations, no Markdown.
  `;

  /**
   * [BƯỚC 2.2] SUPER SCHEMA (VEO 3.1)
   * Đây là cấu trúc JSON (REQUIRED JSON SHAPE) từ Prompt 2.
   */
  function getVeo31Schema() {
    return {
      type: 'object',
      properties: {
        "version": { "type": "string", "description": "e.g., 'veo_affiliate_schema_1.1'" },
        "metadata": {
          "type": "object",
          "properties": {
            "title_vi": { "type": "string" },
            "logline_vi": { "type": "string" },
            "platform": { "type": "string" },
            "format": { "type": "string" },
            "framework": { "type": "string" },
            "total_duration_sec": { "type": "number" },
            "aspect_ratio": { "type": "string" },
            "fps": { "type": "number" },
            "resolution": { "type": "string" },
            "region": { "type": "array", "items": { "type": "string" } },
            "product_name": { "type": "string" },
            "inputs_used": { "type": "object" }
          }
        },
        "consistency": {
          "type": "object",
          "properties": {
            "references": { "type": "array", "items": { "type": "object", "properties": { "id": { "type": "string" }, "role": { "type": "string" }, "src": { "type": "string" }, "description": { "type": "string" } } } },
            "characters": { "type": "array", "items": { "type": "object", "properties": { "id": { "type": "string" }, "name_vi": { "type": "string" }, "description": { "type": "string" }, "keep_consistent": { "type": "boolean" } } } }
          }
        },
        "globals": {
          "type": "object",
          "properties": {
            "camera_style": { "type": "string" },
            "lighting_style": { "type": "string" },
            "color_grade": { "type": "string" },
            "art_direction": { "type": "string" },
            "music": { "type": "object", "properties": { "mood": { "type": "string" }, "bpm_range": { "type": "string" }, "instrumentation": { "type": "string" }, "intensity_curve": { "type": "string" }, "timing_beats_sec": { "type": "array", "items": { "type": "number" } } } },
            "subtitle_style": { "type": "object", "properties": { "font_pref": { "type": "string" }, "size_rel": { "type": "number" }, "position": { "type": "string" }, "safe_zone": { "type": "number" } } },
            "safety_notes": { "type": "string" }
          }
        },
        "affiliate": {
          "type": "object",
          "properties": {
            "affiliate_link": { "type": "string" },
            "disclosure_vo_vi": { "type": "string" },
            "disclosure_onscreen_vi": { "type": "string" },
            "hashtags": { "type": "array", "items": { "type": "string" } },
            "cta_text_vi": { "type": "string" },
            "cta_button_vi": { "type": "string" }
          }
        },
        "optimization": {
          "type": "object",
          "properties": {
            "hook_variations_vi": { "type": "array", "items": { "type": "string" } },
            "thumbnail_prompts": { "type": "array", "items": { "type": "string" } },
            "a_b_testing_notes": { "type": "string" }
          }
        },
        "shotlist": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": { "type": "string" },
              "shot_id": { "type": "number" },
              "role": { "type": "string" },
              "script_section": { "type": "string" },
              "duration_sec": { "type": "number" },
              "duration_seconds": { "type": "number" },
              "camera": { "type": "string" },
              "lighting": { "type": "string" },
              "color_grade": { "type": "string" },
              "effects": { "type": "array", "items": { "type": "string" } },
              "transition": { "type": "string" },
              "vfx_guidance": { "type": "string" },
              "ar_safe_zones": { "type": "object", "properties": { "title_safe": { "type": "number" }, "caption_safe": { "type": "number" } } },
              "scene_narrative_vi": { "type": "string" },
              "scene_description_vietnamese": { "type": "string" },
              "on_screen_text_vi": { "type": "string" },
              "voiceover_vi": { "type": "string" },
              "sfx": { "type": "string" },
              "music_cue": { "type": "string" },
              "audio_cue": { "type": "string" },
              "veo_prompt_english": { "type": "string" },
              "first_frame": { "type": "string" },
              "last_frame": { "type": "string" }
            }
          }
        },
        "post": {
          "type": "object",
          "properties": {
            "capcut_notes": { "type": "string" },
            "safe_export": { "type": "string" },
            "distribution": { "type": "object", "properties": { "title_vi": { "type": "string" }, "description_vi": { "type": "string" }, "hashtags": { "type": "array", "items": { "type": "string" } } } }
          }
        },
        // Lớp Tương thích
        "video_title": { "type": "string" },
        "duration_seconds": { "type": "number" },
        "compliance_hashtags": { "type": "array", "items": { "type": "string" } },
        "shot_list": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "shot_id": { "type": "number" },
              "duration_seconds": { "type": "number" },
              "scene_description_vietnamese": { "type": "string" },
              "veo_prompt_english": { "type": "string" },
              "script_section": { "type": "string" }
            }
          }
        }
      },
      // Yêu cầu các trường quan trọng nhất
      "required": ["version", "metadata", "globals", "shotlist", "post"]
    };
  }

  /**
   * [BƯỚC 2.3] STANDARD SYSTEM PROMPT (Cho các preset khác)
   * Đây là prompt chuẩn (đã có tải knowledge)
   */
  const STANDARD_SYSTEM_PROMPT_TEMPLATE = `
Bạn là một chuyên gia sáng tạo nội dung (Content Creator) và Affiliate Marketer bậc thầy tại Việt Nam.
Giọng điệu (Tone of voice) của bạn là: {{voice}}.
Góc tiếp cận (Angle) của bạn là: {{angle}}.
Độ dài mong muốn: {{length}}.
Số lượng biến thể (A/B testing) cần tạo: {{variants}}.

{{knowledge}}

Tuyệt đối tuân thủ các quy tắc tuân thủ (compliance) sau:
- Ưu tiên lợi ích (benefits) trước tính năng (features).
- Hook (câu mở đầu) phải thật hấp dẫn trong 3-5 giây.
- CTA (kêu gọi hành động) phải rõ ràng.
- Không cam kết, tuyên bố (claim) quá đà, đặc biệt về y tế, tài chính.
- Luôn thêm hashtag #quangcao hoặc #affiliate khi phù hợp.
`;

  /**
   * [BƯỚC 2.4] STANDARD SCHEMA (Cho các preset khác)
   * Tự động tạo schema đơn giản dựa trên tabs và số biến thể.
   */
  function getStandardSchema(tabs, variants) {
    const properties = {};
    tabs.forEach(tabName => {
      const key = tabName.toLowerCase();
      properties[key] = {
        "type": "array",
        "description": `Một mảng (array) chứa ${variants} biến thể (string) cho ${tabName}`,
        "items": { "type": "string" }
      };
    });

    return {
      "type": "object",
      "properties": properties,
      "required": Object.keys(properties) // Yêu cầu trả về tất cả các tab
    };
  }
  
  // === KẾT THÚC NÂNG CẤP PROMPT & SCHEMA ===


  /**
   * [1] Khởi tạo trang
   */
  function boot() {
    console.log("Booting Prompt Studio (v2 - Rerouted)...");
    
    loadPresetsIntoSelect();
    loadSavedSettings();
    bindEvents();
    onPresetChanged();
    updateGenerateButtonState(); 
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
    DOM.presetSelect.addEventListener('change', savePresetSettings);
    DOM.voiceSelect.addEventListener('change', savePresetSettings);
    DOM.angleSelect.addEventListener('change', savePresetSettings);
    DOM.variantsSelect.addEventListener('change', savePresetSettings);
    DOM.lengthSelect.addEventListener('change', savePresetSettings);
    
    DOM.presetSelect.addEventListener('change', onPresetChanged);
    
    // [SỬA LỖI] Không gán sự kiện click cho statusChip
    // DOM.statusChip.addEventListener('click', onStatusChipClick);
    
    DOM.btnNew.addEventListener('click', onNewClick);

    DOM.imageAddBtn.addEventListener('click', () => DOM.imageInput.click());
    DOM.imageInput.addEventListener('change', onFilesSelected);
    DOM.imageDropzone.addEventListener('dragover', onDragOver);
    DOM.imageDropzone.addEventListener('dragleave', onDragLeave);
    DOM.imageDropzone.addEventListener('drop', onDrop);
    DOM.imagePreviewGrid.addEventListener('click', onRemoveImageClick);

    DOM.generateBtn.addEventListener('click', onGenerateClick);
    DOM.fieldsContainer.addEventListener('input', updateGenerateButtonState);
    
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        DOM.generateBtn.click();
      }
    });
    
    DOM.outputTabsNav.addEventListener('click', onTabClick);
  }

  /**
   * [2] Xử lý sự kiện
   */

  function savePresetSettings() {
    if (!window.KV) return;
    KV.set('ps_preset', DOM.presetSelect.value);
    KV.set('ps_voice', DOM.voiceSelect.value);
    KV.set('ps_angle', DOM.angleSelect.value);
    KV.set('ps_variants', DOM.variantsSelect.value);
    KV.set('ps_length', DOM.lengthSelect.value);
  }

  function onPresetChanged() {
    const presetId = DOM.presetSelect.value;
    const allPresets = PRESET_DATA.flatMap(g => g.items);
    CURRENT_PRESET = allPresets.find(p => p.id === presetId);
    
    renderFields();
    updateGenerateButtonState();
    
    DOM.outputTabsNav.innerHTML = '';
    DOM.outputTabsContent.innerHTML = '';
    DOM.outputTabsNav.style.display = 'none';
    DOM.outputActions.style.display = 'none';
    DOM.outputFooter.style.display = 'none';
    DOM.outputEmpty.style.display = 'block';
  }

  // [SỬA LỖI] Hàm này không cần nữa vì settings-mini.js đã xử lý
  // function onStatusChipClick() { ... }

  function onNewClick() {
    if (!confirm("Bạn có muốn xóa toàn bộ nội dung đã nhập và bắt đầu lại?")) return;
    
    DOM.presetSelect.value = '';
    DOM.voiceSelect.value = 'Chuyên gia';
    DOM.angleSelect.value = 'Giá trị';
    DOM.variantsSelect.value = '1';
    DOM.lengthSelect.value = 'Vừa';
    
    savePresetSettings(); 
    onPresetChanged(); 
    
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

  // [BƯỚC 3] === LOGIC GENERATE ĐÃ ĐƯỢC NÂNG CẤP (ROUTING) ===
  async function onGenerateClick() {
    // 1. Validate (Kiểm tra)
    if (DOM.generateBtn.disabled) {
      const missing = getMissingFields();
      const missingLabels = missing.map(f_id => ALL_FIELDS[f_id]?.label || f_id).join(', ');
      showToast(`Thiếu thông tin: ${missingLabels}`, "danger");
      return;
    }
    
    // 2. Lấy tất cả input
    const inputs = getFieldValues();
    const settings = {
      presetId: CURRENT_PRESET.id,
      presetName: CURRENT_PRESET.name,
      voice: DOM.voiceSelect.value,
      angle: DOM.angleSelect.value,
      variants: parseInt(DOM.variantsSelect.value, 10),
      length: DOM.lengthSelect.value,
      images: CURRENT_FILES.length,
      ocr: DOM.imageOcr.checked,
      imageMode: DOM.imageMode.value
    };
    
    // 3. Lấy cấu hình API (Key, Proxy, Model)
    const apiConfig = {
        apiKey: window.KV?.get('gemini_key', ''),
        proxy: window.KV?.get('proxy_url', ''),
        model: window.KV?.get('gemini_model', 'gemini-2.5-pro') 
    };

    if (!apiConfig.apiKey || !apiConfig.proxy) {
        showToast("Thiếu API Key hoặc GAS Proxy URL. Vui lòng nhấn ⚙️ để cài đặt.", "danger");
        return;
    }

    // 4. Bắt đầu generate
    console.log("Generating with (REAL API):", { settings, inputs, apiConfig });
    setGenerateButtonLoading(true);
    showToast("Đang tạo nội dung...", "info");
    DOM.outputEmpty.style.display = 'none';
    DOM.outputTabsNav.style.display = 'none';
    DOM.outputTabsContent.innerHTML = `<p style="padding: 1rem;">Đang kết nối với ${apiConfig.model}...</p>`;


    try {
        // [BƯỚC 3.1] Tải knowledge (luôn luôn)
        showToast("Đang tải kiến thức nền (knowledge)...", "info");
        const knowledge = await loadAffiliateKnowledge();
        if (knowledge) {
            console.log("Đã tải xong knowledge:", knowledge);
        }

        // [BƯỚC 3.2] LOGIC ĐIỀU HƯỚNG (ROUTING)
        let systemPrompt;
        let userPrompt;
        let schema;

        if (CURRENT_PRESET.isVeo31) {
            // == TRƯỜNG HỢP 1: VEO 3.1 ==
            console.log("Routing: VEO 3.1 Preset");
            
            // Dùng "Super System Prompt"
            systemPrompt = VEO_3_1_SYSTEM_PROMPT; 
            
            // Xây dựng UserPrompt tương thích với Prompt 2
            userPrompt = buildVeo31UserPrompt(inputs, settings, knowledge);
            
            // Dùng "Super Schema"
            schema = getVeo31Schema();
            
        } else {
            // == TRƯỜNG HỢP 2: PRESET CHUẨN ==
            console.log("Routing: Standard Preset");
            
            // Dùng "Standard System Prompt"
            systemPrompt = buildStandardSystemPrompt(knowledge, settings); 
            
            // Dùng "Standard User Prompt"
            userPrompt = buildStandardUserPrompt(inputs, settings);
            
            // Dùng "Standard Schema"
            schema = getStandardSchema(CURRENT_PRESET.tabs, settings.variants);
        }

        // 7. Gọi API (gemini.js v2 đã được nâng cấp)
        const result = await window.GeminiService.generateJSON({
            system: systemPrompt,
            input: userPrompt,
            schema: schema, // gemini.js v2 sẽ tự động bật JSON mode
            
            model: apiConfig.model,
            apiKey: apiConfig.apiKey,
            proxy: apiConfig.proxy,
            
            temperature: 0.5, 
            maxOutputTokens: 2048,
        });

        console.log("API Result:", result);

        // 8. Xử lý kết quả
        let finalResults = {};
        if (CURRENT_PRESET.isVeo31) {
            // Kết quả VEO 3.1 (đã có lớp tương thích)
            // Lấy `shot_list` từ lớp tương thích để render
            finalResults['JSON'] = [result]; 
            
            // Cố gắng render các tab khác nếu có trong lớp tương thích
            // (Thêm tab 'Script' từ 'shot_list' để dễ xem)
            if (result.shot_list && Array.isArray(result.shot_list)) {
                 finalResults['Script'] = result.shot_list.map(s => 
                    `[${s.script_section || 'SHOT'}] (Duration: ${s.duration_seconds}s)\n` + 
                    `Kỹ thuật (EN): ${s.veo_prompt_english}\n` +
                    `Mô tả (VI): ${s.scene_description_vietnamese}`
                 );
            }

        } else {
            // Kết quả Standard (đã được ép-schema)
            let foundByTabs = false;
            CURRENT_PRESET.tabs.forEach(tabName => {
                const key = tabName.toLowerCase();
                if (result[key]) {
                    const variants = Array.isArray(result[key]) ? result[key] : [String(result[key])];
                    finalResults[tabName] = variants;
                    foundByTabs = true;
                }
            });

            // Fallback (nếu AI không tuân thủ schema)
            if (!foundByTabs) {
                const rawText = result.raw || JSON.stringify(result);
                CURRENT_PRESET.tabs.forEach(tabName => {
                    finalResults[tabName] = [ `(AI không tuân thủ schema, kết quả thô):\n${rawText}` ];
                });
            }
        }

        // 9. Hiển thị kết quả
        renderResults(finalResults);
        showToast("Đã tạo xong.", "success");

    } catch (err) {
        console.error("Lỗi khi gọi API thật:", err);
        showToast(`Lỗi: ${err.message}`, "danger");
        DOM.outputTabsContent.innerHTML = `<p style="padding: 1rem; color: var(--danger);">Lỗi: ${err.message}</p>`;
    } finally {
        // 10. Tắt spinner
        setGenerateButtonLoading(false);
    }
  }
  
  // [2.6] Xử lý click Tab
  function onTabClick(e) {
    const btn = e.target.closest('.tabs__btn');
    if (!btn) return;
    
    const tabId = btn.dataset.tab;
    
    DOM.outputTabsNav.querySelectorAll('.tabs__btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    DOM.outputTabsContent.querySelectorAll('.tabs__content').forEach(c => c.classList.remove('active'));
    $(`#ps-output-tab-${tabId}`).classList.add('active');
    
    updateCopyAllButton(tabId);
  }

  /**
   * [3] Các hàm logic phụ (Helpers)
   */

  // [3.1] Cập nhật chip trạng thái (mục 2.1)
  function updateStatusChip() {
    if (!window.KV) return;
    const model = KV.get('gemini_model') || 'N/A';
    if(DOM.statusModel) {
        DOM.statusModel.textContent = model;
    } else {
        console.warn('#ps-status-model not found');
    }
  }

  // [3.2] Tạo HTML cho các fields (mục 2.3)
  function renderFields() {
    if (!CURRENT_PRESET) {
      DOM.fieldsContainer.innerHTML = `<div class="ps-field-placeholder" data-i18n-key="ps.fieldsPlaceholder">Vui lòng chọn một Preset ở trên...</div>`;
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
  }

  // [BƯỚC 3] === TÁCH HÀM XÂY DỰNG PROMPT ===

  // [3.5] Hàm tải knowledge
  async function loadAffiliateKnowledge() {
    try {
      const res = await fetch('./assets/mock/affiliate-knowledge.json', { cache: 'no-cache' });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('[PromptStudio] Không tải được affiliate-knowledge.json', e);
      return null;
    }
  }

  // [3.5] Xây dựng STANDARD System Prompt (có knowledge)
  function buildStandardSystemPrompt(aff, settings) {
    let knowledgeTxt = '';
    
    if (aff) {
        const blocks = ["\nBẠN PHẢI TUÂN THỦ CÁC KIẾN THỨC NỀN SAU:"];
        if (aff.guidelines?.length) {
            blocks.push('Guidelines:\n- ' + aff.guidelines.map(g => `${g.title}: ${g.points.join('; ')}`).join('\n- '));
        }
        if (aff.compliance?.length) {
            blocks.push('Compliance:\n- ' + aff.compliance.join('\n- '));
        }
        knowledgeTxt = blocks.join('\n');
    }
    
    return STANDARD_SYSTEM_PROMPT_TEMPLATE
        .replace('{{voice}}', settings.voice)
        .replace('{{angle}}', settings.angle)
        .replace('{{length}}', settings.length)
        .replace('{{variants}}', settings.variants)
        .replace('{{knowledge}}', knowledgeTxt);
  }

  // [3.5] Xây dựng STANDARD User Prompt
  function buildStandardUserPrompt(inputs, settings) {
    return `
HÃY THỰC HIỆN YÊU CẦU SAU:
1.  **Preset (Công thức):** ${CURRENT_PRESET.name}
2.  **Thông tin đầu vào:**
    ${
      Object.entries(inputs)
        .filter(([key, value]) => value) // Chỉ lấy các trường có giá trị
        .map(([key, value]) => `    - ${ALL_FIELDS[key]?.label || key}: ${value.replace(/\n/g, '\n    ')}`)
        .join('\n')
    }
3.  **Yêu cầu đầu ra:**
    Trả về kết quả dưới dạng JSON với các keys là: ${CURRENT_PRESET.tabs.map(t => `"${t.toLowerCase()}"`).join(', ')}.
    Giá trị (value) của mỗi key phải là một mảng (array) chứa ${settings.variants} biến thể (string).
    `;
  }
  
  // [3.5] Xây dựng VEO 3.1 User Prompt (tương thích Prompt 2)
  function buildVeo31UserPrompt(inputs, settings, knowledge) {
      
      // Chuyển đổi độ dài (Ngắn/Vừa/Dài) thành giây
      let duration_sec = 30;
      if (settings.length === 'Ngắn') duration_sec = 30;
      if (settings.length === 'Vừa') duration_sec = 45;
      if (settings.length === 'Dài') duration_sec = 60;
      
      // Tạo một object input tương thích với "INPUT CONTRACT" của Super Prompt
      const userPromptObject = {
          product_name: inputs.product_name || '',
          category: CURRENT_PRESET.name, // Dùng tạm
          core_benefits: (inputs.key_benefits || '').split('\n').filter(Boolean),
          differentiators: (inputs.unique_mechanism || '').split('\n').filter(Boolean),
          target_audience: inputs.target_audience || '',
          primary_pain_points: (inputs.pain_points || '').split('\n').filter(Boolean),
          platform: 'shorts', // Mặc định
          desired_length_sec: duration_sec,
          aspect_ratio: '9:16',
          tone: settings.voice,
          format_preference: 'problem_solution', // Mặc định
          affiliate_link: inputs.affiliate_link || null,
          price_or_offer: inputs.price_range || '',
          proof_points: (inputs.proof || '').split('\n').filter(Boolean),
          country_or_region: ['VN'],
          hook_variations: settings.variants || 1,
          framework_preference: (inputs.pain_points ? 'PAS' : 'AIDA'), // Tự động chọn
      };
      
      // Chuyển đổi object thành chuỗi markdown mà AI có thể đọc
      return `
HÃY XỬ LÝ YÊU CẦU UserPrompt SAU (đã được chuẩn hóa):

${
  Object.entries(userPromptObject)
    .filter(([key, value]) => value && (!Array.isArray(value) || value.length > 0))
    .map(([key, value]) => `* ${key}: ${Array.isArray(value) ? value.join('; ') : value}`)
    .join('\n')
}

Ghi chú: Hãy dùng kiến thức affiliate (nếu có) được cung cấp trong System Prompt.
      `;
  }

  // [3.6] Hiển thị kết quả ra UI (mục 2.6)
  function renderResults(results) {
    DOM.outputEmpty.style.display = 'none';
    DOM.outputTabsNav.style.display = 'flex';
    DOM.outputActions.style.display = 'block';
    DOM.outputFooter.style.display = 'block';
    
    DOM.outputTabsNav.innerHTML = '';
    DOM.outputTabsContent.innerHTML = '';
    
    const tabs = Object.keys(results);
    
    tabs.forEach((tabName, index) => {
      const variants = Array.isArray(results[tabName]) ? results[tabName] : [results[tabName]]; 
      const tabId = tabName.toLowerCase().replace(/[^a-z0-9]/g, '-'); 
      const isActive = (index === 0);
      
      DOM.outputTabsNav.innerHTML += `
        <button class="tabs__btn ${isActive ? 'active' : ''}" data-tab="${tabId}">
          ${tabName} (${variants.length})
        </button>
      `;
      
      let contentHtml = '';
      
      // [SỬA] Luôn kiểm tra xem có phải là JSON object hay không
      const isJsonObject = (typeof variants[0] === 'object' && variants[0] !== null);
      
      if (isJsonObject) { // Ưu tiên render JSON nếu nó là object
        contentHtml = variants.map((data, i) => {
            const jsonText = (typeof data === 'object') ? JSON.stringify(data, null, 2) : String(data);
            return `
             <div class="ps-result-card-json">
               <div class="ps-result-card-header">
                 <span>JSON Biến thể #${i + 1}</span>
                 <button class="btn btn-secondary btn-sm" onclick="copyToClipboard(this, ${JSON.stringify(jsonText)})">
                   <i class="ri-file-copy-2-line"></i> Copy JSON
                 </button>
               </div>
               <pre><code>${jsonText}</code></pre>
             </div>
           `
        }).join('');
        
        if (CURRENT_PRESET.isVeo31) {
            contentHtml += `<p class="ps-compliance-note" data-i18n-key="ps.jsonNote">${getI18nText('ps.jsonNote', 'Output is JSON. English for keys; Vietnamese only inside dialogue strings.')}</p>`;
        }
      } 
      else { // Render văn bản thuần
        contentHtml = variants.map((text, i) => `
          <div class="ps-result-card">
            <div class="ps-result-card-header">
              <span>Biến thể #${i + 1}</span>
              <button class="btn btn-secondary btn-sm" onclick="copyToClipboard(this, ${JSON.stringify(String(text))})">
                <i class="ri-file-copy-2-line"></i> Copy
              </button>
            </div>
            <p>${String(text).replace(/\n/g, '<br>')}</p>
          </div>
        `).join('');
      }

      DOM.outputTabsContent.innerHTML += `
        <div class="tabs__content ${isActive ? 'active' : ''}" id="ps-output-tab-${tabId}" data-tab-name="${tabName}">
          ${contentHtml}
        </div>
      `;
    });
    
    if (tabs.length > 0) {
      updateCopyAllButton(tabs[0].toLowerCase().replace(/[^a-z0-9]/g, '-'));
    }
  }
  
  // [3.7] Cập nhật nút "Copy All"
  function updateCopyAllButton(activeTabId) {
    const tabContent = $(`#ps-output-tab-${activeTabId}`);
    if (!tabContent) return;
    
    const tabName = tabContent.dataset.tabName;
    DOM.outputCopyAllBtn.querySelector('span').textContent = `Copy tất cả (${tabName})`;
    
    DOM.outputCopyAllBtn.onclick = () => {
      let allText = '';
      const isJsonTab = tabContent.querySelector('.ps-result-card-json');
      
      if (isJsonTab) {
        const codes = tabContent.querySelectorAll('pre code');
        codes.forEach((code, i) => {
          allText += `// Biến thể #${i + 1}\n${code.textContent}\n\n`;
        });
      } else {
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
  
  // [3.9] Hàm helper show toast (cần file app.js)
  function showToast(message, type = 'success') {
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      alert(message);
    }
  }
  
  // [3.10] Hàm helper lấy i18n (cần file app.js)
  function getI18nText(key, fallback = '') {
    if (window.getI18nText) {
      return window.getI18nText(key) || fallback || `[${key}]`;
    }
    return fallback || `[${key}]`;
  }

  // Chạy khi DOM đã sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();