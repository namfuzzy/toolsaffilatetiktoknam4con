// assets/js/core/env.js
// Lưu ý: KHÔNG hardcode API key ở client.
// Người dùng sẽ nhập key trong Settings (lưu ở localStorage).
// Nếu cần vượt CORS/vùng cho Gemini/Perplexity, dùng PROXY_URL (GAS).

(function () {
  window.ENV = {
    // === Proxy GAS (đã cập nhật link mới của bạn) ===
    PROXY_URL: "https://script.google.com/macros/s/AKfycbwLUrhYVVtjmDd5TeruGcUIFQ8wO1le03FHQ5IZg6CIdmlvRVP66zy6gaWompz9EW6v/exec",

    // Provider mặc định (gemini | perplexity)
    DEFAULT_PROVIDER: "gemini",

    // Gemini — chỉ dùng làm Fallback hiển thị (KHÔNG để khóa thật)
    GOOGLE_API_KEY: "",
    GEMINI_MODEL: "gemini-2.5-pro",

    // Perplexity — chỉ dùng làm Fallback hiển thị (KHÔNG để khóa thật)
    PPLX_API_KEY: "",
    PPLX_MODEL: "sonar-small-chat",

    // (Tuỳ chọn) Danh sách gợi ý model để hiện trong UI chọn nhanh
    GEMINI_MODEL_FALLBACKS: [
      "gemini-2.5-pro",
      "gemini-2.0-pro",
      "gemini-2.0-flash",
      "gemini-1.5-pro",
      "gemini-1.5-flash"
    ],
    PPLX_MODEL_FALLBACKS: [
      "sonar-small-chat",
      "sonar-medium-chat",
      "sonar-pro"
    ]
  };
})();
