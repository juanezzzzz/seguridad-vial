// ═══════════════════════════════════════════════════════
//  YopVial — Juegos interactivos · Ahorcado vial
// ═══════════════════════════════════════════════════════

// Banco de palabras (sin tildes para simplificar el teclado).
// Cada una trae una pista (concepto o pregunta). Opcional: img.
const PALABRAS = [
  { palabra: "SEMAFORO",   pista: "Aparato con luces roja, amarilla y verde que regula el paso en las vías." },
  { palabra: "CINTURON",   pista: "Debes abrocharlo siempre al subir a un carro, incluso en trayectos cortos." },
  { palabra: "CASCO",      pista: "Protección obligatoria para la cabeza de motociclistas y ciclistas." },
  { palabra: "PEATON",     pista: "Persona que se moviliza a pie por la vía." },
  { palabra: "CEBRA",      pista: "Cruce peatonal pintado con franjas blancas sobre la calzada." },
  { palabra: "VELOCIDAD",  pista: "Su exceso es la principal causa de muertes en las vías." },
  { palabra: "LICENCIA",   pista: "Documento que te autoriza a conducir un vehículo." },
  { palabra: "SOAT",       pista: "Seguro obligatorio contra accidentes de tránsito." },
  { palabra: "PARE",       pista: "Señal roja de ocho lados que obliga a detenerse por completo." },
  { palabra: "CICLORRUTA", pista: "Carril exclusivo y seguro para las bicicletas." },
  { palabra: "EMBRIAGUEZ", pista: "Conducir en este estado es una de las faltas más graves." },
  { palabra: "GLORIETA",   pista: "Intersección circular donde los vehículos giran en un mismo sentido." },
  { palabra: "RETROVISOR", pista: "Espejo que te permite ver lo que ocurre detrás del vehículo." },
  { palabra: "ANDEN",      pista: "Zona de la calle, generalmente elevada, destinada a los peatones." },
  { palabra: "COMPARENDO", pista: "Sanción o multa que impone la autoridad por infringir una norma." },
];

const ALFABETO = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
const MAX_ERRORES = 6;

const KEY_MEJOR = "yopvial_ahorcado_mejor";

// ── Estado ─────────────────────────────────────────────
const estado = {
  palabra: "",
  pista: "",
  aciertos: 0,
  racha: 0,
  mejor: 0,
  adivinadas: new Set(),
  errores: 0,
  terminado: false,
  orden: [],   // índices barajados para no repetir
  pos: 0,
};

// ── Utilidades ─────────────────────────────────────────
const $ = (s) => document.querySelector(s);
const norm = (c) => c.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();

function barajar(n) {
  const a = [...Array(n).keys()];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Nueva palabra ──────────────────────────────────────
function nuevaPalabra() {
  if (estado.pos >= estado.orden.length) { estado.orden = barajar(PALABRAS.length); estado.pos = 0; }
  const idx = estado.orden[estado.pos++];
  const item = PALABRAS[idx];
  estado.palabra = item.palabra.toUpperCase();
  estado.pista = item.pista;
  estado.adivinadas = new Set();
  estado.errores = 0;
  estado.terminado = false;
  render();
}

// ── Adivinar una letra ─────────────────────────────────
function adivinar(letra) {
  if (estado.terminado || estado.adivinadas.has(letra)) return;
  estado.adivinadas.add(letra);

  const acierta = [...estado.palabra].some(c => norm(c) === letra);
  if (!acierta) estado.errores++;

  // ¿Ganó?
  const completa = [...estado.palabra].every(c => c === " " || estado.adivinadas.has(norm(c)));
  if (completa) finalizar(true);
  else if (estado.errores >= MAX_ERRORES) finalizar(false);

  render();
}

function finalizar(gano) {
  estado.terminado = true;
  if (gano) {
    estado.aciertos++;
    estado.racha++;
    if (estado.racha > estado.mejor) { estado.mejor = estado.racha; guardarMejor(); }
  } else {
    estado.racha = 0;
  }
}

// ── Persistencia de la mejor racha ─────────────────────
function cargarMejor() { try { estado.mejor = parseInt(localStorage.getItem(KEY_MEJOR)) || 0; } catch { estado.mejor = 0; } }
function guardarMejor() { try { localStorage.setItem(KEY_MEJOR, String(estado.mejor)); } catch {} }

// ── Render ─────────────────────────────────────────────
function render() {
  // Pista
  $("#pistaText").textContent = estado.pista;

  // Palabra
  const wordEl = $("#word");
  wordEl.innerHTML = [...estado.palabra].map(c => {
    if (c === " ") return `<span class="letter space"></span>`;
    const mostrada = estado.adivinadas.has(norm(c));
    const revelar = estado.terminado && !mostrada;   // al perder, mostrar en rojo lo que faltaba
    const cls = "letter" + (mostrada ? " filled" : "") + (revelar ? " reveal" : "");
    return `<span class="${cls}">${(mostrada || revelar) ? c : ""}</span>`;
  }).join("");

  // Muñeco
  for (let i = 1; i <= MAX_ERRORES; i++) {
    const p = document.getElementById("part" + i);
    if (p) p.style.opacity = estado.errores >= i ? 1 : 0;
  }
  $("#errCount").textContent = estado.errores;

  // Marcador
  $("#scoreAciertos").textContent = estado.aciertos;
  $("#scoreRacha").textContent = estado.racha;
  $("#scoreMejor").textContent = estado.mejor;

  // Teclado
  const kb = $("#keyboard");
  kb.innerHTML = ALFABETO.map(l => {
    const usada = estado.adivinadas.has(l);
    const enPalabra = [...estado.palabra].some(c => norm(c) === l);
    let cls = "key";
    if (usada) cls += enPalabra ? " ok" : " no";
    const dis = usada || estado.terminado ? "disabled" : "";
    return `<button class="${cls}" data-letra="${l}" ${dis}>${l}</button>`;
  }).join("");
  kb.querySelectorAll(".key").forEach(b => b.onclick = () => adivinar(b.dataset.letra));

  // Resultado
  const res = $("#result");
  if (estado.terminado) {
    const gano = [...estado.palabra].every(c => c === " " || estado.adivinadas.has(norm(c)));
    res.hidden = false;
    res.className = "result " + (gano ? "win" : "lose");
    res.textContent = gano
      ? `¡Correcto! 🎉 La palabra era "${estado.palabra}".`
      : `¡Ups! La palabra era "${estado.palabra}". ¡Inténtalo con otra!`;
  } else {
    res.hidden = true;
  }
}

// ── Tema ───────────────────────────────────────────────
function setupTheme() {
  const btn = $("#themeToggle");
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

// ── Init ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  setupTheme();
  cargarMejor();
  estado.orden = barajar(PALABRAS.length);
  estado.pos = 0;
  nuevaPalabra();

  $("#nextBtn").onclick = () => nuevaPalabra();
  $("#restartBtn").onclick = () => {
    estado.aciertos = 0; estado.racha = 0;
    nuevaPalabra();
  };

  // Teclado físico
  document.addEventListener("keydown", (e) => {
    const l = norm(e.key);
    if (l.length === 1 && ALFABETO.includes(l)) adivinar(l);
    else if (e.key === "Enter" && estado.terminado) nuevaPalabra();
  });
});
