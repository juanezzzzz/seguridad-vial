// ═══════════════════════════════════════════════════════
//  YopVial — PQR / Reportes ciudadanos (localStorage)
// ═══════════════════════════════════════════════════════

const STORAGE_KEY = "yopvial_reportes";

const TIPOS = {
  hueco:      { ico: "🕳️", label: "Hueco / bache" },
  semaforo:   { ico: "🚦", label: "Semáforo dañado" },
  senal:      { ico: "🚧", label: "Señalización" },
  accidente:  { ico: "💥", label: "Accidente" },
  alumbrado:  { ico: "💡", label: "Alumbrado público" },
  otro:       { ico: "📌", label: "Otro" },
};

const GRAV = {
  baja:  { label: "Baja",  color: "#1D9E75" },
  media: { label: "Media", color: "#EF9F27" },
  alta:  { label: "Alta",  color: "#E24B4A" },
};

const ESTADOS = {
  pendiente:  "Pendiente",
  en_proceso: "En proceso",
  resuelto:   "Resuelto",
};

// ── Estado del formulario ──────────────────────────────
const draft = { tipo: null, gravedad: null, foto: null };

// ── Utilidades ─────────────────────────────────────────
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function loadReports() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveReports(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); return true; }
  catch (e) { return false; }
}
function genId() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `YV-${ymd}-${rnd}`;
}
function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }) +
         " · " + d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}
function escapeHtml(str = "") {
  return str.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ── Compresión de imagen a dataURL ─────────────────────
function compressImage(file, maxSize = 900, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) { height = height * maxSize / width; width = maxSize; }
        else if (height > maxSize) { width = width * maxSize / height; height = maxSize; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ═══════════════════════════════════════════════════════
//  VISTAS
// ═══════════════════════════════════════════════════════
function switchView(view) {
  $$(".switch-btn").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  $$(".view").forEach(v => v.classList.toggle("active", v.id === `view-${view}`));
  if (view === "list") renderList();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ═══════════════════════════════════════════════════════
//  FORMULARIO
// ═══════════════════════════════════════════════════════
function renderTypeGrid() {
  $("#typeGrid").innerHTML = Object.entries(TIPOS).map(([key, t]) => `
    <button type="button" class="type-btn" data-tipo="${key}">
      <span class="type-ico">${t.ico}</span><span>${t.label}</span>
    </button>`).join("");

  $$("#typeGrid .type-btn").forEach(btn => btn.onclick = () => {
    draft.tipo = btn.dataset.tipo;
    $$("#typeGrid .type-btn").forEach(b => b.classList.toggle("selected", b === btn));
    clearError("tipo");
  });
}

function setupGravedad() {
  $$("#gravedadChips .chip").forEach(chip => chip.onclick = () => {
    draft.gravedad = chip.dataset.grav;
    $$("#gravedadChips .chip").forEach(c => c.classList.toggle("selected", c === chip));
    clearError("gravedad");
  });
}

function setupPhoto() {
  const input = $("#foto");
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("El archivo debe ser una imagen.", true); input.value = ""; return; }
    try {
      draft.foto = await compressImage(file);
      $("#previewImg").src = draft.foto;
      $("#filePreview").hidden = false;
      $("#fileDrop").hidden = true;
    } catch { showToast("No se pudo procesar la imagen.", true); }
  };
  $("#fileRemove").onclick = () => {
    draft.foto = null; input.value = "";
    $("#filePreview").hidden = true;
    $("#fileDrop").hidden = false;
  };
}

function setupCharCount() {
  const ta = $("#descripcion");
  const out = $("#charCount");
  const upd = () => { out.textContent = `${ta.value.length} / 500`; if (ta.value.trim().length >= 10) clearError("descripcion"); };
  ta.oninput = upd; upd();
}

function markError(field) { $(`#err-${field}`)?.closest(".field")?.classList.add("invalid"); }
function clearError(field) { $(`#err-${field}`)?.closest(".field")?.classList.remove("invalid"); }

function validateForm() {
  let ok = true;
  if (!draft.tipo) { markError("tipo"); ok = false; }
  if (!$("#ubicacion").value.trim()) { markError("ubicacion"); ok = false; }
  if (!draft.gravedad) { markError("gravedad"); ok = false; }
  if ($("#descripcion").value.trim().length < 10) { markError("descripcion"); ok = false; }
  return ok;
}

function resetForm() {
  $("#pqrForm").reset();
  draft.tipo = null; draft.gravedad = null; draft.foto = null;
  $$("#typeGrid .type-btn").forEach(b => b.classList.remove("selected"));
  $$("#gravedadChips .chip").forEach(c => c.classList.remove("selected"));
  $("#filePreview").hidden = true; $("#fileDrop").hidden = false;
  $("#charCount").textContent = "0 / 500";
  $$(".field.invalid").forEach(f => f.classList.remove("invalid"));
}

function submitForm(e) {
  e.preventDefault();
  if (!validateForm()) { showToast("Revisa los campos marcados.", true); return; }

  const report = {
    id: genId(),
    tipo: draft.tipo,
    ubicacion: $("#ubicacion").value.trim(),
    gravedad: draft.gravedad,
    descripcion: $("#descripcion").value.trim(),
    nombre: $("#nombre").value.trim() || "Anónimo",
    contacto: $("#contacto").value.trim(),
    foto: draft.foto,
    estado: "pendiente",
    fecha: new Date().toISOString(),
  };

  const list = loadReports();
  list.unshift(report);

  if (!saveReports(list)) {
    // Posible cuota excedida por la foto: reintentar sin foto
    report.foto = null;
    if (saveReports(list)) showToast("Reporte guardado, pero la foto era muy grande y no se adjuntó.", true);
    else { showToast("No hay espacio para guardar. Elimina reportes antiguos.", true); return; }
  } else {
    showToast(`Reporte ${report.id} enviado correctamente ✓`);
  }

  resetForm();
  updateCount();
  switchView("list");
}

// ═══════════════════════════════════════════════════════
//  LISTA
// ═══════════════════════════════════════════════════════
function getFiltered() {
  const q = $("#search").value.trim().toLowerCase();
  const ft = $("#filterTipo").value;
  const fe = $("#filterEstado").value;
  return loadReports().filter(r => {
    if (ft && r.tipo !== ft) return false;
    if (fe && r.estado !== fe) return false;
    if (q && !(`${r.ubicacion} ${r.descripcion} ${r.id}`.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderStats() {
  const all = loadReports();
  const by = (e) => all.filter(r => r.estado === e).length;
  const stats = [
    { n: all.length, l: "Total", c: "#14161C" },
    { n: by("pendiente"), l: "Pendientes", c: "#EF9F27" },
    { n: by("en_proceso"), l: "En proceso", c: "#185FA5" },
    { n: by("resuelto"), l: "Resueltos", c: "#1D9E75" },
  ];
  $("#statsRow").innerHTML = stats.map(s => `
    <div class="stat-box" style="--accent:${s.c}"><div class="n">${s.n}</div><div class="l">${s.l}</div></div>`).join("");
}

function renderTipoFilter() {
  const sel = $("#filterTipo");
  if (sel.options.length > 1) return; // ya cargado
  sel.insertAdjacentHTML("beforeend", Object.entries(TIPOS).map(([k, t]) => `<option value="${k}">${t.label}</option>`).join(""));
}

function reportCardHTML(r) {
  const t = TIPOS[r.tipo] || TIPOS.otro;
  const g = GRAV[r.gravedad] || GRAV.media;
  return `
    <article class="report-card" data-id="${r.id}" style="--grav:${g.color}">
      <div class="rc-ico">${t.ico}</div>
      <div class="rc-body">
        <div class="rc-top">
          <span class="rc-tipo">${t.label}</span>
          <span class="badge badge-estado" data-e="${r.estado}">${ESTADOS[r.estado]}</span>
          <span class="badge badge-grav" style="--grav:${g.color}">${g.label}</span>
        </div>
        <div class="rc-ubic">📍 ${escapeHtml(r.ubicacion)}</div>
        <div class="rc-desc">${escapeHtml(r.descripcion)}</div>
        <div class="rc-meta">
          <span class="rc-id">${r.id}</span>
          ${r.foto ? '<span class="rc-id">📷 con foto</span>' : ""}
          <span class="rc-fecha">${fmtDate(r.fecha)}</span>
        </div>
      </div>
    </article>`;
}

function renderList() {
  renderStats();
  renderTipoFilter();
  const list = getFiltered();
  const cont = $("#reportList");
  const empty = $("#emptyState");

  if (loadReports().length === 0) {
    cont.innerHTML = ""; empty.hidden = false; return;
  }
  empty.hidden = true;

  if (list.length === 0) {
    cont.innerHTML = `<p class="empty" style="padding:40px">No hay reportes que coincidan con el filtro.</p>`;
    return;
  }
  cont.innerHTML = list.map(reportCardHTML).join("");
  $$("#reportList .report-card").forEach(c => c.onclick = () => openModal(c.dataset.id));
}

function updateCount() { $("#switchCount").textContent = loadReports().length; }

// ═══════════════════════════════════════════════════════
//  MODAL
// ═══════════════════════════════════════════════════════
function openModal(id) {
  const r = loadReports().find(x => x.id === id);
  if (!r) return;
  const t = TIPOS[r.tipo] || TIPOS.otro;
  const g = GRAV[r.gravedad] || GRAV.media;

  $("#modal").innerHTML = `
    <div class="modal-head">
      <div class="rc-ico">${t.ico}</div>
      <div class="modal-title">
        <h2>${t.label}</h2>
        <span class="rc-id">${r.id}</span>
      </div>
      <button class="modal-close" id="modalClose" aria-label="Cerrar">✕</button>
    </div>
    <div class="modal-body">
      ${r.foto ? `<img class="modal-img" src="${r.foto}" alt="Foto del reporte" />` : ""}
      <div class="detail-row"><span class="k">Estado</span><span class="v"><span class="badge badge-estado" data-e="${r.estado}">${ESTADOS[r.estado]}</span></span></div>
      <div class="detail-row"><span class="k">Gravedad</span><span class="v"><span class="badge badge-grav" style="--grav:${g.color}">${g.label}</span></span></div>
      <div class="detail-row"><span class="k">Ubicación</span><span class="v">${escapeHtml(r.ubicacion)}</span></div>
      <div class="detail-row"><span class="k">Descripción</span><span class="v">${escapeHtml(r.descripcion)}</span></div>
      <div class="detail-row"><span class="k">Reportado por</span><span class="v">${escapeHtml(r.nombre)}</span></div>
      ${r.contacto ? `<div class="detail-row"><span class="k">Contacto</span><span class="v">${escapeHtml(r.contacto)}</span></div>` : ""}
      <div class="detail-row"><span class="k">Fecha</span><span class="v">${fmtDate(r.fecha)}</span></div>

      <div class="estado-control">
        <label class="field-label">Cambiar estado</label>
        <div class="estado-btns">
          ${Object.entries(ESTADOS).map(([k, v]) => `<button class="estado-btn ${r.estado === k ? "on" : ""}" data-estado="${k}">${v}</button>`).join("")}
        </div>
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn-danger" id="btnDelete">🗑 Eliminar</button>
      <button class="btn btn-primary" id="btnCloseFoot">Cerrar</button>
    </div>`;

  $("#modalOverlay").hidden = false;

  $("#modalClose").onclick = closeModal;
  $("#btnCloseFoot").onclick = closeModal;

  $$("#modal .estado-btn").forEach(b => b.onclick = () => {
    changeEstado(r.id, b.dataset.estado);
    openModal(r.id); // re-render modal
    renderList();
  });

  // Eliminar con confirmación en dos toques (sin diálogo del navegador)
  const del = $("#btnDelete");
  del.onclick = () => {
    if (del.classList.contains("confirm")) { deleteReport(r.id); closeModal(); }
    else { del.classList.add("confirm"); del.textContent = "¿Seguro? Toca de nuevo"; }
  };
}

function closeModal() { $("#modalOverlay").hidden = true; $("#modal").innerHTML = ""; }

function changeEstado(id, estado) {
  const list = loadReports();
  const r = list.find(x => x.id === id);
  if (r) { r.estado = estado; saveReports(list); showToast(`Estado actualizado a "${ESTADOS[estado]}"`); }
}

function deleteReport(id) {
  const list = loadReports().filter(x => x.id !== id);
  saveReports(list);
  showToast("Reporte eliminado.");
  updateCount(); renderList();
}

// ═══════════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════════
let toastTimer;
function showToast(msg, error = false) {
  const t = $("#toast");
  t.innerHTML = `<span class="toast-ico">${error ? "⚠️" : "✅"}</span>${escapeHtml(msg)}`;
  t.classList.toggle("error", error);
  t.hidden = false;
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.hidden = true, 300); }, 3200);
}

// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  renderTypeGrid();
  setupGravedad();
  setupPhoto();
  setupCharCount();
  updateCount();

  $("#pqrForm").addEventListener("submit", submitForm);
  $("#btnReset").onclick = resetForm;
  $$(".switch-btn").forEach(b => b.onclick = () => switchView(b.dataset.view));
  $("#btnEmptyNew").onclick = () => switchView("form");

  ["input", "change"].forEach(ev => {
    $("#search").addEventListener(ev, renderList);
    $("#filterTipo").addEventListener(ev, renderList);
    $("#filterEstado").addEventListener(ev, renderList);
  });

  $("#modalOverlay").addEventListener("click", (e) => { if (e.target.id === "modalOverlay") closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  // Limpiar error de ubicación al escribir
  $("#ubicacion").addEventListener("input", () => { if ($("#ubicacion").value.trim()) clearError("ubicacion"); });
});
