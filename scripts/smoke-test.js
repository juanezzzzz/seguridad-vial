#!/usr/bin/env node
// ═══════════════════════════════════════════════════════
//  YopVial — Chequeo rápido sin navegador (Node puro, sin deps)
//
//  Corre esto después de tocar HTML/CSS/JS y antes de hacer commit:
//    node scripts/smoke-test.js
//
//  Qué revisa:
//  1) Que todo script local referenciado en un <script src="...">
//     exista y tenga sintaxis JS válida.
//  2) Que ningún $("#id").metodo(...) / document.querySelector("#id").metodo(...)
//     directo (sin "?." ni asignarlo a una variable con guarda) dependa
//     de un id que falte en ALGUNA de las páginas que cargan ese script.
//     Este es exactamente el bug real que rompió el home y las páginas
//     de guia/ una vez: una función tronaba en las páginas donde su
//     contenedor no existía y eso cortaba toda la inicialización.
//
//  No sustituye probarlo en un navegador real; es una red de
//  seguridad barata contra esa clase específica de regresión.
// ═══════════════════════════════════════════════════════

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");

function findHtmlFiles(dir) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(findHtmlFiles(full));
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

const htmlFiles = findHtmlFiles(ROOT);
let errores = 0;

function rel(p) { return path.relative(ROOT, p).replace(/\\/g, "/"); }

// ── 1) Scripts locales referenciados: existen y tienen sintaxis válida ──
const scriptsPorPagina = {};
const idsPorPagina = {};

for (const html of htmlFiles) {
  const content = fs.readFileSync(html, "utf8");

  idsPorPagina[html] = new Set(
    [...content.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1])
  );

  const srcs = [...content.matchAll(/<script\s+src="([^"]+)"/g)].map((m) => m[1]);
  scriptsPorPagina[html] = srcs
    .filter((s) => !/^https?:\/\//.test(s))
    .map((s) => path.normalize(path.join(path.dirname(html), s.split("?")[0])));
}

const jsFiles = new Set();
for (const list of Object.values(scriptsPorPagina)) for (const js of list) jsFiles.add(js);

for (const jsPath of jsFiles) {
  if (!fs.existsSync(jsPath)) {
    console.log(`✗ script referenciado pero no existe: ${rel(jsPath)}`);
    errores++;
    continue;
  }
  try {
    execSync(`node --check "${jsPath}"`, { stdio: "pipe" });
  } catch (e) {
    console.log(`✗ error de sintaxis en ${rel(jsPath)}:`);
    console.log(String(e.stderr || e.stdout).trim());
    errores++;
  }
}

// ── 2) Accesos DOM directos que puedan tronar en alguna página ──
const paginasPorScript = {};
for (const html of htmlFiles) {
  for (const js of scriptsPorPagina[html]) {
    (paginasPorScript[js] ||= []).push(html);
  }
}

// $("#id").algo(   o   document.querySelector("#id").algo(
// (?!\?\.) = no está inmediatamente protegido con optional chaining
const riesgoRe = /(?:\$|document\.querySelector)\(\s*["']#([\w-]+)["']\s*\)(?!\s*\?\.)\s*\.\s*(\w+)/g;

for (const [jsPath, paginas] of Object.entries(paginasPorScript)) {
  if (!fs.existsSync(jsPath)) continue;
  if (paginas.length < 2) continue; // un script usado en una sola página no puede tener este problema
  const src = fs.readFileSync(jsPath, "utf8");
  let m;
  while ((m = riesgoRe.exec(src))) {
    const [, id, metodo] = m;
    const faltan = paginas.filter((p) => !idsPorPagina[p].has(id));
    if (faltan.length > 0) {
      console.log(`✗ riesgo en ${rel(jsPath)}: usa $("#${id}").${metodo}(...) sin comprobar que exista.`);
      console.log(`  falta el id "${id}" en: ${faltan.map(rel).join(", ")}`);
      errores++;
    }
  }
}

// ── Resultado ──
if (errores === 0) {
  console.log(`✓ ${htmlFiles.length} páginas, ${jsFiles.size} scripts locales: sin errores de sintaxis ni accesos DOM sin proteger.`);
  process.exit(0);
} else {
  console.log(`\n${errores} problema(s) encontrado(s).`);
  process.exit(1);
}
