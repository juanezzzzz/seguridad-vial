// ═══════════════════════════════════════════════════════
//  YopVial — Juego "Cruza la calle" (canvas, estilo Frogger)
//  Yop el peatón cruza la avenida esquivando el tráfico.
// ═══════════════════════════════════════════════════════

const $ = (s) => document.querySelector(s);

// ── Configuración del tablero ──────────────────────────
const COLS = 7;
const ROWS = 10;                 // fila 9 = inicio (abajo), fila 0 = meta (arriba)
const VW = 420, VH = 560;        // resolución lógica del canvas
const COL_W = VW / COLS;         // 60
const ROW_H = VH / ROWS;         // 56

const KEY_MEJOR = "yopvial_cruza_mejor";
const KEY_MUTE  = "yopvial_mute";

// Filas seguras (césped/andén): inicio, meta y un separador en medio.
const filaSegura = (r) => r === 0 || r === 9 || r === 4;

// Emojis de vehículos por "tamaño"
const AUTOS   = ["🚗", "🚙", "🚕", "🚓", "🏎️"];
const GRANDES = ["🚌", "🚐", "🚚"];
const MOTOS   = ["🏍️"];

// Consejos que aparecen al cruzar bien
const TIPS = [
  "Cruza siempre por la cebra y mira a ambos lados.",
  "Antes de cruzar: mira izquierda, derecha y otra vez izquierda.",
  "Nunca cruces distraído con el celular.",
  "De noche, usa ropa clara para que te vean.",
  "Espera el semáforo en verde para el peatón.",
  "No cruces entre autos estacionados: no te ven.",
  "Camina, no corras, al cruzar la calle.",
];

// ── Estado del juego ───────────────────────────────────
const G = {
  playing: false,
  puntos: 0,
  nivel: 1,
  vidas: 3,
  mejor: 0,
  player: { col: 3, row: 9, hop: 0, invuln: 0 },
  lanes: [],          // carriles con tráfico
  flash: null,        // { color, t }
  shake: 0,
  toast: null,        // { text, t }
  last: 0,
  raf: null,
  muted: false,
};

// ── Canvas ─────────────────────────────────────────────
const canvas = $("#cruzaCanvas");
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
const sndPaso  = () => beep(520, 0.05, "square", 0.10);
const sndCruce = () => { beep(660, 0.09); setTimeout(() => beep(880, 0.09), 90); setTimeout(() => beep(1046, 0.14), 180); };
const sndGolpe = () => { beep(150, 0.28, "sawtooth", 0.20); setTimeout(() => beep(90, 0.3, "sawtooth", 0.18), 60); };
const sndFin   = () => { [523, 415, 330, 247].forEach((f, i) => setTimeout(() => beep(f, 0.2, "triangle", 0.16), i * 160)); };

// ── Generación de carriles ─────────────────────────────
function crearCarriles() {
  G.lanes = [];
  for (let r = 1; r <= 8; r++) {
    if (filaSegura(r)) continue;
    const dir = r % 2 === 0 ? 1 : -1;                 // alterna sentido
    const base = 70 + Math.random() * 40;             // px/s base
    const speed = (base + (G.nivel - 1) * 14) * (0.9 + Math.random() * 0.3);
    const gap = Math.max(0.8, 2.1 - (G.nivel - 1) * 0.12); // segundos entre autos
    const lane = { row: r, dir, speed, gap, timer: Math.random() * gap, cars: [] };
    G.lanes.push(lane);
  }
}
function nuevoAuto(lane) {
  const rnd = Math.random();
  let emoji, w;
  if (rnd < 0.18) { emoji = GRANDES[(Math.random() * GRANDES.length) | 0]; w = 88; }
  else if (rnd < 0.32) { emoji = MOTOS[0]; w = 42; }
  else { emoji = AUTOS[(Math.random() * AUTOS.length) | 0]; w = 56; }
  const x = lane.dir > 0 ? -w : VW + w;
  lane.cars.push({ x, w, emoji });
}

// ── Ciclo de actualización ─────────────────────────────
function update(dt) {
  // Jugador: animación de salto e invulnerabilidad
  if (G.player.hop > 0) G.player.hop = Math.max(0, G.player.hop - dt * 6);
  if (G.player.invuln > 0) G.player.invuln = Math.max(0, G.player.invuln - dt);
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 3);
  if (G.flash) { G.flash.t -= dt; if (G.flash.t <= 0) G.flash = null; }
  if (G.toast) { G.toast.t -= dt; if (G.toast.t <= 0) G.toast = null; }

  // Tráfico
  for (const lane of G.lanes) {
    lane.timer -= dt;
    if (lane.timer <= 0) { nuevoAuto(lane); lane.timer = lane.gap * (0.7 + Math.random() * 0.6); }
    for (const car of lane.cars) car.x += lane.dir * lane.speed * dt;
    lane.cars = lane.cars.filter(c => c.x > -140 && c.x < VW + 140);
  }

  // Colisiones (solo si no es invulnerable y está en una fila de carretera)
  if (G.player.invuln <= 0 && !filaSegura(G.player.row)) {
    const lane = G.lanes.find(l => l.row === G.player.row);
    if (lane) {
      const pcx = G.player.col * COL_W + COL_W / 2;
      const pw = 40;
      for (const car of lane.cars) {
        // car.x es el centro visual del vehículo (ver render)
        if (Math.abs(pcx - car.x) < (pw + car.w) / 2 - 8) { golpe(); break; }
      }
    }
  }
}

// ── Movimiento del jugador ─────────────────────────────
function mover(dir) {
  if (!G.playing) return;
  const p = G.player;
  if (dir === "up")    p.row = Math.max(0, p.row - 1);
  if (dir === "down")  p.row = Math.min(9, p.row + 1);
  if (dir === "left")  p.col = Math.max(0, p.col - 1);
  if (dir === "right") p.col = Math.min(COLS - 1, p.col + 1);
  p.hop = 1;
  sndPaso();
  if (p.row === 0) { cruceLogrado(); return; }
  // Chequeo inmediato por si saltó encima de un auto
  update(0);
}

function cruceLogrado() {
  const bonus = 10 + G.nivel * 2;
  G.puntos += bonus;
  G.nivel++;
  G.flash = { color: "rgba(29,158,117,0.35)", t: 0.4 };
  G.toast = { text: TIPS[(Math.random() * TIPS.length) | 0], t: 3 };
  sndCruce();
  if (G.puntos > G.mejor) { G.mejor = G.puntos; guardarMejor(); }
  pintarMarcador();
  // Reinicia posición y sube dificultad
  G.player.col = 3; G.player.row = 9; G.player.invuln = 1.0;
  crearCarriles();
}

function golpe() {
  G.vidas--;
  G.flash = { color: "rgba(226,75,74,0.4)", t: 0.4 };
  G.shake = 1;
  sndGolpe();
  pintarMarcador();
  if (G.vidas <= 0) { finDelJuego(); return; }
  G.player.col = 3; G.player.row = 9; G.player.invuln = 1.4;
}

// ── Render ─────────────────────────────────────────────
function render() {
  const light = document.documentElement.getAttribute("data-theme") === "light";
  ctx.clearRect(0, 0, VW, VH);

  ctx.save();
  if (G.shake > 0) {
    const s = G.shake * 6;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  // Filas
  for (let r = 0; r < ROWS; r++) {
    const y = r * ROW_H;
    if (filaSegura(r)) {
      ctx.fillStyle = light ? "#cfe9d8" : "#1f3a2c";
      ctx.fillRect(0, y, VW, ROW_H);
      // textura de césped
      ctx.fillStyle = light ? "#bfe0cb" : "#24442f";
      for (let x = 0; x < VW; x += 16) ctx.fillRect(x + (r % 2 ? 8 : 0), y + 10, 6, 4);
    } else {
      ctx.fillStyle = light ? "#4a4f57" : "#2b2f38";
      ctx.fillRect(0, y, VW, ROW_H);
      // línea discontinua central del carril
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 3;
      ctx.setLineDash([14, 12]);
      ctx.beginPath();
      ctx.moveTo(0, y + ROW_H / 2);
      ctx.lineTo(VW, y + ROW_H / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Cebra en la meta (fila 0)
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  for (let x = 6; x < VW; x += 26) ctx.fillRect(x, 4, 14, ROW_H - 8);

  // Bordillo de la fila de inicio
  ctx.fillStyle = light ? "#8fd0a6" : "#2e5540";
  ctx.fillRect(0, 9 * ROW_H, VW, 4);

  // Vehículos
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const lane of G.lanes) {
    const y = lane.row * ROW_H + ROW_H / 2;
    for (const car of lane.cars) {
      ctx.save();
      ctx.translate(car.x, y);
      // el emoji del auto mira a la izquierda; si va a la derecha, se voltea
      if (lane.dir > 0) ctx.scale(-1, 1);
      ctx.font = `${car.w === 88 ? 44 : car.w === 42 ? 32 : 40}px serif`;
      ctx.fillText(car.emoji, 0, 2);
      ctx.restore();
    }
  }

  // Jugador (Yop)
  const p = G.player;
  const px = p.col * COL_W + COL_W / 2;
  const py = p.row * ROW_H + ROW_H / 2;
  const parpadea = p.invuln > 0 && Math.floor(p.invuln * 10) % 2 === 0;
  if (!parpadea) {
    const escala = 1 + p.hop * 0.18;
    ctx.save();
    ctx.translate(px, py - p.hop * 6);
    ctx.scale(escala, escala);
    // sombra
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath(); ctx.ellipse(0, 20, 15, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.font = "38px serif";
    ctx.fillText("🦫", 0, 0);
    ctx.restore();
  }

  // HUD: vidas + nivel sobre el canvas
  ctx.font = "18px serif";
  ctx.textAlign = "left";
  let hx = 8;
  for (let i = 0; i < G.vidas; i++) { ctx.fillText("❤️", hx, 16); hx += 22; }
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "700 15px " + getComputedStyle(document.body).fontFamily;
  ctx.fillText("Nivel " + G.nivel, VW - 8, 16);

  // Toast de consejo
  if (G.toast) {
    const a = Math.min(1, G.toast.t);
    ctx.globalAlpha = a;
    ctx.fillStyle = "rgba(20,22,28,0.86)";
    const tw = VW - 40;
    roundRect(ctx, 20, VH / 2 - 26, tw, 52, 12); ctx.fill();
    ctx.fillStyle = "#FFC91E";
    ctx.font = "700 13px " + getComputedStyle(document.body).fontFamily;
    ctx.textAlign = "center";
    wrapText(ctx, "💡 " + G.toast.text, VW / 2, VH / 2 - 6, tw - 24, 16);
    ctx.globalAlpha = 1;
  }

  ctx.restore();

  // Flash de pantalla completa
  if (G.flash) {
    ctx.fillStyle = G.flash.color;
    ctx.globalAlpha = Math.min(1, G.flash.t / 0.4);
    ctx.fillRect(0, 0, VW, VH);
    ctx.globalAlpha = 1;
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

// ── Inicio / fin de partida ────────────────────────────
function comenzar() {
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume(); } catch (e) {}
  G.playing = true;
  G.puntos = 0; G.nivel = 1; G.vidas = 3;
  G.player = { col: 3, row: 9, hop: 0, invuln: 1.0 };
  G.flash = null; G.shake = 0; G.toast = null;
  crearCarriles();
  pintarMarcador();
  $("#cruzaStart").hidden = true;
  $("#cruzaStage").hidden = false;
}
function finDelJuego() {
  G.playing = false;
  sndFin();
  const puntos = G.puntos;
  if (puntos > G.mejor) { G.mejor = puntos; guardarMejor(); }
  pintarMarcador();
  $("#cruzaStage").hidden = true;
  $("#startIco").textContent = "🏁";
  $("#startTitle").textContent = "¡Fin del recorrido!";
  $("#startText").innerHTML = `Llegaste a <b>${G.nivel}</b> nivel${G.nivel === 1 ? "" : "es"} con <b>${puntos}</b> punto${puntos === 1 ? "" : "s"}. Tu mejor marca es <b>${G.mejor}</b>. ¿Otra vez?`;
  $("#startBtn").textContent = "▶ Jugar de nuevo";
  $("#cruzaStart").hidden = false;
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
  // Teclado
  window.addEventListener("keydown", (e) => {
    const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      w: "up", s: "down", a: "left", d: "right", W: "up", S: "down", A: "left", D: "right" };
    const dir = map[e.key];
    if (dir) { e.preventDefault(); mover(dir); }
  });
  // Botones táctiles
  document.querySelectorAll(".pad-btn").forEach(b => {
    const dir = b.dataset.dir;
    b.addEventListener("click", () => mover(dir));
    b.addEventListener("touchstart", (e) => { e.preventDefault(); mover(dir); }, { passive: false });
  });
  // Deslizar sobre el canvas
  let sx = 0, sy = 0;
  canvas.addEventListener("touchstart", (e) => { const t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
  canvas.addEventListener("touchend", (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) { mover("up"); return; } // toque = avanzar
    if (Math.abs(dx) > Math.abs(dy)) mover(dx > 0 ? "right" : "left");
    else mover(dy > 0 ? "down" : "up");
  }, { passive: true });
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
