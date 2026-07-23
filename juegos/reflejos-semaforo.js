// ═══════════════════════════════════════════════════════
//  YopVial — Juego "Reflejos del semáforo" (canvas)
//  Yop debe avanzar en verde y frenar en amarillo a tiempo.
// ═══════════════════════════════════════════════════════

const $ = (s) => document.querySelector(s);

// ── Configuración del tablero ──────────────────────────
const VW = 420, VH = 480;

const KEY_MEJOR = "yopvial_reflejos_mejor";
const KEY_MUTE  = "yopvial_mute";  // sonido compartido con los otros juegos

// Consejos que aparecen al subir de nivel
const TIPS = [
  "El amarillo es para prepararte a frenar, no para acelerar y ganarle al rojo.",
  "En Colombia, el rojo significa pare total: ni peatones ni vehículos avanzan.",
  "Un semáforo intermitente en amarillo indica precaución, reduce la velocidad.",
  "Respeta la luz roja aunque no veas autos venir: la norma protege a todos.",
  "Anticiparte al verde antes de tiempo es tan peligroso como pasarte el rojo.",
  "Cruzar en amarillo tarde es de las causas más comunes de choques en cruces.",
];

// Duraciones base por fase (segundos). Se ajustan con el nivel en calcularTiempos().
const BASE = {
  rojoMin: 1.15, rojoMax: 2.7,
  ventanaVerde: 1.05,
  avanzarMin: 0.9, avanzarMax: 2.0,
  ventanaAmarillo: 0.95,
};

// ── Estado del juego ───────────────────────────────────
const G = {
  playing: false,
  puntos: 0,
  nivel: 1,
  vidas: 3,
  mejor: 0,
  rondas: 0,               // rondas completas (verde + amarillo exitosos)
  fase: "rojo",             // rojo | reaccion_verde | avanzando | reaccion_amarillo
  esperaT: 0,                // tiempo restante en fases de espera
  reaccionT: 0,               // tiempo transcurrido en fases de reacción
  ventanaVerde: BASE.ventanaVerde,
  ventanaAmarillo: BASE.ventanaAmarillo,
  ultimaReaccionMs: null,
  flash: null,
  shake: 0,
  toast: null,
  bounce: 0,                // rebote visual del vehículo al reaccionar
  last: 0,
  raf: null,
  muted: false,
};

// ── Canvas ─────────────────────────────────────────────
const canvas = $("#reflejosCanvas");
const ctx = canvas.getContext("2d");
function ajustarCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = VW * dpr;
  canvas.height = VH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// ── Sonido (WebAudio, sin archivos) ────────────────────
let actx = null;
function beep(freq, dur, type = "square", vol = 0.14) {
  if (G.muted) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = freq;
    o.connect(g); g.connect(actx.destination);
    g.gain.value = vol;
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
    o.stop(actx.currentTime + dur);
  } catch (e) {}
}
const sndCambioLuz = () => beep(520, 0.06, "square", 0.10);
const sndAcierto   = () => { beep(700, 0.07); setTimeout(() => beep(980, 0.09), 70); };
const sndGolpe     = () => { beep(150, 0.28, "sawtooth", 0.20); setTimeout(() => beep(90, 0.3, "sawtooth", 0.18), 60); };
const sndNivel     = () => { beep(660, 0.09); setTimeout(() => beep(880, 0.09), 90); setTimeout(() => beep(1046, 0.14), 180); };
const sndFin       = () => { [523, 415, 330, 247].forEach((f, i) => setTimeout(() => beep(f, 0.2, "triangle", 0.16), i * 160)); };

// ── Dificultad según nivel ──────────────────────────────
function calcularTiempos() {
  const reduc = Math.min(0.55, (G.nivel - 1) * 0.06);
  G.ventanaVerde = Math.max(0.5, BASE.ventanaVerde - reduc);
  G.ventanaAmarillo = Math.max(0.45, BASE.ventanaAmarillo - reduc);
}
function esperaRojo() {
  const reduc = Math.min(0.9, (G.nivel - 1) * 0.12);
  const min = Math.max(0.7, BASE.rojoMin - reduc), max = Math.max(min + 0.3, BASE.rojoMax - reduc);
  return min + Math.random() * (max - min);
}
function esperaAvanzando() {
  return BASE.avanzarMin + Math.random() * (BASE.avanzarMax - BASE.avanzarMin);
}

// ── Transiciones de fase ────────────────────────────────
function irARojo() {
  G.fase = "rojo";
  G.esperaT = esperaRojo();
  sndCambioLuz();
}
function irAVerde() {
  G.fase = "reaccion_verde";
  G.reaccionT = 0;
  calcularTiempos();
  sndCambioLuz();
}
function irAAvanzando() {
  G.fase = "avanzando";
  G.esperaT = esperaAvanzando();
}
function irAAmarillo() {
  G.fase = "reaccion_amarillo";
  G.reaccionT = 0;
  sndCambioLuz();
}

// ── Ciclo de actualización ─────────────────────────────
function update(dt) {
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 3);
  if (G.flash) { G.flash.t -= dt; if (G.flash.t <= 0) G.flash = null; }
  if (G.toast) { G.toast.t -= dt; if (G.toast.t <= 0) G.toast = null; }
  if (G.bounce > 0) G.bounce = Math.max(0, G.bounce - dt * 4);

  if (G.fase === "rojo") {
    G.esperaT -= dt;
    if (G.esperaT <= 0) irAVerde();
  } else if (G.fase === "reaccion_verde") {
    G.reaccionT += dt;
    if (G.reaccionT > G.ventanaVerde) fallo("lento_verde");
  } else if (G.fase === "avanzando") {
    G.esperaT -= dt;
    if (G.esperaT <= 0) irAAmarillo();
  } else if (G.fase === "reaccion_amarillo") {
    G.reaccionT += dt;
    if (G.reaccionT > G.ventanaAmarillo) fallo("paso_rojo");
  }
}

// ── Reacción del jugador ───────────────────────────────
function reaccionar() {
  if (!G.playing) return;
  G.bounce = 1;
  if (G.fase === "rojo") {
    fallo("adelantado");
  } else if (G.fase === "reaccion_verde") {
    const ms = Math.round(G.reaccionT * 1000);
    G.ultimaReaccionMs = ms;
    const pts = Math.max(15, Math.round(80 - ms / 12));
    G.puntos += pts;
    G.flash = { color: "rgba(29,158,117,0.28)", t: 0.25 };
    sndAcierto();
    pintarMarcador();
    irAAvanzando();
  } else if (G.fase === "avanzando") {
    // ya está avanzando, no hace falta reaccionar todavía
  } else if (G.fase === "reaccion_amarillo") {
    const ms = Math.round(G.reaccionT * 1000);
    G.ultimaReaccionMs = ms;
    const pts = Math.max(20, Math.round(55 - ms / 18));
    G.puntos += pts;
    G.flash = { color: "rgba(29,158,117,0.28)", t: 0.25 };
    sndAcierto();
    pintarMarcador();
    G.rondas++;
    const nuevoNivel = 1 + Math.floor(G.rondas / 4);
    if (nuevoNivel > G.nivel) subirNivel(nuevoNivel);
    irARojo();
  }
}

const MENSAJES_FALLO = {
  adelantado: "¡Arrancaste en rojo! Espera siempre la luz verde.",
  lento_verde: "Reaccionaste tarde: el semáforo ya estaba en verde.",
  paso_rojo: "¡Te pasaste en rojo! Frena en amarillo, no aceleres.",
};
function fallo(tipo) {
  G.vidas--;
  G.flash = { color: "rgba(226,75,74,0.4)", t: 0.4 };
  G.shake = 1;
  sndGolpe();
  G.toast = { text: "💡 " + MENSAJES_FALLO[tipo], t: 2.6 };
  pintarMarcador();
  if (G.vidas <= 0) { finDelJuego(); return; }
  irARojo();
}
function subirNivel(n) {
  G.nivel = n;
  sndNivel();
  if (!G.toast) G.toast = { text: "💡 " + TIPS[(n - 1) % TIPS.length], t: 3 };
  pintarMarcador();
}

// ── Render ─────────────────────────────────────────────
function render() {
  ctx.clearRect(0, 0, VW, VH);

  ctx.save();
  if (G.shake > 0) {
    const s = G.shake * 6;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  // Cielo / calle
  const grad = ctx.createLinearGradient(0, 0, 0, VH);
  grad.addColorStop(0, "#20242e");
  grad.addColorStop(1, "#2b2f38");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VW, VH);

  // Asfalto inferior
  ctx.fillStyle = "#33373f";
  ctx.fillRect(0, VH - 130, VW, 130);
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 3;
  ctx.setLineDash([18, 14]);
  ctx.beginPath(); ctx.moveTo(0, VH - 65); ctx.lineTo(VW, VH - 65); ctx.stroke();
  ctx.setLineDash([]);
  // Línea de pare
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillRect(VW / 2 - 60, VH - 132, 120, 6);

  // Poste y semáforo
  const px = VW / 2;
  ctx.fillStyle = "#4a4f57";
  ctx.fillRect(px - 5, 70, 10, 130);
  const boxX = px - 34, boxY = 40, boxW = 68, boxH = 150;
  ctx.fillStyle = "#1a1c22";
  roundRect(ctx, boxX, boxY, boxW, boxH, 14); ctx.fill();
  ctx.strokeStyle = "#000"; ctx.lineWidth = 2; ctx.stroke();

  const litRojo = G.fase === "rojo";
  const litAmarillo = G.fase === "reaccion_amarillo";
  const litVerde = G.fase === "reaccion_verde" || G.fase === "avanzando";
  dibujarLuz(px, boxY + 32, "#E24B4A", litRojo);
  dibujarLuz(px, boxY + 75, "#FFC91E", litAmarillo);
  dibujarLuz(px, boxY + 118, "#1D9E75", litVerde);

  // Vehículo de Yop
  const carY = VH - 60;
  const bx = G.bounce > 0 ? Math.sin(G.bounce * Math.PI) * -10 : 0;
  ctx.save();
  ctx.translate(px, carY + bx);
  ctx.font = "44px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🏍️", 0, 0);
  ctx.restore();

  // Barra de ventana de reacción (verde/amarillo)
  if (G.fase === "reaccion_verde" || G.fase === "reaccion_amarillo") {
    const ventana = G.fase === "reaccion_verde" ? G.ventanaVerde : G.ventanaAmarillo;
    const restante = Math.max(0, 1 - G.reaccionT / ventana);
    const color = G.fase === "reaccion_verde" ? "#1D9E75" : "#FFC91E";
    const bw = 220, bh = 10, bxo = VW / 2 - bw / 2, byo = boxY + boxH + 22;
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    roundRect(ctx, bxo, byo, bw, bh, 6); ctx.fill();
    ctx.fillStyle = color;
    roundRect(ctx, bxo, byo, bw * restante, bh, 6); ctx.fill();
  }

  // Instrucción contextual sobre el semáforo
  ctx.textAlign = "center";
  ctx.font = "700 15px " + getComputedStyle(document.body).fontFamily;
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  let texto = "Espera…";
  if (G.fase === "reaccion_verde") texto = "¡VERDE! Toca ya";
  else if (G.fase === "avanzando") texto = "Avanzando…";
  else if (G.fase === "reaccion_amarillo") texto = "¡AMARILLO! Frena ya";
  ctx.fillText(texto, VW / 2, boxY + boxH + 55);

  if (G.ultimaReaccionMs !== null) {
    ctx.font = "13px " + getComputedStyle(document.body).fontFamily;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillText("Última reacción: " + G.ultimaReaccionMs + " ms", VW / 2, boxY + boxH + 76);
  }

  // Toast de consejo / fallo
  if (G.toast) {
    const a = Math.min(1, G.toast.t);
    ctx.globalAlpha = a;
    ctx.fillStyle = "rgba(20,22,28,0.9)";
    const tw = VW - 40;
    roundRect(ctx, 20, VH - 100, tw, 52, 12); ctx.fill();
    ctx.fillStyle = "#FFC91E";
    ctx.font = "700 13px " + getComputedStyle(document.body).fontFamily;
    wrapText(ctx, G.toast.text, VW / 2, VH - 74, tw - 24, 16);
    ctx.globalAlpha = 1;
  }

  ctx.restore();

  if (G.flash) {
    ctx.fillStyle = G.flash.color;
    ctx.globalAlpha = Math.min(1, G.flash.t / 0.4);
    ctx.fillRect(0, 0, VW, VH);
    ctx.globalAlpha = 1;
  }
}

function dibujarLuz(cx, cy, color, encendida) {
  ctx.beginPath();
  ctx.arc(cx, cy, 17, 0, Math.PI * 2);
  ctx.fillStyle = encendida ? color : "rgba(255,255,255,0.08)";
  ctx.fill();
  if (encendida) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(cx, cy, 17, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
function wrapText(c, text, x, y, maxW, lh) {
  const words = text.split(" ");
  let line = "", lines = [];
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (c.measureText(test).width > maxW && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  const startY = y - (lines.length - 1) * lh / 2;
  lines.forEach((l, i) => c.fillText(l, x, startY + i * lh));
}

// ── Bucle principal ────────────────────────────────────
function loop(now) {
  const dt = Math.min((now - G.last) / 1000, 0.05);
  G.last = now;
  if (G.playing) update(dt);
  render();
  pintarBoton();
  G.raf = requestAnimationFrame(loop);
}

// ── Marcador / almacenamiento ──────────────────────────
function pintarMarcador() {
  $("#scorePuntos").textContent = G.puntos;
  $("#scoreNivel").textContent = G.nivel;
  $("#scoreMejor").textContent = G.mejor;
}
function cargarMejor() { try { G.mejor = parseInt(localStorage.getItem(KEY_MEJOR)) || 0; } catch { G.mejor = 0; } }
function guardarMejor() { try { localStorage.setItem(KEY_MEJOR, String(G.mejor)); } catch {} }

function pintarBoton() {
  const btn = $("#reflejosBtn");
  if (!btn || !G.playing) return;
  if (G.fase === "rojo") { btn.textContent = "🔴 Espera…"; btn.className = "btn btn-primary reflejos-btn en-rojo"; }
  else if (G.fase === "reaccion_verde") { btn.textContent = "🟢 ¡Toca YA!"; btn.className = "btn btn-primary reflejos-btn en-verde"; }
  else if (G.fase === "avanzando") { btn.textContent = "Avanzando…"; btn.className = "btn btn-primary reflejos-btn"; }
  else if (G.fase === "reaccion_amarillo") { btn.textContent = "🟡 ¡Frena YA!"; btn.className = "btn btn-primary reflejos-btn en-amarillo"; }
}

// ── Inicio / fin de partida ────────────────────────────
function comenzar() {
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume(); } catch (e) {}
  G.playing = true;
  G.puntos = 0; G.nivel = 1; G.vidas = 3; G.rondas = 0;
  G.ultimaReaccionMs = null;
  G.flash = null; G.shake = 0; G.toast = null; G.bounce = 0;
  calcularTiempos();
  irARojo();
  pintarMarcador();
  $("#reflejosStart").hidden = true;
  $("#reflejosStage").hidden = false;
}
function finDelJuego() {
  G.playing = false;
  sndFin();
  const puntos = G.puntos;
  if (puntos > G.mejor) { G.mejor = puntos; guardarMejor(); }
  pintarMarcador();
  $("#reflejosStage").hidden = true;
  $("#startIco").textContent = "🏁";
  $("#startTitle").textContent = "¡Fin de la ronda!";
  $("#startText").innerHTML = `Llegaste a <b>${G.nivel}</b> nivel${G.nivel === 1 ? "" : "es"} con <b>${puntos}</b> punto${puntos === 1 ? "" : "s"}. Tu mejor marca es <b>${G.mejor}</b>. ¿Otra vez?`;
  $("#startBtn").textContent = "▶ Jugar de nuevo";
  $("#reflejosStart").hidden = false;
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

// ── Silencio ───────────────────────────────────────────
function setupMute() {
  const btn = $("#soundToggle");
  try { G.muted = localStorage.getItem(KEY_MUTE) === "1"; } catch {}
  const apply = () => { btn.textContent = G.muted ? "🔇" : "🔊"; btn.title = G.muted ? "Activar sonido" : "Silenciar"; };
  apply();
  btn.addEventListener("click", () => {
    G.muted = !G.muted;
    try { localStorage.setItem(KEY_MUTE, G.muted ? "1" : "0"); } catch {}
    apply();
  });
}

// ── Controles ──────────────────────────────────────────
function setupControles() {
  window.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); reaccionar(); }
  });
  $("#reflejosBtn").addEventListener("click", reaccionar);
  canvas.addEventListener("touchstart", (e) => { e.preventDefault(); reaccionar(); }, { passive: false });
  canvas.addEventListener("click", reaccionar);
}

// ── Init ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  setupTheme();
  setupMute();
  ajustarCanvas();
  window.addEventListener("resize", ajustarCanvas);
  cargarMejor();
  pintarMarcador();
  setupControles();
  $("#startBtn").onclick = comenzar;
  G.last = performance.now();
  G.raf = requestAnimationFrame(loop);
});
