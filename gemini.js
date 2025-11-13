// assets/js/services/gemini.js
(function () {
  function pick(val, dft = "") {
    return (val ?? "").toString().trim() || dft;
  }

  function tryParseJSON(text) {
    try { return JSON.parse(text); } catch {}
    const m = text && text.match(/```json\s*([\s\S]*?)```/i);
    if (m) { try { return JSON.parse(m[1]); } catch {} }
    const m2 = text && text.match(/```([\s\S]*?)```/);
    if (m2) { try { return JSON.parse(m2[1]); } catch {} }
    return { raw: text };
  }

  async function fetchJSON(url, opt = {}) {
    // Giả sử robustFetch đã được định nghĩa ở file khác
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
  
  // [SỬA LỖI] Hàm này để xử lý lỗi tốt hơn
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
        body: payload
      })
    });
    const data = await res.json().catch(() => ({}));
    // data.ok và data.status là từ GAS trả về
    const isOk = !!data?.ok || (res.ok && !data?.error); 
    return { ok: isOk, status: data?.status ?? (res.ok ? 200 : res.status), json: data?.data ?? data };
  }

  // Lấy text từ response Gemini v1beta
  function extractGeminiText(json) {
    // v1beta: candidates[0].content.parts[0].text
    return json?.candidates?.[0]?.content?.parts?.map(p => p?.text ?? "").join("") ||
           json?.candidates?.[0]?.content?.parts?.[0]?.text ||
           json?.output_text || "";
  }

  window.GeminiService = {
    /**
     * Sinh JSON theo schema
     */
    async generateJSON({
      system,
      input,
      schema,
      model,
      apiKey,
      proxy,
      temperature = 0.2,
      top_p,
      maxOutputTokens = 2048
    }) {
      apiKey = pick(apiKey, window.ENV?.GOOGLE_API_KEY);
      model  = pick(model,  window.ENV?.GEMINI_MODEL || "gemini-2.5-pro");
      proxy  = pick(proxy,  window.ENV?.PROXY_URL);

      // Prompt hoá để Gemini trả JSON
      const jsonInstr = [
        "Bạn là trợ lý tạo nội dung Affiliate bằng tiếng Việt.",
        "Hãy TRẢ VỀ DUY NHẤT một JSON hợp lệ khớp JSON Schema cung cấp.",
        "Không giải thích, không dùng ```."
      ].join(" ");
      const schemaText = typeof schema === "string" ? schema : JSON.stringify(schema);

      const contents = [
        ...(system ? [{ role: "user", parts: [{ text: system }] }] : []),
        {
          role: "user",
          parts: [{
            text: `${jsonInstr}\nJSON Schema: ${schemaText}\n\nUser Input:\n${input}`
          }]
        }
      ];

      const payload = {
        contents,
        generationConfig: {
          temperature,
          ...(typeof top_p === "number" ? { topP: top_p } : {}),
          ...(typeof maxOutputTokens === "number" ? { maxOutputTokens } : {})
        }
      };

      // Dùng proxy nếu có (khuyên dùng khi chạy file:///)
      if (proxy) {
        const r = await viaProxy({ proxy, apiKey, model, payload });
        
        // [SỬA LỖI] Cải thiện báo lỗi [object Object]
        if (!r.ok) {
            // Lỗi từ GAS (ví dụ: data.error) hoặc lỗi từ proxy (ví dụ: r.json.error)
            const errorMsg = getErrorMessage(r.json?.error || r.json, r.status);
            throw new Error("Gemini (Proxy) lỗi: " + errorMsg);
        }
        
        const text = extractGeminiText(r.json) || r.text;
        return tryParseJSON(text);
      }

      // Gọi trực tiếp Gemini
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const r = await fetchJSON(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      // [SỬA LỖI] Cải thiện báo lỗi [object Object]
      if (!r.ok) {
          const errorMsg = getErrorMessage(r.json?.error, r.status);
          throw new Error("Gemini lỗi: " + errorMsg);
      }

      const text = extractGeminiText(r.json) || r.text;
      return tryParseJSON(text);
    }
  };

  // API cũ để tương thích (nếu code cũ còn dùng window.Gemini.generateJSON)
  window.Gemini = window.Gemini || {};
  window.Gemini.generateJSON = (...args) => window.GeminiService.generateJSON(...args);
})();