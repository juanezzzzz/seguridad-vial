// ═══════════════════════════════════════════════════════
//  YopVial — Juego "Ruta segura" (canvas, endless runner)
//  Yop en moto esquiva huecos y autos, recoge casco y SOAT.
// ═══════════════════════════════════════════════════════

const $ = (s) => document.querySelector(s);

// ── Configuración del tablero ──────────────────────────
const VW = 420, VH = 560;         // resolución lógica del canvas
const LANES = 3;
const LANE_X = [VW / 6, VW / 2, (5 * VW) / 6];   // centro de cada carril
const LANE_W = VW / LANES;
const PLAYER_Y = VH - 110;        // fila fija de la moto
const HIT_BAND = 34;               // margen vertical de colisión

const KEY_MEJOR = "yopvial_ruta_mejor";
const KEY_MUTE  = "yopvial_mute";  // sonido compartido con Cruza la calle

// Consejos que aparecen al subir de nivel
const TIPS = [
  "El casco es obligatorio y salva vidas: úsalo siempre bien abrochado.",
  "Ten el SOAT al día: es tu respaldo en caso de accidente.",
  "Nunca manejes con el celular en la mano: te distrae y puede matar.",
  "Mantén distancia con el vehículo de adelante para frenar a tiempo.",
  "Revisa la técnico-mecánica de tu moto periódicamente.",
  "Respeta el límite de velocidad, sobre todo en zonas urbanas.",
  "Usa las luces de tu moto incluso de día para que te vean mejor.",
];

// ── Estado del juego ───────────────────────────────────
const G = {
  playing: false,
  puntos: 0,
  nivel: 1,
  vidas: 3,
  mejor: 0,
  distancia: 0,
  speed: 190,             // px/s de scroll
  spawnTimer: 0,
  spawnGap: 1.05,
  player: { lane: 1, x: LANE_X[1], jumping: false, jumpT: 0, invuln: 0 },
  items: [],              // { type, lane, y }
  scrollY: 0,             // para animar las líneas del carril
  flash: null,            // { color, t }
  shake: 0,
  toast: null,            // { text, t }
  last: 0,
  raf: null,
  muted: false,
};

const JUMP_DUR = 0.55;

// ── Canvas ─────────────────────────────────────────────
const canvas = $("#rutaCanvas");
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
const sndCarril = () => beep(480, 0.05, "square", 0.10);
const sndSalto  = () => beep(700, 0.08, "square", 0.11);
const sndRecoge = () => { beep(660, 0.08); setTimeout(() => beep(920, 0.1), 80); };
const sndNivel  = () => { beep(660, 0.09); setTimeout(() => beep(880, 0.09), 90); setTimeout(() => beep(1046, 0.14), 180); };
const sndGolpe  = () => { beep(150, 0.28, "sawtooth", 0.20); setTimeout(() => beep(90, 0.3, "sawtooth", 0.18), 60); };
const sndFin    = () => { [523, 415, 330, 247].forEach((f, i) => setTimeout(() => beep(f, 0.2, "triangle", 0.16), i * 160)); };

// ── Generación de obstáculos y objetos ─────────────────
// Probabilidad por tipo (suman 100)
const POOL = [
  { type: "hueco",   peso: 28 },
  { type: "auto",    peso: 22 },
  { type: "casco",   peso: 18 },
  { type: "soat",    peso: 16 },
  { type: "celular", peso: 16 },
];
function tipoAleatorio() {
  let r = Math.random() * 100;
  for (const p of POOL) { if (r < p.peso) return p.type; r -= p.peso; }
  return "hueco";
}
function spawnItem() {
  const carril = (Math.random() * LANES) | 0;
  G.items.push({ type: tipoAleatorio(), lane: carril, y: -60, resuelto: false });
  // A partir del nivel 3, a veces aparece un segundo objeto en otro carril (nunca los 3 a la vez)
  if (G.nivel >= 3 && Math.random() < 0.22) {
    let otro = (Math.random() * LANES) | 0;
    if (otro === carril) otro = (otro + 1) % LANES;
    G.items.push({ type: tipoAleatorio(), lane: otro, y: -60, resuelto: false });
  }
}

// ── Ciclo de actualización ─────────────────────────────
function update(dt) {
  G.scrollY += G.speed * dt;
  G.distancia += G.speed * dt;

  // Nivel según distancia recorrida
  const nuevoNivel = 1 + Math.floor(G.distancia / 900);
  if (nuevoNivel > G.nivel) subirNivel(nuevoNivel);

  // Puntos por distancia recorrida + bonos por objetos recogidos
  G.puntos = Math.floor(G.distancia / 12) + (G.bonus || 0);

  // Jugador: animación de carril y salto
  G.player.x += (LANE_X[G.player.lane] - G.player.x) * Math.min(1, dt * 12);
  if (G.player.jumping) {
    G.player.jumpT += dt;
    if (G.player.jumpT >= JUMP_DUR) { G.player.jumping = false; G.player.jumpT = 0; }
  }
  if (G.player.invuln > 0) G.player.invuln = Math.max(0, G.player.invuln - dt);
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 3);
  if (G.flash) { G.flash.t -= dt; if (G.flash.t <= 0) G.flash = null; }
  if (G.toast) { G.toast.t -= dt; if (G.toast.t <= 0) G.toast = null; }

  // Emisión de obstáculos/objetos
  G.spawnTimer -= dt;
  if (G.spawnTimer <= 0) {
    spawnItem();
    const gap = Math.max(0.55, G.spawnGap - (G.nivel - 1) * 0.06);
    G.spawnTimer = gap * (0.75 + Math.random() * 0.5);
  }

  // Mover objetos y resolver colisiones
  for (const it of G.items) {
    it.y += G.speed * dt;
    if (it.resuelto) continue;
    const enBanda = Math.abs(it.y - PLAYER_Y) < HIT_BAND;
    if (enBanda && it.lane === G.player.lane) {
      resolverColision(it);
    }
  }
  G.items = G.items.filter(it => !it.resuelto && it.y < VH + 60);
}

function resolverColision(it) {
  it.resuelto = true;
  if (it.type === "hueco") {
    const saltando = G.player.jumping && G.player.jumpT > 0.08 && G.player.jumpT < JUMP_DUR - 0.05;
    if (saltando) return; // esquivado saltando
    if (G.player.invuln > 0) return;
    golpe();
  } else if (it.type === "auto") {
    if (G.player.invuln > 0) return;
    golpe();
  } else if (it.type === "celular") {
    if (G.player.invuln > 0) return;
    golpe("¡Distracción! Nunca uses el celular manejando.");
  } else if (it.type === "casco" || it.type === "soat") {
    recoger(it.type);
  }
}

// ── Acciones del jugador ───────────────────────────────
function cambiarCarril(dir) {
  if (!G.playing) return;
  const p = G.player;
  const destino = dir === "left" ? p.lane - 1 : p.lane + 1;
  if (destino < 0 || destino >= LANES) return;
  p.lane = destino;
  sndCarril();
}
function saltar() {
  if (!G.playing || G.player.jumping) return;
  G.player.jumping = true;
  G.player.jumpT = 0;
  sndSalto();
}
function recoger(tipo) {
  G.bonus = (G.bonus || 0) + (tipo === "casco" ? 18 : 14);
  G.flash = { color: "rgba(29,158,117,0.30)", t: 0.3 };
  sndRecoge();
  pintarMarcador();
}
function golpe(mensaje) {
  G.vidas--;
  G.flash = { color: "rgba(226,75,74,0.4)", t: 0.4 };
  G.shake = 1;
  sndGolpe();
  if (mensaje) G.toast = { text: "💡 " + mensaje, t: 2.6 };
  pintarMarcador();
  if (G.vidas <= 0) { finDelJuego(); return; }
  G.player.invuln = 1.3;
}
function subirNivel(n) {
  G.nivel = n;
  G.speed = 190 + (n - 1) * 22;
  G.toast = { text: "💡 " + TIPS[(n - 1) % TIPS.length], t: 3 };
  sndNivel();
  pintarMarcador();
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

  // Vía
  ctx.fillStyle = light ? "#4a4f57" : "#2b2f38";
  ctx.fillRect(0, 0, VW, VH);

  // Bordes de la vía (andén/césped)
  ctx.fillStyle = light ? "#bfe0cb" : "#24442f";
  ctx.fillRect(0, 0, 8, VH);
  ctx.fillRect(VW - 8, 0, 8, VH);

  // Líneas divisoras entre carriles, animadas
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 3;
  ctx.setLineDash([22, 18]);
  const offset = G.scrollY % 40;
  for (let i = 1; i < LANES; i++) {
    const x = i * LANE_W;
    ctx.lineDashOffset = -offset;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, VH);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Objetos
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const it of G.items) {
    const x = LANE_X[it.lane];
    ctx.save();
    ctx.translate(x, it.y);
    if (it.type === "hueco") {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.beginPath(); ctx.ellipse(0, 0, 24, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.7)"; ctx.lineWidth = 2; ctx.stroke();
    } else if (it.type === "auto") {
      ctx.font = "42px serif";
      ctx.fillText(Math.random() < 0.001 ? "🚌" : "🚗", 0, 2);
    } else if (it.type === "casco") {
      ctx.font = "34px serif"; ctx.fillText("🪖", 0, 2);
    } else if (it.type === "soat") {
      ctx.font = "32px serif"; ctx.fillText("📄", 0, 2);
    } else if (it.type === "celular") {
      ctx.font = "32px serif"; ctx.fillText("📱", 0, 2);
    }
    ctx.restore();
  }

  // Jugador (Yop en moto)
  const p = G.player;
  const arc = p.jumping ? Math.sin((p.jumpT / JUMP_DUR) * Math.PI) : 0;
  const parpadea = p.invuln > 0 && Math.floor(p.invuln * 10) % 2 === 0;
  if (!parpadea) {
    ctx.save();
    ctx.translate(p.x, PLAYER_Y - arc * 34);
    const escala = 1 + arc * 0.12;
    ctx.scale(escala, escala);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath(); ctx.ellipse(0, 26 + arc * 4, 18 - arc * 6, 6 - arc * 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.font = "40px serif";
    ctx.fillText("🏍️", 0, 2);
    ctx.restore();
    ctx.restore();
  }

  // HUD: vidas + nivel
  ctx.font = "18px serif";
  ctx.textAlign = "left";
  let hx = 14;
  for (let i = 0; i < G.vidas; i++) { ctx.fillText("❤️", hx, 22); hx += 22; }
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "700 15px " + getComputedStyle(document.body).fontFamily;
  ctx.fillText("Nivel " + G.nivel, VW - 14, 22);

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
    wrapText(ctx, G.toast.text, VW / 2, VH / 2 - 6, tw - 24, 16);
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
  G.puntos = 0; G.nivel = 1; G.vidas = 3; G.bonus = 0;
  G.distancia = 0; G.speed = 190; G.spawnTimer = 0.4;
  G.player = { lane: 1, x: LANE_X[1], jumping: false, jumpT: 0, invuln: 1.0 };
  G.items = [];
  G.flash = null; G.shake = 0; G.toast = null;
  pintarMarcador();
  $("#rutaStart").hidden = true;
  $("#rutaStage").hidden = false;
}
function finDelJuego() {
  G.playing = false;
  sndFin();
  const puntos = G.puntos;
  if (puntos > G.mejor) { G.mejor = puntos; guardarMejor(); }
  pintarMarcador();
  $("#rutaStage").hidden = true;
  $("#startIco").textContent = "🏁";
  $("#startTitle").textContent = "¡Fin de la ruta!";
  $("#startText").innerHTML = `Llegaste a <b>${G.nivel}</b> nivel${G.nivel === 1 ? "" : "es"} con <b>${puntos}</b> punto${puntos === 1 ? "" : "s"}. Tu mejor marca es <b>${G.mejor}</b>. ¿Otra vez?`;
  $("#startBtn").textContent = "▶ Jugar de nuevo";
  $("#rutaStart").hidden = false;
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
    const map = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "jump",
      a: "left", d: "right", w: "jump", A: "left", D: "right", W: "jump", " ": "jump" };
    const accion = map[e.key];
    if (!accion) return;
    e.preventDefault();
    if (accion === "jump") saltar(); else cambiarCarril(accion);
  });
  // Botones táctiles
  document.querySelectorAll(".ruta-pad .pad-btn").forEach(b => {
    const accion = b.dataset.accion;
    const disparar = () => (accion === "jump" ? saltar() : cambiarCarril(accion));
    b.addEventListener("click", disparar);
    b.addEventListener("touchstart", (e) => { e.preventDefault(); disparar(); }, { passive: false });
  });
  // Deslizar sobre el canvas
  let sx = 0, sy = 0;
  canvas.addEventListener("touchstart", (e) => { const t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
  canvas.addEventListener("touchend", (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) { saltar(); return; } // toque simple = saltar
    if (Math.abs(dx) > Math.abs(dy)) cambiarCarril(dx > 0 ? "right" : "left");
    else saltar();
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
