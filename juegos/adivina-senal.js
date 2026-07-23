// ═══════════════════════════════════════════════════════
//  YopVial — Juego "Adivina la señal" (opción múltiple + tiempo)
// ═══════════════════════════════════════════════════════

const SENALES = [
  { img: "../assets/senales/Pare.png",                     nombre: "Pare" },
  { img: "../assets/senales/prohibido_adelantar.png",      nombre: "Prohibido adelantar" },
  { img: "../assets/senales/Prohibido_girar_U.png",        nombre: "Prohibido giro en U" },
  { img: "../assets/senales/velocidad_maxima.png",         nombre: "Velocidad máxima" },
  { img: "../assets/senales/Curva_contracurva_cerrada.png",nombre: "Curva y contracurva" },
  { img: "../assets/senales/Peatones.png",                 nombre: "Zona de peatones" },
  { img: "../assets/senales/Pendiente_Desendente.png",     nombre: "Pendiente descendente" },
  { img: "../assets/senales/Conservar_Espacio.png",        nombre: "Conservar la derecha" },
  { img: "../assets/senales/Separador_transito.png",       nombre: "Separador de tránsito" },
  { img: "../assets/senales/Parqueadero.png",              nombre: "Parqueadero" },
  { img: "../assets/senales/Hospital.png",                 nombre: "Hospital" },
  { img: "../assets/senales/Estacion_servicio.png",        nombre: "Estación de servicio" },
  { img: "../assets/senales/Zona_servicios.png",           nombre: "Zona de servicios" },
  { img: "../assets/senales/Telefono_emergencia.png",      nombre: "Teléfono de emergencia" },
];

const TIEMPO = 10;                 // segundos por señal
const KEY_MEJOR = "yopvial_adivina_mejor";

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const estado = {
  aciertos: 0, racha: 0, mejor: 0,
  orden: [], pos: 0,
  actual: null,
  respondido: false,
  timeLeft: TIEMPO,
  timerInt: null,
  autoNext: null,
};

// ── Utilidades ─────────────────────────────────────────
function barajar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function cargarMejor() { try { estado.mejor = parseInt(localStorage.getItem(KEY_MEJOR)) || 0; } catch { estado.mejor = 0; } }
function guardarMejor() { try { localStorage.setItem(KEY_MEJOR, String(estado.mejor)); } catch {} }

// ── Nueva ronda ────────────────────────────────────────
function nuevaRonda() {
  clearTimeout(estado.autoNext);
  clearInterval(estado.timerInt);
  estado.respondido = false;

  if (estado.pos >= estado.orden.length) { estado.orden = barajar([...SENALES.keys()]); estado.pos = 0; }
  estado.actual = SENALES[estado.orden[estado.pos++]];

  // Imagen
  $("#senalImg").innerHTML = `<img src="${estado.actual.img}" alt="Señal de tránsito" />`;

  // Opciones: la correcta + 3 distractores
  const distractores = barajar(SENALES.filter(s => s.nombre !== estado.actual.nombre)).slice(0, 3);
  const opciones = barajar([estado.actual.nombre, ...distractores.map(s => s.nombre)]);
  $("#options").innerHTML = opciones.map(n =>
    `<button class="option" data-nombre="${n}">${n}</button>`).join("");
  $$("#options .option").forEach(b => b.onclick = () => responder(b.dataset.nombre));

  $("#result").hidden = true;
  $("#nextBtn").hidden = true;

  iniciarTimer();
}

// ── Cronómetro ─────────────────────────────────────────
function iniciarTimer() {
  estado.timeLeft = TIEMPO;
  pintarTimer();
  estado.timerInt = setInterval(() => {
    estado.timeLeft = Math.max(0, estado.timeLeft - 0.1);
    pintarTimer();
    if (estado.timeLeft <= 0) { clearInterval(estado.timerInt); responder(null); }
  }, 100);
}
function pintarTimer() {
  $("#timeLeft").textContent = Math.ceil(estado.timeLeft);
  const bar = $("#timerBar");
  bar.style.width = (estado.timeLeft / TIEMPO * 100) + "%";
  bar.classList.toggle("low", estado.timeLeft <= 3);
}

// ── Responder ──────────────────────────────────────────
function responder(seleccion) {   // null = se acabó el tiempo
  if (estado.respondido) return;
  estado.respondido = true;
  clearInterval(estado.timerInt);

  const correcta = estado.actual.nombre;
  const gano = seleccion === correcta;

  $$("#options .option").forEach(b => {
    b.disabled = true;
    if (b.dataset.nombre === correcta) b.classList.add("ok");
    else if (b.dataset.nombre === seleccion) b.classList.add("no");
  });

  if (gano) {
    estado.aciertos++; estado.racha++;
    if (estado.racha > estado.mejor) { estado.mejor = estado.racha; guardarMejor(); }
  } else {
    estado.racha = 0;
  }

  const res = $("#result");
  res.hidden = false;
  res.className = "result " + (gano ? "win" : "lose");
  res.textContent = gano
    ? "¡Correcto! 🎉"
    : (seleccion === null ? `¡Se acabó el tiempo! Era "${correcta}".` : `¡Casi! Era "${correcta}".`);

  pintarMarcador();
  $("#nextBtn").hidden = false;
  estado.autoNext = setTimeout(nuevaRonda, 2000);
}

function pintarMarcador() {
  $("#scoreAciertos").textContent = estado.aciertos;
  $("#scoreRacha").textContent = estado.racha;
  $("#scoreMejor").textContent = estado.mejor;
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
  estado.orden = barajar([...SENALES.keys()]);
  estado.pos = 0;
  pintarMarcador();
  nuevaRonda();

  $("#nextBtn").onclick = () => nuevaRonda();
});
