// ═══════════════════════════════════════════════════════
//  YopVial — Juegos (hub) · solo el botón de tema
// ═══════════════════════════════════════════════════════
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

document.addEventListener("DOMContentLoaded", setupTheme);
