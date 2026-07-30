// ═══════════════════════════════════════════════════════════════════
//  TEMP-EDITOR — Herramienta local para capturar coordenadas de zonas.
//
//  QUITAR ANTES DE SUBIR AL REPO:
//   1) borra este archivo (js/editor-zonas.js)
//   2) quita el <script ...editor-zonas.js> de guia/zonas.html
//   3) quita la línea "window.mapaZonasRef = map;" de js/app.js
//   (todo está marcado con "TEMP-EDITOR" para encontrarlo rápido)
//
//  Uso: abre guia/zonas.html, llena Nombre/Nivel/Resumen y haz clic en el
//  mapa donde va el punto. Repite. Luego "Copiar código" y pega el resultado
//  dentro del array ZONAS de js/app.js.
// ═══════════════════════════════════════════════════════════════════
(function () {
  function init() {
    const map = window.mapaZonasRef;
    if (!map || typeof L === "undefined") { setTimeout(init, 300); return; }

    const puntos = [];
    const colores = { alto: "#E24B4A", medio: "#EF9F27" };

    const panel = document.createElement("div");
    panel.id = "editorZonas";
    panel.innerHTML = `
      <style>
        #editorZonas{position:fixed;top:80px;right:16px;z-index:9999;width:300px;
          background:#fff;color:#111;border:1px solid #ccc;border-radius:12px;
          box-shadow:0 12px 34px rgba(0,0,0,.28);padding:14px;
          font:13px/1.45 system-ui,-apple-system,sans-serif}
        #editorZonas h4{margin:0 0 4px;font-size:14px}
        #editorZonas .ez-sub{font-size:11px;color:#c0392b;margin:0 0 10px}
        #editorZonas label{display:block;margin:8px 0 2px;font-weight:600;font-size:12px}
        #editorZonas input,#editorZonas select,#editorZonas textarea{width:100%;
          box-sizing:border-box;padding:6px 8px;border:1px solid #ccc;
          border-radius:8px;font:12px system-ui;background:#fff;color:#111}
        #editorZonas textarea{height:130px;font-family:ui-monospace,monospace;margin-top:8px;resize:vertical}
        #editorZonas .ez-hint{font-size:11px;color:#555;margin:8px 0 0}
        #editorZonas .ez-row{display:flex;gap:6px;margin-top:8px}
        #editorZonas button{flex:1;padding:7px;border:0;border-radius:8px;
          cursor:pointer;font-weight:600;font-size:12px}
        #ezCopy{background:#185FA5;color:#fff}
        #ezClear{background:#eee;color:#333}
        #editorZonas .ez-count{font-size:11px;color:#185FA5;font-weight:600}
      </style>
      <h4>🛠️ Editor de puntos</h4>
      <p class="ez-sub">Temporal — se quita antes de subir</p>
      <label>Nombre</label>
      <input id="ezNombre" placeholder="Ej: Calle 40 con Cra 19">
      <label>Nivel</label>
      <select id="ezNivel">
        <option value="alto">Riesgo alto (rojo)</option>
        <option value="medio">Riesgo medio (ámbar)</option>
      </select>
      <label>Resumen</label>
      <input id="ezResumen" placeholder="Descripción corta">
      <p class="ez-hint">Llena los campos y <b>haz clic en el mapa</b> en la ubicación. <span class="ez-count" id="ezCount">0 puntos</span></p>
      <textarea id="ezSalida" readonly placeholder="Aquí sale el código para pegar en el array ZONAS de js/app.js"></textarea>
      <div class="ez-row">
        <button id="ezCopy">Copiar código</button>
        <button id="ezClear">Borrar todo</button>
      </div>`;
    document.body.appendChild(panel);

    const g = (id) => document.getElementById(id);
    const salida = g("ezSalida");

    function render() {
      g("ezCount").textContent = puntos.length + (puntos.length === 1 ? " punto" : " puntos");
      salida.value = puntos.map((p) =>
        `  { nivel: "Riesgo ${p.nivel}", color: "${colores[p.nivel]}", nombre: ${JSON.stringify(p.nombre)}, lat: ${p.lat}, lng: ${p.lng},\n` +
        `    resumen: ${JSON.stringify(p.resumen)},\n` +
        `    detalle: "" },`
      ).join("\n");
    }

    map.on("click", (e) => {
      const nivel = g("ezNivel").value;
      const p = {
        nombre: g("ezNombre").value.trim() || "Punto sin nombre",
        nivel,
        resumen: g("ezResumen").value.trim(),
        lat: +e.latlng.lat.toFixed(5),
        lng: +e.latlng.lng.toFixed(5),
      };
      puntos.push(p);
      const icon = L.divIcon({
        className: "led-icon",
        html: `<span class="led-dot" style="--led:${colores[nivel]}"></span>`,
        iconSize: [16, 16], iconAnchor: [8, 8], popupAnchor: [0, -8],
      });
      L.marker([p.lat, p.lng], { icon }).addTo(map)
        .bindPopup(`${p.nombre}<br>${p.lat}, ${p.lng}`).openPopup();
      render();
    });

    g("ezCopy").onclick = () => {
      salida.select();
      if (navigator.clipboard) navigator.clipboard.writeText(salida.value);
      else document.execCommand("copy");
      g("ezCopy").textContent = "¡Copiado!";
      setTimeout(() => (g("ezCopy").textContent = "Copiar código"), 1200);
    };
    g("ezClear").onclick = () => { puntos.length = 0; render(); };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
