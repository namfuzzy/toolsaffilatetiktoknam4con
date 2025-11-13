// assets/js/core/kv.js
// Tiny key-value helper around localStorage with a safe namespace.
(function () {
  const NS = "affitok.ps."; // change if you want a different namespace
  window.KV = {
    get(key, dft = "") { try { return localStorage.getItem(NS + key) ?? dft; } catch { return dft; } },
    set(key, val) { try { localStorage.setItem(NS + key, val); } catch {} },
    del(key) { try { localStorage.removeItem(NS + key); } catch {} }
  };
})();
