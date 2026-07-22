// ═══════════════════════════════════════════════════════
//  YopVial — Guía de Seguridad Vial · lógica y contenido
// ═══════════════════════════════════════════════════════

// ── Estadísticas del hero ──────────────────────────────
const STATS = [
  { num: "90%", label: "de los siniestros son evitables con conducción responsable" },
  { num: "50", label: "km/h: a esa velocidad, un atropello es mortal para un peatón" },
  { num: "3s", label: "de distancia mínima de seguridad con el vehículo de adelante" },
  { num: "#1", label: "el exceso de velocidad es la principal causa de muertes viales" },
];

// ── Normas ─────────────────────────────────────────────
const NORMAS = [
  { icon: "🪖", titulo: "Casco obligatorio", desc: "Conductor y parrillero deben usar casco certificado y bien abrochado, sin excepción.", badge: "Falta grave", color: "#E24B4A" },
  { icon: "🍺", titulo: "Alcohol cero al conducir", desc: "Conducir con cualquier grado de alcohol en la sangre está prohibido. Multa y retención del vehículo.", badge: "Multa alta", color: "#E8530A" },
  { icon: "📵", titulo: "Sin celular al volante", desc: "Usar el teléfono sin manos libres genera comparendo y pone en riesgo tu vida y la de otros.", badge: "Comparendo", color: "#BA7517" },
  { icon: "🔒", titulo: "Cinturón siempre", desc: "Conductor y todos los pasajeros deben llevar el cinturón abrochado, incluso en trayectos cortos.", badge: "Obligatorio", color: "#1D9E75" },
  { icon: "🚦", titulo: "Respeta las señales", desc: "Semáforos, cebras peatonales y señales verticales son de cumplimiento obligatorio.", badge: "Obligatorio", color: "#3C3489" },
  { icon: "🏫", titulo: "Zonas escolares", desc: "Velocidad máxima de 30 km/h frente a colegios e instituciones en horario escolar.", badge: "30 km/h máx.", color: "#185FA5" },
];

// ── Señales de tránsito (con imágenes reales) ──────────
const SENALES = {
  reglamentarias: {
    label: "Reglamentarias",
    desc: "Indican prohibiciones, restricciones y obligaciones. Su incumplimiento es una infracción. Fondo blanco con borde rojo.",
    items: [
      { img: "assets/senales/Pare.png", nombre: "Pare", desc: "Detente por completo antes de la línea. Reanuda solo cuando sea seguro." },
      { img: "assets/senales/prohibido_adelantar.png", nombre: "Prohibido adelantar", desc: "No puedes rebasar otros vehículos en este tramo." },
      { img: "assets/senales/Prohibido_girar_U.png", nombre: "Prohibido giro en U", desc: "No está permitido devolverse cambiando de sentido." },
      { img: "assets/senales/velocidad_maxima.png", nombre: "Velocidad máxima", desc: "No superes la velocidad indicada en la señal." },
    ],
  },
  preventivas: {
    label: "Preventivas",
    desc: "Advierten sobre un peligro cercano en la vía para que reduzcas la velocidad y actúes con precaución. Fondo amarillo.",
    items: [
      { img: "assets/senales/Curva_contracurva_cerrada.png", nombre: "Curva y contracurva", desc: "Curvas cerradas seguidas. Reduce la velocidad antes de entrar." },
      { img: "assets/senales/Peatones.png", nombre: "Zona de peatones", desc: "Cruce de personas cercano. Prepárate para detenerte." },
      { img: "assets/senales/Pendiente_Desendente.png", nombre: "Pendiente descendente", desc: "Bajada pronunciada. Usa freno motor y controla la velocidad." },
      { img: "assets/senales/Conservar_Espacio.png", nombre: "Conservar la derecha", desc: "Mantente en tu carril y conserva la distancia adecuada." },
      { img: "assets/senales/Separador_transito.png", nombre: "Separador de tránsito", desc: "Divisor de calzada adelante. Circula por el lado correcto." },
    ],
  },
  informativas: {
    label: "Informativas",
    desc: "Guían y entregan información útil sobre servicios, destinos y distancias. Fondo azul o verde.",
    items: [
      { emoji: "🅿️", nombre: "Parqueadero", desc: "Zona autorizada para estacionar tu vehículo." },
      { emoji: "🏥", nombre: "Hospital", desc: "Centro de atención médica cercano." },
      { emoji: "⛽", nombre: "Estación de servicio", desc: "Punto de suministro de combustible adelante." },
      { emoji: "🍽️", nombre: "Zona de servicios", desc: "Restaurantes, baños y descanso disponibles." },
      { emoji: "📞", nombre: "Teléfono de emergencia", desc: "Punto de comunicación para auxilio." },
    ],
  },
};

// ── Límites de velocidad ───────────────────────────────
const VELOCIDAD = [
  { kmh: "30", zona: "Zonas escolares y residenciales", desc: "Frente a colegios, hospitales y barrios con alto flujo de peatones.", color: "#E24B4A" },
  { kmh: "50", zona: "Vías urbanas", desc: "Calles y avenidas dentro del perímetro urbano de la ciudad.", color: "#EF9F27" },
  { kmh: "60", zona: "Zonas urbanas rápidas", desc: "Corredores y avenidas principales señalizados.", color: "#EAB308" },
  { kmh: "80", zona: "Vías rurales y nacionales", desc: "Carreteras entre municipios, según señalización.", color: "#1D9E75" },
];

// ── Documentos obligatorios ────────────────────────────
const DOCUMENTOS = [
  { icon: "🪪", titulo: "Licencia de conducción", desc: "Vigente, de la categoría adecuada al vehículo y sin suspensiones activas.", color: "#3C3489" },
  { icon: "🛡️", titulo: "SOAT vigente", desc: "Seguro Obligatorio de Accidentes de Tránsito. Válido en formato físico o digital.", color: "#1D9E75" },
  { icon: "🔧", titulo: "Revisión técnico-mecánica", desc: "Obligatoria para vehículos con más de 2 años (autos) o según normativa.", color: "#E8530A" },
  { icon: "📄", titulo: "Tarjeta de propiedad", desc: "Licencia de tránsito que acredita al propietario del vehículo.", color: "#185FA5" },
];

// ── Infracciones ───────────────────────────────────────
const INFRACCIONES = [
  {
    nivel: "Gravísimas", color: "#E24B4A",
    items: ["Conducir en estado de embriaguez", "Conducir sin licencia o con documentos vencidos", "Exceso de velocidad de más de 30 km/h", "No detenerse en semáforo en rojo", "Adelantar en curva o doble línea"],
  },
  {
    nivel: "Graves", color: "#EF9F27",
    items: ["No usar el cinturón de seguridad", "Conducir motos sin casco", "Usar el celular al conducir", "Estacionar en zona prohibida"],
  },
  {
    nivel: "Leves", color: "#1D9E75",
    items: ["Luces o direccionales sin funcionar", "Placa en mal estado o mal ubicada", "Uso indebido del pito o exceso de ruido", "Estacionar sin señalizar el vehículo"],
  },
];

// ── Consejos por actor vial ────────────────────────────
const CONSEJOS = {
  conductores: {
    label: "🚗 Conductores",
    items: [
      { t: "Mantén la distancia de seguridad", d: "Conserva al menos 3 segundos respecto al vehículo de adelante; auméntalos si llueve o hay niebla." },
      { t: "No manejes cansado", d: "La fatiga reduce tus reflejos igual que el alcohol. Descansa cada 2 horas en viajes largos." },
      { t: "Revisa tu vehículo antes de salir", d: "Frenos, llantas, luces, espejos y niveles. Un vehículo en mal estado causa muchos accidentes." },
      { t: "Anticípate, no reacciones", d: "Mira lejos, prevé el comportamiento de otros y evita frenadas y giros bruscos." },
    ],
  },
  motociclistas: {
    label: "🏍️ Motociclistas",
    items: [
      { t: "Casco certificado y abrochado", d: "Tuyo y del parrillero. Es tu principal protección ante una caída." },
      { t: "Hazte visible", d: "Usa luces encendidas siempre y ropa reflectiva. Evita los puntos ciegos de los carros." },
      { t: "No zigzaguees entre carros", d: "Circula por tu carril. El 'colarse' es causa frecuente de siniestros graves." },
      { t: "Frena con ambos frenos", d: "Combina freno delantero y trasero de forma progresiva, sobre todo en piso mojado." },
    ],
  },
  peatones: {
    label: "🚶 Peatones",
    items: [
      { t: "Cruza por las cebras", d: "Usa siempre los cruces peatonales y los puentes. Nunca entre vehículos estacionados." },
      { t: "Mira antes de cruzar", d: "Izquierda, derecha y de nuevo izquierda. Haz contacto visual con los conductores." },
      { t: "Camina por el andén", d: "Si no hay, hazlo por el borde de frente al tránsito para ver los vehículos." },
      { t: "Evita distracciones", d: "No cruces mirando el celular ni con audífonos a alto volumen." },
    ],
  },
  ciclistas: {
    label: "🚴 Ciclistas",
    items: [
      { t: "Usa casco y elementos reflectivos", d: "Casco siempre, y luz blanca adelante y roja atrás en la noche." },
      { t: "Respeta las señales", d: "Detente en los semáforos y señales igual que cualquier vehículo." },
      { t: "Circula por la ciclorruta", d: "Cuando exista, úsala. En la vía, ocupa tu carril y sé predecible." },
      { t: "Señaliza tus giros", d: "Usa el brazo para indicar hacia dónde vas a girar o detenerte." },
    ],
  },
};

// ── Pasos en caso de accidente ─────────────────────────
const ACCIDENTE = [
  { t: "Detén el vehículo y enciende las luces de emergencia", d: "No abandones el lugar. Señaliza para evitar más colisiones y ponte a salvo." },
  { t: "Auxilia a los heridos y llama a emergencias", d: "Marca 123. No muevas a una persona lesionada salvo que haya riesgo inminente (fuego, etc.)." },
  { t: "Intercambia datos con los involucrados", d: "Nombres, cédulas, placas, SOAT y aseguradoras. Toma fotos y videos del lugar." },
  { t: "Reporta a la autoridad y a tu aseguradora", d: "Espera a la autoridad de tránsito si hay heridos y avisa a tu aseguradora dentro de las 24 horas." },
];

// ── Zonas / puntos de riesgo ───────────────────────────
const ZONAS = [
  { nivel: "Riesgo alto", color: "#E24B4A", nombre: "Intersecciones sin semáforo", desc: "Cruces de alto flujo donde chocan vehículos que no ceden el paso." },
  { nivel: "Riesgo alto", color: "#E24B4A", nombre: "Curvas y pendientes", desc: "Puntos ciegos y pérdida de control por exceso de velocidad." },
  { nivel: "Riesgo medio", color: "#EF9F27", nombre: "Zonas escolares", desc: "Alta presencia de niños y peatones en horas de entrada y salida." },
  { nivel: "Riesgo alto", color: "#E24B4A", nombre: "Vías interurbanas", desc: "Adelantamientos imprudentes y baja visibilidad nocturna." },
  { nivel: "Riesgo medio", color: "#EF9F27", nombre: "Glorietas", desc: "Confusión por señalización insuficiente y choques laterales." },
  { nivel: "Riesgo alto", color: "#E24B4A", nombre: "Zonas de rumba", desc: "Conducción bajo efectos del alcohol en horario nocturno." },
];

// ── Números de emergencia ──────────────────────────────
const EMERGENCIAS = [
  { icon: "🚨", name: "Emergencias", num: "123", sub: "Línea única nacional", color: "#E24B4A" },
  { icon: "🚑", name: "Ambulancias", num: "125", sub: "Cruz Roja", color: "#1D9E75" },
  { icon: "🚒", name: "Bomberos", num: "119", sub: "Cuerpo de bomberos", color: "#EF9F27" },
  { icon: "🚓", name: "Policía", num: "112", sub: "Policía Nacional", color: "#185FA5" },
];

// ═══════════════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════════════
const $ = (sel) => document.querySelector(sel);
const html = (el, content) => { if (el) el.innerHTML = content; };

function renderStats() {
  html($("#heroStats"), STATS.map(s => `
    <div class="stat reveal">
      <div class="stat-num">${s.num}</div>
      <div class="stat-label">${s.label}</div>
    </div>`).join(""));
}

function renderNormas() {
  html($("#normasGrid"), NORMAS.map(n => `
    <article class="card reveal" style="--accent:${n.color}">
      <div class="card-icon">${n.icon}</div>
      <h3>${n.titulo}</h3>
      <p>${n.desc}</p>
      <span class="badge" style="--accent:${n.color}">${n.badge}</span>
    </article>`).join(""));
}

function renderSenales(activeKey = "reglamentarias") {
  const keys = Object.keys(SENALES);
  html($("#senalesTabs"), keys.map(k => `
    <button class="tab ${k === activeKey ? "active" : ""}" data-tab="${k}">${SENALES[k].label}</button>`).join(""));

  const grupo = SENALES[activeKey];
  const cards = grupo.items.map(s => {
    const visual = s.img
      ? `<div class="signal-img"><img src="${s.img}" alt="${s.nombre}" loading="lazy" /></div>`
      : `<div class="signal-emoji">${s.emoji}</div>`;
    return `<article class="card signal reveal">
      ${visual}
      <h3>${s.nombre}</h3>
      <p>${s.desc}</p>
    </article>`;
  }).join("");

  html($("#senalesGrid"), `<p class="tab-desc">${grupo.desc}</p><div class="cards signals-inner">${cards}</div>`);

  $("#senalesTabs").querySelectorAll(".tab").forEach(btn =>
    btn.addEventListener("click", () => { renderSenales(btn.dataset.tab); observeReveals(); }));
}

function renderVelocidad() {
  html($("#velocidadGrid"), VELOCIDAD.map(v => `
    <div class="speed reveal" style="--accent:${v.color}">
      <div class="speed-num">${v.kmh}<small>km/h</small></div>
      <div class="speed-zone">${v.zona}</div>
      <div class="speed-desc">${v.desc}</div>
    </div>`).join(""));
}

function renderDocumentos() {
  html($("#documentosGrid"), DOCUMENTOS.map(d => `
    <div class="doc reveal" style="--accent:${d.color}">
      <div class="doc-icon">${d.icon}</div>
      <div>
        <h3>${d.titulo}</h3>
        <p>${d.desc}</p>
      </div>
    </div>`).join(""));
}

function renderInfracciones() {
  html($("#infraccionesGrid"), INFRACCIONES.map(i => `
    <article class="card infraction reveal" style="--accent:${i.color}">
      <div class="infraction-head">
        <h3>${i.nivel}</h3>
      </div>
      <ul>${i.items.map(it => `<li>${it}</li>`).join("")}</ul>
    </article>`).join(""));
}

function renderConsejos(activeKey = "conductores") {
  const keys = Object.keys(CONSEJOS);
  html($("#consejosTabs"), keys.map(k => `
    <button class="tab ${k === activeKey ? "active" : ""}" data-tab="${k}">${CONSEJOS[k].label}</button>`).join(""));

  html($("#consejosList"), CONSEJOS[activeKey].items.map((c, i) => `
    <li class="tip reveal">
      <div class="tip-num">${String(i + 1).padStart(2, "0")}</div>
      <div>
        <h3>${c.t}</h3>
        <p>${c.d}</p>
      </div>
    </li>`).join(""));

  $("#consejosTabs").querySelectorAll(".tab").forEach(btn =>
    btn.addEventListener("click", () => { renderConsejos(btn.dataset.tab); observeReveals(); }));
}

function renderAccidente() {
  html($("#accidenteSteps"), ACCIDENTE.map((s, i) => `
    <li class="step reveal">
      <div class="step-num">${i + 1}</div>
      <div>
        <h3>${s.t}</h3>
        <p>${s.d}</p>
      </div>
    </li>`).join(""));
}

function renderZonas() {
  html($("#zonasGrid"), ZONAS.map(z => `
    <article class="card zona reveal">
      <div class="zona-tag" style="--accent:${z.color}"><span class="dot"></span>${z.nivel}</div>
      <h3>${z.nombre}</h3>
      <p>${z.desc}</p>
    </article>`).join(""));
}

function renderEmergencias() {
  html($("#emergGrid"), EMERGENCIAS.map(e => `
    <article class="card emerg reveal" style="--accent:${e.color}">
      <div class="emerg-icon">${e.icon}</div>
      <div class="emerg-num">${e.num}</div>
      <div class="emerg-name">${e.name}</div>
      <div class="emerg-sub">${e.sub}</div>
    </article>`).join(""));
}

// ═══════════════════════════════════════════════════════
//  INTERACCIÓN
// ═══════════════════════════════════════════════════════
let revealObserver;
function observeReveals() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
  }
  document.querySelectorAll(".reveal:not(.active)").forEach(el => revealObserver.observe(el));
}

function setupTheme() {
  const btn = $("#themeToggle");
  if (!btn) return;
  const apply = (t) => {
    document.documentElement.setAttribute("data-theme", t);
    btn.textContent = t === "light" ? "🌙" : "☀️";
    btn.title = t === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro";
  };
  let theme = document.documentElement.getAttribute("data-theme") || "dark";
  apply(theme);
  btn.addEventListener("click", () => {
    theme = theme === "light" ? "dark" : "light";
    try { localStorage.setItem("yopvial_theme", theme); } catch (e) {}
    apply(theme);
  });
}

function setupMenu() {
  const toggle = $("#navToggle");
  const links = $("#navLinks");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("active");
    toggle.classList.toggle("active", open);
    toggle.setAttribute("aria-expanded", open);
  });
  links.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => {
      links.classList.remove("active");
      toggle.classList.remove("active");
      toggle.setAttribute("aria-expanded", false);
    }));
}

function setupScrollUI() {
  const nav = $("#nav");
  const toTop = $("#toTop");
  const heroArt = $("#heroArt");
  const links = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = [...links].map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);

  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 20);
    toTop.classList.toggle("show", y > 500);

    // Pulgar de la mascota: 0 (arriba) al inicio → 1 (abajo) al bajar el hero
    if (heroArt) {
      const span = window.innerHeight * 0.6;         // recorrido del efecto
      const thumb = Math.min(Math.max(y / span, 0), 1);
      heroArt.style.setProperty("--thumb", thumb.toFixed(3));
    }

    let current = "";
    sections.forEach(sec => { if (y >= sec.offsetTop - 120) current = sec.id; });
    links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${current}`));
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

// ── Init ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderStats();
  renderNormas();
  renderSenales();
  renderVelocidad();
  renderDocumentos();
  renderInfracciones();
  renderConsejos();
  renderAccidente();
  renderZonas();
  renderEmergencias();

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  setupTheme();
  setupMenu();
  setupScrollUI();
  observeReveals();
});
