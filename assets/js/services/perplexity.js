// assets/js/services/perplexity.js
(function () {
  const PPLX_LIST_URLS = [
    "https://api.perplexity.ai/v1/models",
    "https://api.perplexity.ai/models"
  ];
  const PPLX_CHAT_URLS = [
    "https://api.perplexity.ai/v1/chat/completions",
    "https://api.perplexity.ai/chat/completions"
  ];

  function pick(val, dft = "") {
    return (val ?? "").toString().trim() || dft;
  }

  function tryParseJSON(text) {
    try { return JSON.parse(text); } catch {}
    // Thử bóc code block ```json ... ```
    const m = text && text.match(/```json\s*([\s\S]*?)```/i);
    if (m) { try { return JSON.parse(m[1]); } catch {} }
    // Thử bóc khối ``` ... ```
    const m2 = text && text.match(/```([\s\S]*?)```/);
    if (m2) { try { return JSON.parse(m2[1]); } catch {} }
    return { raw: text };
  }

  async function fetchJSON(url, opt = {}) {
    const res = await robustFetch(url, opt);
    const txt = await res.text();
    let json;
    try { json = JSON.parse(txt); } catch { json = { raw: txt }; }
    return { ok: res.ok, status: res.status, json, text: txt };
  }

  async function viaProxy({ proxy, apiKey, payload }) {
    const res = await robustFetch(proxy, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "perplexity",
        apiKey,
        body: payload
      })
    });
    const data = await res.json().catch(() => ({}));
    return { ok: !!data?.ok, status: data?.status ?? (res.ok ? 200 : res.status), json: data?.data ?? data };
  }

  window.PerplexityService = {
    /**
     * Lấy danh sách model (cho Settings -> Refresh)
     */
    async listModels({ apiKey, proxy } = {}) {
      apiKey = pick(apiKey, window.ENV?.PPLX_API_KEY);
      proxy  = pick(proxy, window.ENV?.PROXY_URL);
      proxy = proxy || (window.KV && window.KV.get && window.KV.get('proxy_url',''));

      // Dùng proxy nếu có
      if (proxy) {
        const r = await viaProxy({ proxy, apiKey, payload: { listModels: true } });
        if (!r.ok) throw new Error("Không thể lấy models (Proxy): " + (r.json?.error || r.status));
        return r.json;
      }

      // Gọi thẳng Perplexity
      let last;
      for (const url of PPLX_LIST_URLS) {
        const r = await fetchJSON(url, {
          method: "GET",
          headers: { "Authorization": "Bearer " + apiKey }
        });
        if (r.ok) return r.json;
        last = r;
      }
      throw new Error("Không thể lấy models: " + (last?.status || "unknown"));
    },

    /**
     * Gọi chat để sinh JSON theo schema
     */
    async generateJSON({
      input,
      schema,
      model,
      apiKey,
      proxy,
      temperature = 0.2,
      top_p,
      max_tokens
    }) {
      apiKey = pick(apiKey, window.ENV?.PPLX_API_KEY);
      model  = pick(model,  window.ENV?.PPLX_MODEL || "sonar-small-chat");
      proxy  = pick(proxy,  window.ENV?.PROXY_URL);
      proxy = proxy || (window.KV && window.KV.get && window.KV.get('proxy_url',''));

      const sys = [
        "You are a Vietnamese prompt engineer for Affiliate content.",
        "Always respond with ONLY a valid JSON object matching the provided JSON Schema.",
        "Do not include explanations or code fences."
      ].join(" ");
      const instr = `JSON Schema (as reference): ${typeof schema === "string" ? schema : JSON.stringify(schema)}`;

      const payload = {
        model,
        messages: [
          { role: "system", content: sys },
          { role: "user",   content: `${instr}\n\nUser Input:\n${input}` }
        ],
        temperature,
        ...(typeof top_p === "number" ? { top_p } : {}),
        ...(typeof max_tokens === "number" ? { max_tokens } : {})
      };

      // Dùng proxy nếu có (khuyên dùng khi chạy file:///)
      if (proxy) {
        const r = await viaProxy({ proxy, apiKey, payload });
        if (!r.ok) throw new Error("Perplexity (Proxy) lỗi: " + (r.json?.error || r.status));
        // Chuẩn hoá: Perplexity OpenAI-compatible → r.json.choices[0].message.content
        const text = r.json?.choices?.[0]?.message?.content ?? r.json?.output ?? r.json?.text ?? "";
        const parsed = tryParseJSON(text);
        return parsed;
      }

      // Gọi trực tiếp Perplexity
      let last;
      for (const url of PPLX_CHAT_URLS) {
        const r = await fetchJSON(url, {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + apiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
        if (r.ok) {
          const text = r.json?.choices?.[0]?.message?.content ?? r.text;
          return tryParseJSON(text);
        }
        last = r;
      }
      throw new Error("Perplexity lỗi: " + (last?.status || "unknown"));
    }
  };
})();
