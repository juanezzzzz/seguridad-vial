// ═══════════════════════════════════════
//  Seguridad Vial — lógica de la página
// ═══════════════════════════════════════

// ── Datos ──────────────────────────────
const NORMAS = [
  { titulo: "Casco obligatorio", desc: "Conductor y parrillero deben usar casco certificado, sin excepción.", badge: "Grave", color: "#E24B4A" },
  { titulo: "Alcohol cero", desc: "Conducir con alcohol en sangre está prohibido. Multa y retención del vehículo.", badge: "Multa alta", color: "#E8530A" },
  { titulo: "Sin celular al volante", desc: "Usar el teléfono sin manos libres genera comparendo y puntos negativos.", badge: "Comparendo", color: "#BA7517" },
  { titulo: "Cinturón siempre", desc: "Conductor y pasajeros deben llevar el cinturón abrochado, incluso en trayectos cortos.", badge: "Obligatorio", color: "#1D9E75" },
  { titulo: "Respeta las señales", desc: "Semáforos, cebras y señales verticales son de cumplimiento obligatorio.", badge: "Obligatorio", color: "#3C3489" },
  { titulo: "Zonas escolares", desc: "Velocidad máxima de 30 km/h frente a colegios en horario escolar.", badge: "30 km/h", color: "#185FA5" },
];

const CONSEJOS = [
  { titulo: "Mantén la distancia de seguridad", desc: "Conserva al menos 3 segundos respecto al vehículo de adelante; auméntalos si llueve." },
  { titulo: "Usa siempre las luces", desc: "Las motos deben circular con luces encendidas y los autos en vías interurbanas." },
  { titulo: "Reduce en lluvia", desc: "Con vía mojada, baja la velocidad un 30% y evita frenadas bruscas." },
  { titulo: "Revisa tu vehículo", desc: "Verifica frenos, llantas, luces y espejos antes de salir." },
  { titulo: "Cruza por los pasos cebra", desc: "Como peatón, usa siempre los cruces habilitados y camina por los andenes." },
];

const EMERGENCIAS = [
  { name: "Emergencias", num: "123", sub: "Línea nacional", color: "#E24B4A" },
  { name: "Ambulancias", num: "125", sub: "Cruz Roja", color: "#1D9E75" },
  { name: "Bomberos", num: "119", sub: "Cuerpo de bomberos", color: "#EF9F27" },
  { name: "Tránsito", num: "127", sub: "Autoridad de tránsito", color: "#185FA5" },
];

// ── Render ─────────────────────────────
function render() {
  const normas = document.getElementById("normasGrid");
  if (normas) {
    normas.innerHTML = NORMAS.map(n => `
      <article class="card reveal" style="--accent:${n.color}">
        <h3>${n.titulo}</h3>
        <p>${n.desc}</p>
        <span class="badge">${n.badge}</span>
      </article>
    `).join("");
  }

  const tips = document.getElementById("tipsList");
  if (tips) {
    tips.innerHTML = CONSEJOS.map((c, i) => `
      <li class="tip reveal">
        <div class="num">${String(i + 1).padStart(2, "0")}</div>
        <div>
          <h3>${c.titulo}</h3>
          <p>${c.desc}</p>
        </div>
      </li>
    `).join("");
  }

  const emerg = document.getElementById("emergGrid");
  if (emerg) {
    emerg.innerHTML = EMERGENCIAS.map(e => `
      <article class="card emerg reveal" style="--accent:${e.color}">
        <div class="num">${e.num}</div>
        <div class="name">${e.name}</div>
        <div class="sub">${e.sub}</div>
      </article>
    `).join("");
  }
}

// ── Animaciones al hacer scroll ────────
function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("active");
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}

// ── Menú responsive ────────────────────
function setupMenu() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => links.classList.toggle("active"));
  links.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => links.classList.remove("active"))
  );
}

// ── Init ───────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  render();
  setupReveal();
  setupMenu();
});
