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
  { icon: "🪖", img: "assets/normas/casco.png", titulo: "Casco obligatorio", desc: "Conductor y parrillero deben usar casco certificado y bien abrochado, sin excepción.", badge: "Falta grave", color: "#E24B4A" },
  { icon: "🍺", img: "assets/normas/alcohol.png", titulo: "Alcohol cero al conducir", desc: "Conducir con cualquier grado de alcohol en la sangre está prohibido. Multa y retención del vehículo.", badge: "Multa alta", color: "#E8530A" },
  { icon: "📵", img: "assets/normas/celular.png", titulo: "Sin celular al volante", desc: "Usar el teléfono sin manos libres genera comparendo y pone en riesgo tu vida y la de otros.", badge: "Comparendo", color: "#BA7517" },
  { icon: "🔒", img: "assets/normas/cinturon.png", titulo: "Cinturón siempre", desc: "Conductor y todos los pasajeros deben llevar el cinturón abrochado, incluso en trayectos cortos.", badge: "Obligatorio", color: "#1D9E75" },
  { icon: "🚦", img: "assets/normas/senales.png", titulo: "Respeta las señales", desc: "Semáforos, cebras peatonales y señales verticales son de cumplimiento obligatorio.", badge: "Obligatorio", color: "#3C3489" },
  { icon: "🏫", img: "assets/normas/zonas-escolares.png", titulo: "Zonas escolares", desc: "Velocidad máxima de 30 km/h frente a colegios e instituciones en horario escolar.", badge: "30 km/h máx.", color: "#185FA5" },
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
      { img: "assets/senales/Parqueadero.png", nombre: "Parqueadero", desc: "Zona autorizada para estacionar tu vehículo." },
      { img: "assets/senales/Hospital.png", nombre: "Hospital", desc: "Centro de atención médica cercano." },
      { img: "assets/senales/Estacion_servicio.png", nombre: "Estación de servicio", desc: "Punto de suministro de combustible adelante." },
      { img: "assets/senales/Zona_servicios.png", nombre: "Zona de servicios", desc: "Restaurantes, baños y descanso disponibles." },
      { img: "assets/senales/Telefono_emergencia.png", nombre: "Teléfono de emergencia", desc: "Punto de comunicación para auxilio." },
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
  { icon: "🪪", img: "assets/documentos/Licencia_conduccion.png", titulo: "Licencia de conducción", desc: "Vigente, de la categoría adecuada al vehículo y sin suspensiones activas.", color: "#3C3489" },
  { icon: "🛡️", img: "assets/documentos/Soat.png", titulo: "SOAT vigente", desc: "Seguro Obligatorio de Accidentes de Tránsito. Válido en formato físico o digital.", color: "#1D9E75" },
  { icon: "🔧", img: "assets/documentos/Tecnico_mecanica.png", titulo: "Revisión técnico-mecánica", desc: "Obligatoria para vehículos con más de 2 años (autos) o según normativa.", color: "#E8530A" },
  { icon: "📄", img: "assets/documentos/Tarjeta_propiedad.png", titulo: "Tarjeta de propiedad", desc: "Licencia de tránsito que acredita al propietario del vehículo.", color: "#185FA5" },
];

// ── Infracciones ───────────────────────────────────────
const INFRACCIONES = [
  {
    nivel: "Gravísimas", color: "#E24B4A",
    items: [
      { t: "Conducir en estado de embriaguez", d: "Conducir después de consumir alcohol o sustancias psicoactivas disminuye la capacidad de reacción y pone en riesgo la vida de todos los usuarios de la vía.", ley: "Ley 769 de 2002 (Código Nacional de Tránsito), artículo 131. Modificada y reforzada por la Ley 1696 de 2013, que aumenta las sanciones por conducir en estado de embriaguez." },
      { t: "Conducir sin licencia o con documentos vencidos", d: "Se infringe cuando el conductor no posee licencia válida, conduce con una categoría diferente o circula con documentos obligatorios vencidos.", ley: "Ley 769 de 2002, artículo 131, infracción D.1." },
      { t: "Exceso de velocidad de más de 30 km/h", d: "Ocurre cuando se supera ampliamente el límite máximo permitido para la vía, aumentando considerablemente el riesgo de accidentes.", ley: "Ley 769 de 2002, artículos 106 y 107 (límites de velocidad) y artículo 131 (comparendos por exceder los límites establecidos)." },
      { t: "No detenerse en semáforo en rojo", d: "Se comete al cruzar una intersección sin respetar la luz roja o la señal reglamentaria de PARE.", ley: "Ley 769 de 2002, artículo 131, infracción D.4." },
      { t: "Adelantar en curva o doble línea", d: "Consiste en sobrepasar otro vehículo en lugares donde la visibilidad o la señalización lo prohíben, generando alto riesgo de colisión.", ley: "Ley 769 de 2002, artículo 131, infracción D.6." },
    ],
  },
  {
    nivel: "Graves", color: "#EF9F27",
    items: [
      { t: "No usar el cinturón de seguridad", d: "El conductor o los pasajeros viajan sin utilizar el cinturón, reduciendo significativamente la protección en caso de accidente.", ley: "Ley 769 de 2002, artículo 82 (uso obligatorio del cinturón) y artículo 131, infracción C.6." },
      { t: "Conducir motos sin casco", d: "El motociclista o su acompañante circulan sin casco de seguridad debidamente asegurado.", ley: "Ley 769 de 2002, artículo 96 y artículo 131." },
      { t: "Usar el celular al conducir", d: "Manipular un teléfono móvil u otro dispositivo electrónico mientras se conduce, excepto mediante sistemas manos libres permitidos.", ley: "Ley 769 de 2002, artículo 131, infracción C.38." },
      { t: "Estacionar en zona prohibida", d: "Dejar el vehículo en lugares donde la señalización o la norma prohíben el estacionamiento, afectando la movilidad y la seguridad vial.", ley: "Ley 769 de 2002, artículo 77 y artículo 131, infracción C.39." },
    ],
  },
  {
    nivel: "Leves", color: "#1D9E75",
    items: [
      { t: "Luces o direccionales sin funcionar", d: "Circular con luces principales, de freno o direccionales dañadas o apagadas cuando son obligatorias.", ley: "Ley 769 de 2002, artículo 131, infracción D.8." },
      { t: "Placa en mal estado o mal ubicada", d: "La placa no es visible, está deteriorada, modificada o instalada en un lugar diferente al autorizado.", ley: "Ley 769 de 2002, artículos 43 y 44, y sanciones del artículo 131." },
      { t: "Uso indebido del pito o exceso de ruido", d: "Utilizar la bocina sin necesidad o generar ruidos que afecten la tranquilidad y la seguridad de los demás usuarios de la vía.", ley: "Ley 769 de 2002, artículo 104 y sanciones del artículo 131." },
      { t: "Estacionar sin señalizar el vehículo", d: "No colocar las señales preventivas cuando el vehículo queda detenido por emergencia o avería en la vía, poniendo en riesgo a otros conductores.", ley: "Ley 769 de 2002, artículos 112 y 113." },
    ],
  },
];

// ── Consejos por actor vial ────────────────────────────
const CONSEJOS = {
  conductores: {
    label: "Conductores", img: "assets/consejos/Conductores.png",
    items: [
      { t: "Mantén la distancia de seguridad", d: "Conserva al menos 3 segundos respecto al vehículo de adelante; auméntalos si llueve o hay niebla." },
      { t: "No manejes cansado", d: "La fatiga reduce tus reflejos igual que el alcohol. Descansa cada 2 horas en viajes largos." },
      { t: "Revisa tu vehículo antes de salir", d: "Frenos, llantas, luces, espejos y niveles. Un vehículo en mal estado causa muchos accidentes." },
      { t: "Anticípate, no reacciones", d: "Mira lejos, prevé el comportamiento de otros y evita frenadas y giros bruscos." },
    ],
  },
  motociclistas: {
    label: "Motociclistas", img: "assets/consejos/Motociclistas.png",
    items: [
      { t: "Casco certificado y abrochado", d: "Tuyo y del parrillero. Es tu principal protección ante una caída." },
      { t: "Hazte visible", d: "Usa luces encendidas siempre y ropa reflectiva. Evita los puntos ciegos de los carros." },
      { t: "No zigzaguees entre carros", d: "Circula por tu carril. El 'colarse' es causa frecuente de siniestros graves." },
      { t: "Frena con ambos frenos", d: "Combina freno delantero y trasero de forma progresiva, sobre todo en piso mojado." },
    ],
  },
  peatones: {
    label: "Peatones", img: "assets/consejos/Peatones.png",
    items: [
      { t: "Cruza por las cebras", d: "Usa siempre los cruces peatonales y los puentes. Nunca entre vehículos estacionados." },
      { t: "Mira antes de cruzar", d: "Izquierda, derecha y de nuevo izquierda. Haz contacto visual con los conductores." },
      { t: "Camina por el andén", d: "Si no hay, hazlo por el borde de frente al tránsito para ver los vehículos." },
      { t: "Evita distracciones", d: "No cruces mirando el celular ni con audífonos a alto volumen." },
    ],
  },
  ciclistas: {
    label: "Ciclistas", img: "assets/consejos/Ciclistas.png",
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
  { icon: "🚨", img: "assets/emergencias/Emergencias.png", name: "Emergencias", num: "123", sub: "Línea única nacional", color: "#E24B4A" },
  { icon: "🚑", img: "assets/emergencias/Ambulancia.png", name: "Ambulancias", num: "125", sub: "Cruz Roja", color: "#1D9E75" },
  { icon: "🚒", img: "assets/emergencias/Bomberos.png", name: "Bomberos", num: "119", sub: "Cuerpo de bomberos", color: "#EF9F27" },
  { icon: "🚓", img: "assets/emergencias/Policia.png", name: "Policía", num: "112", sub: "Policía Nacional", color: "#185FA5" },
];

// ── Reportes ciudadanos (PQR) — qué puedes reportar ────
// Contenido estático (mismas categorías que PQR/pqr.js), sin leer datos reales.
const PQR_TIPOS = [
  { icon: "🕳️", img: "assets/peligros/bache.png", titulo: "Hueco / bache", desc: "Baches, grietas o hundimientos peligrosos en la calzada.", color: "#E24B4A" },
  { icon: "🚦", img: "assets/peligros/semaforo.png", titulo: "Semáforo dañado", desc: "Semáforos apagados, intermitentes o que no cambian correctamente.", color: "#EF9F27" },
  { icon: "🚧", img: "assets/peligros/senalizacion.png", titulo: "Señalización", desc: "Señales caídas, tapadas, borradas o mal ubicadas.", color: "#185FA5" },
  { icon: "💥", img: "assets/peligros/accidente.png", titulo: "Accidente", desc: "Choques o siniestros que debas reportar a la autoridad.", color: "#3C3489" },
  { icon: "💡", img: "assets/peligros/alumbrado.png", titulo: "Alumbrado público", desc: "Postes o luminarias apagadas que reducen la visibilidad nocturna.", color: "#1D9E75" },
  { icon: "📌", img: "assets/peligros/otro.png", titulo: "Otro", desc: "Cualquier otra situación que ponga en riesgo a los actores viales.", color: "#E8530A" },
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
      <div class="card-icon">${n.img ? `<img src="${n.img}" alt="${n.titulo}" loading="lazy" />` : n.icon}</div>
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
      <div class="doc-icon">${d.img ? `<img src="${d.img}" alt="${d.titulo}" loading="lazy" />` : d.icon}</div>
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
      <ul>${i.items.map(it => `
        <li class="infraction-item">
          <button type="button" class="infraction-toggle" aria-expanded="false">
            <span class="infraction-name">${it.t}</span>
            <span class="infraction-arrow" aria-hidden="true">▾</span>
          </button>
          <div class="infraction-panel">
            <div class="infraction-panel-inner">
              <p class="infraction-desc">${it.d}</p>
              <p class="infraction-ley"><strong>Ley:</strong> ${it.ley}</p>
            </div>
          </div>
        </li>`).join("")}</ul>
    </article>`).join(""));

  // Acordeón: solo una infracción abierta a la vez (en toda la sección)
  const items = $("#infraccionesGrid").querySelectorAll(".infraction-item");
  items.forEach(item => {
    const btn = item.querySelector(".infraction-toggle");
    btn.addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");
      items.forEach(other => {
        other.classList.remove("open");
        other.querySelector(".infraction-toggle").setAttribute("aria-expanded", "false");
      });
      if (!wasOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
}

function renderConsejos(activeKey = "conductores") {
  const keys = Object.keys(CONSEJOS);
  html($("#consejosTabs"), keys.map(k => {
    const c = CONSEJOS[k];
    const ico = c.img ? `<img class="tab-ico" src="${c.img}" alt="" loading="lazy" />` : "";
    return `<button class="tab ${k === activeKey ? "active" : ""}" data-tab="${k}">${ico}${c.label}</button>`;
  }).join(""));

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
      <div class="emerg-icon">${e.img ? `<img src="${e.img}" alt="${e.name}" loading="lazy" />` : e.icon}</div>
      <div class="emerg-num">${e.num}</div>
      <div class="emerg-name">${e.name}</div>
      <div class="emerg-sub">${e.sub}</div>
    </article>`).join(""));
}

function renderPqrTipos() {
  html($("#pqrTiposGrid"), PQR_TIPOS.map(t => `
    <article class="card reveal" style="--accent:${t.color}">
      <div class="card-icon">${t.img ? `<img src="${t.img}" alt="${t.titulo}" loading="lazy" />` : t.icon}</div>
      <h3>${t.titulo}</h3>
      <p>${t.desc}</p>
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

function setupCardGlow() {
  document.addEventListener("pointermove", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, { passive: true });
}

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
  renderPqrTipos();

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  setupTheme();
  setupCardGlow();
  setupMenu();
  setupScrollUI();
  observeReveals();
});
