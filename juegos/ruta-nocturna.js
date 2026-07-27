// ═══════════════════════════════════════════════════════
//  YopVial — Juego "Ruta nocturna" (Phaser 3, iluminación real)
//  Yop maneja de noche: el cono de luz de las farolas limita
//  lo que ves, la lluvia y el deslumbramiento reducen la
//  visibilidad. Esquiva peatones, animales y huecos a tiempo.
// ═══════════════════════════════════════════════════════

const $ = (s) => document.querySelector(s);

// ── Configuración del tablero (misma resolución lógica que los otros juegos) ──
const VW = 420, VH = 560;
const LANES = 3;
const LANE_X = [VW / 6, VW / 2, (5 * VW) / 6];
const PLAYER_Y = VH - 110;
const HIT_BAND = 30;

const KEY_MEJOR = "yopvial_nocturna_mejor";
const KEY_MUTE = "yopvial_mute"; // sonido compartido con los otros juegos

const TIPS = [
  "De noche usa siempre las luces bajas en ciudad y las altas solo en vías sin tráfico de frente.",
  "La distancia de frenado se duplica de noche: reduce la velocidad si no ves bien.",
  "Si te deslumbra otro carro, mira hacia la línea de tu carril y baja la velocidad.",
  "Los peatones y animales son mucho más difíciles de ver de noche: anticípate.",
  "Con lluvia y de noche, aumenta aún más la distancia con el vehículo de adelante.",
  "Mantén las luces del carro limpias y bien alineadas: mejoran tu visibilidad real.",
];

// ── Estado del juego ───────────────────────────────────
const G = {
  playing: false,
  puntos: 0,
  nivel: 1,
  vidas: 3,
  mejor: 0,
  distancia: 0,
  speed: 175,
  muted: false,
};

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
const sndGolpe = () => { beep(150, 0.28, "sawtooth", 0.20); setTimeout(() => beep(90, 0.3, "sawtooth", 0.18), 60); };
const sndNivel = () => { beep(660, 0.09); setTimeout(() => beep(880, 0.09), 90); setTimeout(() => beep(1046, 0.14), 180); };
const sndFin = () => { [523, 415, 330, 247].forEach((f, i) => setTimeout(() => beep(f, 0.2, "triangle", 0.16), i * 160)); };
const sndDeslumbre = () => beep(300, 0.35, "sine", 0.10);

// ── Marcador / almacenamiento ──────────────────────────
function pintarMarcador() {
  $("#scorePuntos").textContent = G.puntos;
  $("#scoreNivel").textContent = G.nivel;
  $("#scoreMejor").textContent = G.mejor;
}
function cargarMejor() { try { G.mejor = parseInt(localStorage.getItem(KEY_MEJOR)) || 0; } catch { G.mejor = 0; } }
function guardarMejor() { try { localStorage.setItem(KEY_MEJOR, String(G.mejor)); } catch {} }

// ── Generación de obstáculos ────────────────────────────
const POOL = [
  { type: "hueco", peso: 34, tex: "hueco", w: 46, h: 24 },
  { type: "perro", peso: 30, tex: "dog", w: 44, h: 24 },
  { type: "peaton", peso: 36, tex: "ped", w: 22, h: 42 },
];
function tipoAleatorio() {
  let r = Math.random() * 100;
  for (const p of POOL) { if (r < p.peso) return p; r -= p.peso; }
  return POOL[0];
}

// ── Escena Phaser ───────────────────────────────────────
class NocturnaScene extends Phaser.Scene {
  constructor() { super("nocturna"); }

  preload() {
    this.load.svg("car", "../assets/ruta-nocturna/player-car.svg", { width: 40, height: 68 });
    this.load.svg("ped", "../assets/ruta-nocturna/pedestrian.svg", { width: 22, height: 42 });
    this.load.svg("dog", "../assets/ruta-nocturna/dog.svg", { width: 44, height: 24 });
    this.load.svg("hueco", "../assets/ruta-nocturna/pothole.svg", { width: 46, height: 24 });
    this.load.svg("drop", "../assets/ruta-nocturna/raindrop.svg", { width: 6, height: 26 });
    this.load.svg("road", "../assets/ruta-nocturna/road-tile.svg", { width: 64, height: 64 });
  }

  create() {
    window.__nocturna = this; // referencia para los controles externos (pad/teclado)

    this.cameras.main.setBackgroundColor(0x0b0c12);
    this.lights.enable().setAmbientColor(0x181a24);

    // Vía (con textura, afectada por la luz)
    this.road = this.add.tileSprite(VW / 2, VH / 2, VW, VH, "road").setPipeline("Light2D");

    // Bordes de la vía (fuera del cono de luz casi todo el tiempo)
    this.add.rectangle(4, VH / 2, 8, VH, 0x8fd0a6).setAlpha(0.5);
    this.add.rectangle(VW - 4, VH / 2, 8, VH, 0x8fd0a6).setAlpha(0.5);

    // Líneas discontinuas de carril (brillo tenue constante, como pintura reflectiva)
    this.lineas = [];
    for (let i = 1; i < LANES; i++) {
      const g = this.add.graphics();
      this.lineas.push({ g, x: i * (VW / LANES) });
    }
    this.scrollY = 0;

    // Faro delantero: el jugador solo ve bien dentro de este cono
    this.headlight = this.lights.addLight(VW / 2, PLAYER_Y - 170, 205, 0xfff2cc, 2.2);
    this.lights.addLight(VW / 2, -40, 300, 0x2a3550, 0.55); // luna / cielo tenue

    // Jugador
    this.player = this.add.image(LANE_X[1], PLAYER_Y, "car").setPipeline("Light2D");
    this.playerLane = 1;
    this.playerTargetX = LANE_X[1];
    this.invuln = 0;

    // Lluvia (siempre visible, no depende de la luz)
    this.rain = this.add.particles(0, -10, "drop", {
      x: { min: 0, max: VW },
      y: -10,
      lifespan: 800,
      speedY: { min: 320, max: 440 },
      speedX: { min: -15, max: 15 },
      scale: 1,
      alpha: { start: 0.6, end: 0.15 },
      quantity: 2,
      frequency: 55,
    });

    // Flash de deslumbramiento (carro que se acerca de frente con las luces altas)
    this.flash = this.add.rectangle(VW / 2, VH / 2, VW, VH, 0xffffff, 0).setDepth(20);
    this.glareTimer = 5 + Math.random() * 3;

    this.items = []; // { img, tipo, lane, y, resuelto }
    this.spawnTimer = 0.6;
    this.spawnGap = 1.15;

    // Toast de consejo (siempre visible, no depende de la luz)
    this.toastBg = this.add.rectangle(VW / 2, VH / 2, VW - 40, 56, 0x14161c, 0.88).setDepth(21).setVisible(false);
    this.toastTxt = this.add.text(VW / 2, VH / 2, "", {
      fontFamily: getComputedStyle(document.body).fontFamily, fontSize: "13px", fontStyle: "700",
      color: "#FFC91E", align: "center", wordWrap: { width: VW - 64 },
    }).setOrigin(0.5).setDepth(22).setVisible(false);
    this.toastT = 0;

    this.hudVidas = this.add.text(12, 10, "", { fontFamily: "serif", fontSize: "18px" }).setDepth(21);
    this.hudNivel = this.add.text(VW - 12, 10, "", {
      fontFamily: getComputedStyle(document.body).fontFamily, fontSize: "14px", fontStyle: "700", color: "#ffffffeb",
    }).setOrigin(1, 0).setDepth(21);

    setupControlesInternos(this);
  }

  mostrarToast(texto, dur = 3) {
    this.toastTxt.setText(texto);
    this.toastBg.setVisible(true);
    this.toastTxt.setVisible(true);
    this.toastT = dur;
  }

  cambiarCarril(dir) {
    if (!G.playing) return;
    const destino = dir === "left" ? this.playerLane - 1 : this.playerLane + 1;
    if (destino < 0 || destino >= LANES) return;
    this.playerLane = destino;
    this.playerTargetX = LANE_X[destino];
    sndCarril();
  }

  spawnItem() {
    const p = tipoAleatorio();
    const lane = (Math.random() * LANES) | 0;
    const img = this.add.image(LANE_X[lane], -40, p.tex).setPipeline("Light2D");
    this.items.push({ img, tipo: p.type, lane, y: -40, resuelto: false });
  }

  golpe() {
    G.vidas--;
    sndGolpe();
    this.cameras.main.shake(180, 0.01);
    this.flashPulso(0.22, 90);
    this.mostrarToast("💡 De noche cuesta más ver a tiempo: baja la velocidad.", 2.6);
    pintarMarcador();
    if (G.vidas <= 0) { finDelJuego(); return; }
    this.invuln = 1.2;
  }

  subirNivel(n) {
    G.nivel = n;
    G.speed = 175 + (n - 1) * 20;
    sndNivel();
    this.mostrarToast("💡 " + TIPS[(n - 1) % TIPS.length], 3);
    pintarMarcador();
  }

  flashPulso(alfa, ms) {
    this.flash.setAlpha(alfa);
    this.tweens.add({ targets: this.flash, alpha: 0, duration: ms, ease: "Cubic.easeOut" });
  }

  deslumbrar() {
    sndDeslumbre();
    this.flashPulso(0.5, 550);
    this.headlight.radius = 60;
    this.tweens.add({ targets: this.headlight, radius: 205, duration: 900, ease: "Sine.easeOut" });
  }

  update(time, delta) {
    const dt = Math.min(delta / 1000, 0.05);

    // El faro sigue al carro siempre (aunque esté en pantalla de inicio)
    this.player.x += (this.playerTargetX - this.player.x) * Math.min(1, dt * 12);
    this.headlight.x = this.player.x;

    if (this.toastT > 0) {
      this.toastT -= dt;
      if (this.toastT <= 0) { this.toastBg.setVisible(false); this.toastTxt.setVisible(false); }
    }

    if (!G.playing) return;

    G.distancia += G.speed * dt;
    this.scrollY = (this.scrollY + G.speed * dt) % 40;
    this.road.tilePositionY -= G.speed * dt * 0.5;

    const nuevoNivel = 1 + Math.floor(G.distancia / 950);
    if (nuevoNivel > G.nivel) this.subirNivel(nuevoNivel);
    G.puntos = Math.floor(G.distancia / 12);

    if (this.invuln > 0) this.invuln = Math.max(0, this.invuln - dt);

    // Líneas de carril (scroll vertical, pintura tenue siempre visible)
    for (const l of this.lineas) {
      l.g.clear();
      l.g.lineStyle(3, 0xffffff, 0.35);
      const offset = this.scrollY;
      for (let y = -40 + offset; y < VH; y += 40) {
        l.g.beginPath(); l.g.moveTo(l.x, y); l.g.lineTo(l.x, y + 22); l.g.strokePath();
      }
    }

    // Emisión de obstáculos
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnItem();
      const gap = Math.max(0.6, this.spawnGap - (G.nivel - 1) * 0.05);
      this.spawnTimer = gap * (0.75 + Math.random() * 0.5);
    }

    // Deslumbramiento periódico (carro con las luces altas de frente)
    this.glareTimer -= dt;
    if (this.glareTimer <= 0) {
      this.deslumbrar();
      this.glareTimer = Math.max(3.5, 7.5 - (G.nivel - 1) * 0.4) + Math.random() * 2;
    }

    // Mover objetos, resolver colisiones y limpiar los que ya no hacen falta
    const siguen = [];
    for (const it of this.items) {
      it.y += G.speed * dt;
      it.img.y = it.y;
      if (!it.resuelto) {
        const enBanda = Math.abs(it.y - PLAYER_Y) < HIT_BAND;
        if (enBanda && it.lane === this.playerLane && this.invuln <= 0) {
          it.resuelto = true;
          this.golpe();
        }
      }
      if (it.resuelto || it.y > VH + 60) it.img.destroy();
      else siguen.push(it);
    }
    this.items = siguen;

    this.hudVidas.setText("❤️".repeat(G.vidas));
    this.hudNivel.setText("Nivel " + G.nivel);
  }

  reiniciar() {
    this.items.forEach(it => it.img.destroy());
    this.items = [];
    this.playerLane = 1;
    this.playerTargetX = LANE_X[1];
    this.player.x = LANE_X[1];
    this.invuln = 1.0;
    this.spawnTimer = 0.6;
    this.glareTimer = 5 + Math.random() * 3;
    this.toastT = 0;
    this.toastBg.setVisible(false);
    this.toastTxt.setVisible(false);
  }
}

// ── Controles ──────────────────────────────────────────
function setupControlesInternos(scene) {
  scene.input.keyboard.on("keydown", (e) => {
    const map = { ArrowLeft: "left", ArrowRight: "right", a: "left", d: "right", A: "left", D: "right" };
    const accion = map[e.key];
    if (!accion) return;
    e.preventDefault();
    scene.cambiarCarril(accion);
  });
}
function setupControlesExternos() {
  document.querySelectorAll(".nocturna-pad .pad-btn").forEach(b => {
    const accion = b.dataset.accion;
    const disparar = () => { if (window.__nocturna) window.__nocturna.cambiarCarril(accion); };
    b.addEventListener("click", disparar);
    b.addEventListener("touchstart", (e) => { e.preventDefault(); disparar(); }, { passive: false });
  });
  // Deslizar sobre el tablero
  const mount = $("#nocturnaMount");
  let sx = 0;
  mount.addEventListener("touchstart", (e) => { sx = e.changedTouches[0].clientX; }, { passive: true });
  mount.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 24 && window.__nocturna) window.__nocturna.cambiarCarril(dx > 0 ? "right" : "left");
  }, { passive: true });
}

// ── Inicio / fin de partida ────────────────────────────
let game = null;
function iniciarPhaser() {
  if (game) return;
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: "nocturnaMount",
    width: VW,
    height: VH,
    transparent: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [NocturnaScene],
  });
}

function comenzar() {
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume(); } catch (e) {}
  G.playing = true;
  G.puntos = 0; G.nivel = 1; G.vidas = 3; G.distancia = 0; G.speed = 175;
  pintarMarcador();
  $("#nocturnaStart").hidden = true;
  $("#nocturnaStage").hidden = false;
  if (window.__nocturna) window.__nocturna.reiniciar();
}

function finDelJuego() {
  G.playing = false;
  sndFin();
  const puntos = G.puntos;
  if (puntos > G.mejor) { G.mejor = puntos; guardarMejor(); }
  pintarMarcador();
  $("#nocturnaStage").hidden = true;
  $("#startIco").textContent = "🏁";
  $("#startTitle").textContent = "¡Fin del recorrido!";
  $("#startText").innerHTML = `Llegaste a <b>${G.nivel}</b> nivel${G.nivel === 1 ? "" : "es"} con <b>${puntos}</b> punto${puntos === 1 ? "" : "s"}. Tu mejor marca es <b>${G.mejor}</b>. ¿Otra vez?`;
  $("#startBtn").textContent = "▶ Jugar de nuevo";
  $("#nocturnaStart").hidden = false;
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

// ── Init ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  setupTheme();
  setupMute();
  cargarMejor();
  pintarMarcador();
  setupControlesExternos();
  iniciarPhaser();
  $("#startBtn").onclick = comenzar;
});
