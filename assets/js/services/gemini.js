(function () {
  'use strict';

  // --- [GIỮ NGUYÊN] ---
  function pick(val, dft = "") {
    return (val ?? "").toString().trim() || dft;
  }

  function tryParseJSON(text) {
    try { return JSON.parse(text); } catch {}
    const m = text && text.match(/```json\s*([\s\S]*?)```/i);
    if (m) { try { return JSON.parse(m[1]); } catch {} }
    const m2 = text && text.match(/```([\s\S]*?)```/);
    if (m2) { try { return JSON.parse(m2[1]); } catch {} }
    // Nếu không parse được, trả về object chứa text thô
    return { raw: text };
  }

  async function fetchJSON(url, opt = {}) {
    if (typeof robustFetch !== 'function') {
        console.error("robustFetch is not defined. Network requests will fail.");
        return { ok: false, status: 500, json: { error: "robustFetch not loaded" }, text: "robustFetch not loaded" };
    }
    const res = await robustFetch(url, opt);
    const txt = await res.text();
    let json;
    try { json = JSON.parse(txt); } catch { json = { raw: txt }; }
    return { ok: res.ok, status: res.status, json, text: txt };
  }
  
  function getErrorMessage(jsonError, status) {
      if (typeof jsonError === 'string') return jsonError;
      if (jsonError?.message) return jsonError.message;
      if (jsonError) {
          try { return JSON.stringify(jsonError); } catch(e) {}
      }
      return status ? `Status ${status}` : 'Unknown error';
  }

  async function viaProxy({ proxy, apiKey, model, payload }) {
    if (typeof robustFetch !== 'function') {
        console.error("robustFetch is not defined. Proxy requests will fail.");
        return { ok: false, status: 500, json: { error: "robustFetch not loaded" } };
    }
    const res = await robustFetch(proxy, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "gemini",
        apiKey,
        model,
        body: payload // Gửi payload đã được nâng cấp
      })
    });
    const data = await res.json().catch(() => ({}));
    const isOk = !!data?.ok || (res.ok && !data?.error); 
    // data.data là phần body mà GAS trả về
    return { ok: isOk, status: data?.status ?? (res.ok ? 200 : res.status), json: data?.data ?? data };
  }

  function extractGeminiText(json) {
    // v1beta: candidates[0].content.parts[0].text
    return json?.candidates?.[0]?.content?.parts?.map(p => p?.text ?? "").join("") ||
           json?.candidates?.[0]?.content?.parts?.[0]?.text ||
           json?.output_text || "";
  }
  // --- [HẾT PHẦN GIỮ NGUYÊN] ---


  // === [BẮT ĐẦU NÂNG CẤP] ===
  window.GeminiService = {
    /**
     * Sinh JSON hoặc Text, hỗ trợ System Prompt và JSON Schema
     */
    async generateJSON({
      system, // (MỚI) Dùng cho "Super System Prompt"
      input,
      schema, // (MỚI) Dùng cho JSON Mode
      model,
      apiKey,
      proxy,
      temperature = 0.2,
      top_p,
      maxOutputTokens = 2048
    }) {
      // 1. Lấy cấu hình (Giữ nguyên)
      apiKey = pick(apiKey, window.ENV?.GOOGLE_API_KEY);
      model  = pick(model,  window.ENV?.GEMINI_MODEL || "gemini-2.5-pro");
      proxy  = pick(proxy,  window.ENV?.PROXY_URL);

      // 2. (NÂNG CẤP) Xây dựng generationConfig
      const generationConfig = {
        temperature,
        ...(typeof top_p === "number" ? { topP: top_p } : {}),
        ...(typeof maxOutputTokens === "number" ? { maxOutputTokens } : {})
      };

      // 3. (NÂNG CẤP) Tự động bật JSON Mode nếu có 'schema'
      if (schema) {
        generationConfig.responseMimeType = "application/json";
        // Truyền schema object, không stringify
        generationConfig.responseSchema = schema; 
      }

      // 4. (NÂNG CẤP) Xây dựng systemInstruction (Chỉ dẫn hệ thống)
      let systemInstruction = null;
      if (system) {
        // (MỚI) Dùng "Super System Prompt" (VEO 3.1) nếu được cung cấp
        systemInstruction = { parts: [{ text: system }] };
      } else if (schema) {
        // (CŨ - TƯƠNG THÍCH) Dùng prompt JSON mặc định
        // để không làm hỏng các tính năng cũ đang dùng schema
        const oldJsonInstr = [
          "Bạn là trợ lý tạo nội dung Affiliate bằng tiếng Việt.",
          "Hãy TRẢ VỀ DUY NHẤT một JSON hợp lệ khớp JSON Schema cung cấp.",
          "Không giải thích, không dùng ```."
        ].join(" ");
        systemInstruction = { parts: [{ text: oldJsonInstr }] };
      }
      // (Nếu cả system và schema đều null, nó sẽ chạy như một chatbot bình thường)

      // 5. (NÂNG CẤP) Xây dựng contents (Nội dung chat)
      // Chỉ chứa input của người dùng, không trộn lẫn system prompt vào đây
      const contents = [
        { role: "user", parts: [{ text: input }] }
      ];

      // 6. (NÂNG CẤP) Tạo payload cuối cùng
      const payload = {
        contents,
        systemInstruction, // API thật dùng trường này
        generationConfig
      };
      
      // 7. Gọi Proxy (Giữ nguyên logic)
      if (proxy) {
        const r = await viaProxy({ proxy, apiKey, model, payload });
        
        if (!r.ok) {
            const errorMsg = getErrorMessage(r.json?.error || r.json, r.status);
            throw new Error("Gemini (Proxy) lỗi: " + errorMsg);
        }
        
        // GAS trả về toàn bộ response của Gemini trong r.json
        const text = extractGeminiText(r.json);
        // Nếu dùng schema, Gemini trả về JSON string. Nếu không, trả về text.
        // tryParseJSON sẽ xử lý cả 2 trường hợp.
        return tryParseJSON(text);
      }

      // 8. Gọi trực tiếp (Giữ nguyên logic, chỉ thay payload)
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const r = await fetchJSON(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!r.ok) {
          const errorMsg = getErrorMessage(r.json?.error, r.status);
          throw new Error("Gemini lỗi: " + errorMsg);
      }

      const text = extractGeminiText(r.json);
      return tryParseJSON(text);
    }
  };
  // === [KẾT THÚC NÂNG CẤP] ===


  // [GIỮ NGUYÊN] API cũ để tương thích
  window.Gemini = window.Gemini || {};
  window.Gemini.generateJSON = (...args) => window.GeminiService.generateJSON(...args);

})();