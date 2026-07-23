// ═══════════════════════════════════════════════════════
//  YopVial — Juego "Parquea bien" (canvas, física de manejo)
//  Yop maniobra el carro y lo estaciona dentro del cupo.
// ═══════════════════════════════════════════════════════

const $ = (s) => document.querySelector(s);

// ── Configuración del tablero ──────────────────────────
const VW = 420, VH = 560;
const MARGEN = 20;         // borde de la pista, actúa como pared suave

const KEY_MEJOR = "yopvial_parquear_mejor";
const KEY_MUTE  = "yopvial_mute";  // sonido compartido con los otros juegos

// Consejos que aparecen al completar un nivel
const TIPS = [
  "Antes de parquear, enciende las direccionales para avisar tu maniobra.",
  "Revisa espejos y punto ciego antes de reversar.",
  "No estaciones en zonas prohibidas ni sobre andenes: obstruyen el paso.",
  "Deja espacio suficiente para que los peatones crucen con seguridad.",
  "Al parquear en batería, hazlo despacio y en varios movimientos si hace falta.",
  "Un buen parqueo no obstruye otros vehículos ni bloquea salidas.",
];

// ── Física del vehículo ─────────────────────────────────
const ACEL = 230, ACEL_REV = 150, FRICCION = 210;
const VEL_MAX = 165, VEL_MAX_REV = 85;
const GIRO = 2.5;           // rad/s
const RADIO_AUTO = 16;
const RADIO_OBST = 22;

// ── Estado del juego ───────────────────────────────────
const G = {
  playing: false,
  puntos: 0,
  nivel: 1,
  vidas: 3,
  mejor: 0,
  player: { x: VW / 2, y: VH - 60, angle: 0, vel: 0, invuln: 0 },
  spot: null,             // { x, y, w, h, angle }
  obst: [],               // { x, y }
  tiempo: 0,
  tiempoTotal: 0,
  flash: null,
  shake: 0,
  toast: null,
  last: 0,
  raf: null,
  muted: false,
};

const teclas = { up: false, down: false, left: false, right: false };

// ── Canvas ─────────────────────────────────────────────
const canvas = $("#parquearCanvas");
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
const sndOk    = () => { beep(660, 0.09); setTimeout(() => beep(880, 0.09), 90); setTimeout(() => beep(1046, 0.14), 180); };
const sndGolpe = () => { beep(150, 0.28, "sawtooth", 0.20); setTimeout(() => beep(90, 0.3, "sawtooth", 0.18), 60); };
const sndTic   = () => beep(900, 0.04, "square", 0.06);
const sndFin   = () => { [523, 415, 330, 247].forEach((f, i) => setTimeout(() => beep(f, 0.2, "triangle", 0.16), i * 160)); };

// ── Generación de nivel ─────────────────────────────────
const ANGULOS = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }

function generarNivel() {
  const anguloSpot = ANGULOS[(Math.random() * ANGULOS.length) | 0];
  const largo = Math.max(58, 96 - (G.nivel - 1) * 5);
  const ancho = Math.max(42, 64 - (G.nivel - 1) * 3);
  const horizontal = Math.abs(anguloSpot) === Math.PI / 2;
  const w = horizontal ? largo : ancho;
  const h = horizontal ? ancho : largo;

  const startX = VW / 2, startY = VH - 60;
  let sx, sy, intentos = 0;
  do {
    sx = MARGEN + w / 2 + 10 + Math.random() * (VW - w - 2 * MARGEN - 20);
    sy = MARGEN + h / 2 + 40 + Math.random() * (VH - h - 2 * MARGEN - 160);
    intentos++;
  } while (dist(sx, sy, startX, startY) < 130 && intentos < 40);

  G.spot = { x: sx, y: sy, w, h, angle: anguloSpot };

  const nObst = Math.min(2 + Math.floor((G.nivel - 1) * 0.7), 6);
  G.obst = [];
  let seguridad = 0;
  while (G.obst.length < nObst && seguridad < 300) {
    seguridad++;
    const ox = MARGEN + RADIO_OBST + Math.random() * (VW - 2 * (MARGEN + RADIO_OBST));
    const oy = MARGEN + RADIO_OBST + 30 + Math.random() * (VH - 2 * (MARGEN + RADIO_OBST) - 150);
    if (dist(ox, oy, sx, sy) < Math.max(w, h) / 2 + RADIO_OBST + 26) continue;
    if (dist(ox, oy, startX, startY) < 90) continue;
    if (G.obst.some(o => dist(o.x, o.y, ox, oy) < RADIO_OBST * 2 + 14)) continue;
    G.obst.push({ x: ox, y: oy });
  }

  G.tiempoTotal = Math.max(14, 26 - (G.nivel - 1) * 1.2);
  G.tiempo = G.tiempoTotal;
}

function reposicionarJugador() {
  G.player.x = VW / 2; G.player.y = VH - 60; G.player.angle = 0; G.player.vel = 0;
  G.player.invuln = 0.6;
}

// ── Ciclo de actualización ─────────────────────────────
function update(dt) {
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 3);
  if (G.flash) { G.flash.t -= dt; if (G.flash.t <= 0) G.flash = null; }
  if (G.toast) { G.toast.t -= dt; if (G.toast.t <= 0) G.toast = null; }
  if (G.player.invuln > 0) G.player.invuln = Math.max(0, G.player.invuln - dt);

  // Cronómetro
  const antes = Math.ceil(G.tiempo);
  G.tiempo -= dt;
  if (Math.ceil(G.tiempo) < antes && G.tiempo > 0 && G.tiempo <= 5) sndTic();
  if (G.tiempo <= 0) { tiempoAgotado(); return; }

  // Física del carro
  const p = G.player;
  let accel = 0;
  if (teclas.up) accel = ACEL;
  else if (teclas.down) accel = -ACEL_REV;
  p.vel += accel * dt;
  if (accel === 0) {
    const s = Math.sign(p.vel);
    p.vel -= s * FRICCION * dt;
    if (Math.sign(p.vel) !== s) p.vel = 0;
  }
  p.vel = Math.max(-VEL_MAX_REV, Math.min(VEL_MAX, p.vel));

  if (Math.abs(p.vel) > 6) {
    const dirGiro = (teclas.right ? 1 : 0) - (teclas.left ? 1 : 0);
    const sentido = p.vel >= 0 ? 1 : -1;
    p.angle += dirGiro * GIRO * dt * sentido;
  }

  p.x += Math.sin(p.angle) * p.vel * dt;
  p.y -= Math.cos(p.angle) * p.vel * dt;

  // Paredes de la pista (suaves, sin daño)
  if (p.x < MARGEN + RADIO_AUTO) { p.x = MARGEN + RADIO_AUTO; p.vel = 0; }
  if (p.x > VW - MARGEN - RADIO_AUTO) { p.x = VW - MARGEN - RADIO_AUTO; p.vel = 0; }
  if (p.y < MARGEN + RADIO_AUTO) { p.y = MARGEN + RADIO_AUTO; p.vel = 0; }
  if (p.y > VH - MARGEN - RADIO_AUTO) { p.y = VH - MARGEN - RADIO_AUTO; p.vel = 0; }

  // Colisión con obstáculos
  if (p.invuln <= 0) {
    for (const o of G.obst) {
      if (dist(p.x, p.y, o.x, o.y) < RADIO_AUTO + RADIO_OBST) { golpe(); break; }
    }
  }

  // ¿Parqueado?
  if (p.invuln <= 0) revisarParqueo();
}

function diffAngulo(a, b) {
  let d = (a - b) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
}

function revisarParqueo() {
  const p = G.player, s = G.spot;
  const dentro = Math.abs(p.x - s.x) < s.w / 2 - 4 && Math.abs(p.y - s.y) < s.h / 2 - 4;
  if (!dentro) return;
  const tolerancia = Math.max(0.28, 0.62 - (G.nivel - 1) * 0.03);
  const anguloOk = diffAngulo(p.angle, s.angle) < tolerancia;
  const quieto = Math.abs(p.vel) < 16;
  if (dentro && anguloOk && quieto) parqueoExitoso();
}

function parqueoExitoso() {
  const bonusTiempo = Math.round(G.tiempo * 4);
  const bonusPrecision = Math.round(diffAngulo(G.player.angle, G.spot.angle) < 0.1 ? 40 : 20);
  G.puntos += 60 + bonusTiempo + bonusPrecision;
  G.flash = { color: "rgba(29,158,117,0.32)", t: 0.4 };
  G.toast = { text: "💡 " + TIPS[(G.nivel - 1) % TIPS.length], t: 3 };
  sndOk();
  if (G.puntos > G.mejor) { G.mejor = G.puntos; guardarMejor(); }
  pintarMarcador();
  G.nivel++;
  generarNivel();
  reposicionarJugador();
}

function tiempoAgotado() {
  golpe("Se acabó el tiempo. Maniobra con más decisión.");
}

function golpe(mensaje) {
  G.vidas--;
  G.flash = { color: "rgba(226,75,74,0.4)", t: 0.4 };
  G.shake = 1;
  sndGolpe();
  if (mensaje) G.toast = { text: "💡 " + mensaje, t: 2.6 };
  pintarMarcador();
  if (G.vidas <= 0) { finDelJuego(); return; }
  G.tiempo = G.tiempoTotal;
  reposicionarJugador();
}

// ── Render ─────────────────────────────────────────────
function render() {
  ctx.clearRect(0, 0, VW, VH);
  ctx.save();
  if (G.shake > 0) {
    const s = G.shake * 6;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  // Pista (parqueadero)
  ctx.fillStyle = "#3a3e47";
  ctx.fillRect(0, 0, VW, VH);
  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= VW; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, VH); ctx.stroke(); }
  for (let y = 0; y <= VH; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(VW, y); ctx.stroke(); }
  // Borde de la pista
  ctx.strokeStyle = "#FFC91E";
  ctx.lineWidth = 3;
  ctx.strokeRect(MARGEN / 2, MARGEN / 2, VW - MARGEN, VH - MARGEN);

  // Cupo de parqueo
  if (G.spot) {
    const s = G.spot;
    const dentro = Math.abs(G.player.x - s.x) < s.w / 2 - 4 && Math.abs(G.player.y - s.y) < s.h / 2 - 4;
    const tolerancia = Math.max(0.28, 0.62 - (G.nivel - 1) * 0.03);
    const anguloOk = diffAngulo(G.player.angle, s.angle) < tolerancia;
    ctx.save();
    ctx.strokeStyle = dentro && anguloOk ? "#1D9E75" : "#FFC91E";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]);
    ctx.strokeRect(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h);
    ctx.setLineDash([]);
    ctx.fillStyle = dentro && anguloOk ? "rgba(29,158,117,0.16)" : "rgba(255,201,30,0.10)";
    ctx.fillRect(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h);
    // Flecha de orientación deseada
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    ctx.font = "24px serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.fillText("⬆️", 0, 0);
    ctx.restore();
  }

  // Obstáculos (carros parqueados)
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for (const o of G.obst) {
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.font = "36px serif";
    ctx.fillText("🚙", 0, 2);
    ctx.restore();
  }

  // Jugador
  const p = G.player;
  const parpadea = p.invuln > 0 && Math.floor(p.invuln * 10) % 2 === 0;
  if (!parpadea) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle - Math.PI / 2);
    ctx.font = "36px serif";
    ctx.fillText("🚗", 0, 2);
    ctx.restore();
  }

  // HUD: vidas + nivel
  ctx.font = "18px serif";
  ctx.textAlign = "left";
  let hx = 14;
  for (let i = 0; i < G.vidas; i++) { ctx.fillText("❤️", hx, 24); hx += 22; }
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "700 15px " + getComputedStyle(document.body).fontFamily;
  ctx.fillText("Nivel " + G.nivel, VW - 14, 24);

  // Barra de tiempo
  const restante = Math.max(0, G.tiempo / G.tiempoTotal);
  const bw = VW - 2 * MARGEN - 8, bh = 8, bxo = MARGEN + 4, byo = 34;
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  roundRect(ctx, bxo, byo, bw, bh, 5); ctx.fill();
  ctx.fillStyle = restante < 0.25 ? "#E24B4A" : "#FFC91E";
  roundRect(ctx, bxo, byo, bw * restante, bh, 5); ctx.fill();

  // Toast de consejo / fallo
  if (G.toast) {
    const a = Math.min(1, G.toast.t);
    ctx.globalAlpha = a;
    ctx.fillStyle = "rgba(20,22,28,0.88)";
    const tw = VW - 40;
    roundRect(ctx, 20, VH / 2 - 26, tw, 52, 12); ctx.fill();
    ctx.fillStyle = "#FFC91E";
    ctx.font = "700 13px " + getComputedStyle(document.body).fontFamily;
    ctx.textAlign = "center";
    wrapText(ctx, G.toast.text, VW / 2, VH / 2 - 6, tw - 24, 16);
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
  G.flash = null; G.shake = 0; G.toast = null;
  reposicionarJugador();
  generarNivel();
  pintarMarcador();
  $("#parquearStart").hidden = true;
  $("#parquearStage").hidden = false;
}
function finDelJuego() {
  G.playing = false;
  teclas.up = teclas.down = teclas.left = teclas.right = false;
  sndFin();
  const puntos = G.puntos;
  if (puntos > G.mejor) { G.mejor = puntos; guardarMejor(); }
  pintarMarcador();
  $("#parquearStage").hidden = true;
  $("#startIco").textContent = "🏁";
  $("#startTitle").textContent = "¡Fin de la jornada!";
  $("#startText").innerHTML = `Llegaste a <b>${G.nivel}</b> nivel${G.nivel === 1 ? "" : "es"} con <b>${puntos}</b> punto${puntos === 1 ? "" : "s"}. Tu mejor marca es <b>${G.mejor}</b>. ¿Otra vez?`;
  $("#startBtn").textContent = "▶ Jugar de nuevo";
  $("#parquearStart").hidden = false;
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

// ── Controles (mantener presionado) ─────────────────────
function setupControles() {
  const mapaTeclas = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    w: "up", s: "down", a: "left", d: "right", W: "up", S: "down", A: "left", D: "right",
  };
  window.addEventListener("keydown", (e) => {
    const t = mapaTeclas[e.key];
    if (t) { e.preventDefault(); teclas[t] = true; }
  });
  window.addEventListener("keyup", (e) => {
    const t = mapaTeclas[e.key];
    if (t) { e.preventDefault(); teclas[t] = false; }
  });
  window.addEventListener("blur", () => { teclas.up = teclas.down = teclas.left = teclas.right = false; });

  const mapaAcciones = { acelerar: "up", reversa: "down", izq: "left", der: "right" };
  document.querySelectorAll(".pad-btn").forEach(b => {
    const t = mapaAcciones[b.dataset.accion];
    if (!t) return;
    const abajo = (e) => { if (e) e.preventDefault(); teclas[t] = true; };
    const arriba = (e) => { if (e) e.preventDefault(); teclas[t] = false; };
    b.addEventListener("mousedown", abajo);
    b.addEventListener("mouseup", arriba);
    b.addEventListener("mouseleave", arriba);
    b.addEventListener("touchstart", abajo, { passive: false });
    b.addEventListener("touchend", arriba, { passive: false });
    b.addEventListener("touchcancel", arriba, { passive: false });
  });
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
