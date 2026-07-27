// ═══════════════════════════════════════════════════════
//  YopVial — Juegos (hub) · tema + mejores marcas
// ═══════════════════════════════════════════════════════
const MEJOR_KEYS = {
  "ahorcado": "yopvial_ahorcado_mejor",
  "adivina-senal": "yopvial_adivina_mejor",
  "cruza-calle": "yopvial_cruza_mejor",
  "ruta-segura": "yopvial_ruta_mejor",
  "reflejos-semaforo": "yopvial_reflejos_mejor",
  "parquea-bien": "yopvial_parquear_mejor",
  "ruta-nocturna": "yopvial_nocturna_mejor",
};

function pintarMejores() {
  document.querySelectorAll(".game-card[data-game]").forEach(card => {
    const key = MEJOR_KEYS[card.dataset.game];
    const out = card.querySelector(".card-best-n");
    if (!key || !out) return;
    let valor = 0;
    try { valor = parseInt(localStorage.getItem(key)) || 0; } catch (e) {}
    out.textContent = valor > 0 ? valor : "—";
  });
}

function setupTheme() {
  const btn = document.querySelector("#themeToggle");
  if (!btn) return;
  const apply = (t) => {
    document.documentElement.setAttribute("data-theme", t);
    btn.textContent = t === "light" ? "☀️" : "🌙";
    btn.title = t === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro";
  };
  let theme = document.documentElement.getAttribute("data-theme") || "light";
  apply(theme);
  btn.addEventListener("click", () => {
    theme = theme === "light" ? "dark" : "light";
    try { localStorage.setItem("yopvial_theme", theme); } catch (e) {}
    apply(theme);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupTheme();
  pintarMejores();
});
