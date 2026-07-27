// ═══════════════════════════════════════════════════════
//  YopVial — Juego "Quiz vial" (trivia + contrarreloj)
//  Preguntas de opción múltiple sobre normas, señales,
//  documentos, infracciones, consejos y emergencias.
// ═══════════════════════════════════════════════════════

// Todas las respuestas están basadas en el mismo contenido ya
// publicado en la guía (Ley 769 de 2002 y buenas prácticas).
const PREGUNTAS = [
  { cat: "Normas", q: "¿Qué deben usar siempre el conductor y el parrillero de una moto?",
    correcta: "Casco certificado bien abrochado",
    incorrectas: ["Gafas de sol", "Guantes de cualquier tipo", "Chaqueta reflectiva únicamente"],
    exp: "El casco certificado y bien abrochado es obligatorio para conductor y parrillero, sin excepción." },
  { cat: "Normas", q: "¿Cuánto alcohol en la sangre está permitido para conducir en Colombia?",
    correcta: "Ninguno: cualquier grado está prohibido",
    incorrectas: ["Hasta 0.5 gramos por litro", "Hasta una cerveza", "Depende del tipo de vehículo"],
    exp: "Conducir con cualquier grado de alcohol en la sangre está prohibido y genera multa y retención del vehículo." },
  { cat: "Normas", q: "¿Puedes hablar por celular sin manos libres mientras conduces?",
    correcta: "No, genera comparendo",
    incorrectas: ["Sí, si vas despacio", "Sí, en vías rurales", "Solo si el semáforo está en rojo"],
    exp: "Usar el teléfono sin manos libres al conducir genera comparendo y pone en riesgo tu vida y la de otros." },
  { cat: "Normas", q: "¿Cuál es la velocidad máxima frente a colegios en horario escolar?",
    correcta: "30 km/h", incorrectas: ["50 km/h", "60 km/h", "80 km/h"],
    exp: "Frente a colegios e instituciones en horario escolar, el límite es de 30 km/h." },

  { cat: "Velocidad", q: "¿Cuál es el límite típico de velocidad en vías urbanas?",
    correcta: "50 km/h", incorrectas: ["30 km/h", "80 km/h", "100 km/h"],
    exp: "En calles y avenidas dentro del perímetro urbano, el límite habitual es 50 km/h." },
  { cat: "Velocidad", q: "¿En qué tipo de vía se permite hasta 80 km/h, según señalización?",
    correcta: "Vías rurales y nacionales",
    incorrectas: ["Zonas escolares", "Calles residenciales", "Parqueaderos"],
    exp: "Las carreteras entre municipios permiten hasta 80 km/h, según la señalización de cada tramo." },

  { cat: "Documentos", q: "¿Qué documento te respalda económicamente en caso de accidente de tránsito?",
    correcta: "El SOAT",
    incorrectas: ["La tarjeta de propiedad", "La licencia de conducción", "El pase de conducción"],
    exp: "El SOAT (Seguro Obligatorio de Accidentes de Tránsito) es el respaldo obligatorio ante un accidente." },
  { cat: "Documentos", q: "¿Qué acredita la tarjeta de propiedad de un vehículo?",
    correcta: "Quién es el propietario del vehículo",
    incorrectas: ["Que el conductor puede manejar", "Que el SOAT está pago", "Que pasó la técnico-mecánica"],
    exp: "La tarjeta de propiedad (licencia de tránsito) acredita al propietario del vehículo." },
  { cat: "Documentos", q: "¿Qué revisión es obligatoria para autos con más de 2 años, según la normativa?",
    correcta: "La técnico-mecánica",
    incorrectas: ["El SOAT", "La licencia de conducción", "La tarjeta de propiedad"],
    exp: "La revisión técnico-mecánica es obligatoria para vehículos con más de 2 años, según normativa." },

  { cat: "Infracciones", q: "¿Qué ley contiene el Código Nacional de Tránsito de Colombia?",
    correcta: "Ley 769 de 2002",
    incorrectas: ["Ley 100 de 1993", "Ley 1801 de 2016", "Ley 599 de 2000"],
    exp: "El Código Nacional de Tránsito está contenido en la Ley 769 de 2002." },
  { cat: "Infracciones", q: "Conducir en estado de embriaguez se clasifica como una infracción...",
    correcta: "Gravísima", incorrectas: ["Leve", "Menor", "No es infracción si vas despacio"],
    exp: "Conducir en estado de embriaguez es una infracción gravísima según el artículo 131 de la Ley 769." },
  { cat: "Infracciones", q: "No usar el cinturón de seguridad es una infracción...",
    correcta: "Grave", incorrectas: ["Gravísima", "Leve", "No aplica a los pasajeros"],
    exp: "No usar el cinturón (conductor o pasajeros) es una infracción grave, artículos 82 y 131 de la Ley 769." },
  { cat: "Infracciones", q: "Adelantar en curva o doble línea es una infracción...",
    correcta: "Gravísima", incorrectas: ["Leve", "Grave", "Solo aplica de noche"],
    exp: "Adelantar donde la visibilidad o la señalización lo prohíben es una infracción gravísima." },

  { cat: "Consejos", q: "¿Cuántos segundos de distancia mínima se recomiendan con el vehículo de adelante?",
    correcta: "3 segundos", incorrectas: ["1 segundo", "10 segundos", "No es necesario si vas despacio"],
    exp: "Se recomienda mantener al menos 3 segundos de distancia, más si llueve o hay niebla." },
  { cat: "Consejos", q: "Antes de cruzar la calle, ¿qué debes hacer?",
    correcta: "Mirar izquierda, derecha y de nuevo izquierda",
    incorrectas: ["Cruzar rápido sin mirar", "Solo mirar hacia adelante", "Esperar a que un carro te ceda el paso primero"],
    exp: "Mira izquierda, derecha y de nuevo izquierda, y haz contacto visual con los conductores." },
  { cat: "Consejos", q: "Si hay ciclorruta disponible, ¿por dónde debe circular un ciclista?",
    correcta: "Por la ciclorruta",
    incorrectas: ["Por el andén", "Por cualquier carril", "Por la vía en contravía"],
    exp: "Cuando exista ciclorruta, el ciclista debe usarla; si no, debe ocupar su carril y ser predecible." },
  { cat: "Consejos", q: "¿Qué deben usar los motociclistas para ser más visibles de noche?",
    correcta: "Luces encendidas y ropa reflectiva",
    incorrectas: ["Solo el casco", "Bocina constante", "Nada especial"],
    exp: "Usar luces encendidas siempre y ropa reflectiva ayuda a evitar los puntos ciegos de otros vehículos." },

  { cat: "Accidentes", q: "¿A qué número llamas en Colombia para emergencias?",
    correcta: "123", incorrectas: ["112", "119", "125"],
    exp: "El 123 es la línea única nacional de emergencias." },
  { cat: "Accidentes", q: "¿Qué debes hacer primero si tienes un accidente de tránsito?",
    correcta: "Detener el vehículo y encender las luces de emergencia",
    incorrectas: ["Salir corriendo del lugar", "Mover a los heridos de inmediato", "Discutir quién tuvo la culpa"],
    exp: "Detén el vehículo, enciende las luces de emergencia, señaliza y ponte a salvo sin abandonar el lugar." },
  { cat: "Accidentes", q: "¿Dentro de cuánto tiempo debes avisar a tu aseguradora tras un accidente?",
    correcta: "24 horas", incorrectas: ["7 días", "1 mes", "No es necesario avisar"],
    exp: "Debes avisar a tu aseguradora dentro de las 24 horas siguientes al accidente." },
  { cat: "Accidentes", q: "¿Cuál es el número de la Cruz Roja / ambulancias?",
    correcta: "125", incorrectas: ["119", "112", "123"],
    exp: "El 125 corresponde a la Cruz Roja / ambulancias." },
  { cat: "Accidentes", q: "¿Cuál es el número de la Policía Nacional?",
    correcta: "112", incorrectas: ["119", "125", "123"],
    exp: "El 112 corresponde a la Policía Nacional." },
  { cat: "Accidentes", q: "¿Cuál es el número de Bomberos?",
    correcta: "119", incorrectas: ["112", "125", "123"],
    exp: "El 119 corresponde al Cuerpo de Bomberos." },

  { cat: "Señales", q: "¿Qué color de fondo tienen las señales preventivas?",
    correcta: "Amarillo", incorrectas: ["Blanco con borde rojo", "Azul", "Verde"],
    exp: "Las señales preventivas usan fondo amarillo y advierten sobre un peligro cercano." },
  { cat: "Señales", q: "¿Qué forma tiene la señal de PARE?",
    correcta: "Octágono", incorrectas: ["Triángulo", "Círculo", "Rectángulo"],
    exp: "La señal de PARE es un octágono de fondo rojo con borde blanco." },
  { cat: "Señales", q: "¿Qué indican las señales reglamentarias (fondo blanco, borde rojo)?",
    correcta: "Prohibiciones, restricciones y obligaciones",
    incorrectas: ["Servicios cercanos como hospitales", "Curvas y pendientes", "Distancias entre ciudades"],
    exp: "Las señales reglamentarias indican prohibiciones, restricciones y obligaciones; incumplirlas es una infracción." },
];

const TIEMPO = 15; // segundos por pregunta
const KEY_MEJOR = "yopvial_quiz_mejor";

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

  if (estado.pos >= estado.orden.length) {
    const ultima = estado.actual;
    do { estado.orden = barajar([...PREGUNTAS.keys()]); }
    while (ultima && PREGUNTAS[estado.orden[0]].q === ultima.q);
    estado.pos = 0;
  }
  estado.actual = PREGUNTAS[estado.orden[estado.pos++]];

  $("#quizCat").textContent = estado.actual.cat;
  $("#quizQ").textContent = estado.actual.q;
  $("#quizExplain").hidden = true;

  const opciones = barajar([estado.actual.correcta, ...estado.actual.incorrectas]);
  $("#options").innerHTML = opciones.map(o =>
    `<button class="option" data-opcion="${o.replace(/"/g, "&quot;")}">${o}</button>`).join("");
  $$("#options .option").forEach(b => b.onclick = () => responder(b.dataset.opcion));

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
  bar.style.transform = `scaleX(${estado.timeLeft / TIEMPO})`;
  bar.classList.toggle("low", estado.timeLeft <= 3);
}

// ── Responder ──────────────────────────────────────────
function responder(seleccion) { // null = se acabó el tiempo
  if (estado.respondido) return;
  estado.respondido = true;
  clearInterval(estado.timerInt);

  const correcta = estado.actual.correcta;
  const gano = seleccion === correcta;

  $$("#options .option").forEach(b => {
    b.disabled = true;
    if (b.dataset.opcion === correcta) b.classList.add("ok");
    else if (b.dataset.opcion === seleccion) b.classList.add("no");
  });

  const res = $("#result");
  res.hidden = false;
  $("#quizExplain").hidden = false;
  $("#quizExplain").textContent = "💡 " + estado.actual.exp;

  if (gano) {
    estado.aciertos++; estado.racha++;
    if (estado.racha > estado.mejor) { estado.mejor = estado.racha; guardarMejor(); }
    pintarMarcador();
    res.className = "result win";
    res.textContent = "¡Correcto! 🎉";
    $("#nextBtn").hidden = false;
    estado.autoNext = setTimeout(nuevaRonda, 2600);
  } else {
    res.className = "result lose";
    res.textContent = (seleccion === null
      ? `¡Se acabó el tiempo! Era "${correcta}".`
      : `¡Fallaste! Era "${correcta}".`) + ` Terminaste con ${estado.aciertos} acierto${estado.aciertos === 1 ? "" : "s"}.`;
    $("#nextBtn").hidden = true;
    estado.autoNext = setTimeout(finDelJuego, 3400);
  }
}

// ── Fin de la partida: reinicia stats (menos mejor racha) y vuelve al inicio ──
function finDelJuego() {
  clearTimeout(estado.autoNext);
  clearInterval(estado.timerInt);
  const aciertosPartida = estado.aciertos;
  estado.aciertos = 0;
  estado.racha = 0;
  pintarMarcador();

  $("#quizBody").hidden = true;
  $("#startIco").textContent = "🏁";
  $("#startTitle").textContent = "¡Fin de la partida!";
  $("#startText").innerHTML = `Conseguiste <b>${aciertosPartida}</b> acierto${aciertosPartida === 1 ? "" : "s"}. Tu mejor racha es <b>${estado.mejor}</b>. ¿Lo intentas de nuevo?`;
  $("#startBtn").textContent = "▶ Jugar de nuevo";
  $("#quizStart").hidden = false;
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
function comenzar() {
  estado.aciertos = 0;
  estado.racha = 0;
  estado.actual = null;
  pintarMarcador();
  $("#quizStart").hidden = true;
  $("#quizBody").hidden = false;
  nuevaRonda();
}

document.addEventListener("DOMContentLoaded", () => {
  setupTheme();
  cargarMejor();
  estado.orden = barajar([...PREGUNTAS.keys()]);
  estado.pos = 0;
  pintarMarcador();
  // El juego NO arranca solo: espera al botón "Comenzar".
  $("#startBtn").onclick = comenzar;
  $("#nextBtn").onclick = () => nuevaRonda();
});
