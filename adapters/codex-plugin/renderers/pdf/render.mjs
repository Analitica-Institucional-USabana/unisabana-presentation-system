#!/usr/bin/env node
// Exporta una Infografía Spec a PDF (Hito de infografías, planning/11-infografia-
// artifact-type.md). Uso: node renderers/pdf/render.mjs <infografia.yaml> [salida.pdf]
//
// Reutiliza el HTML autocontenido (renderers/html/infografia/document.mjs) —
// nunca se escribe HTML/PDF a mano. Chromium headless (Playwright) cierra la
// pregunta abierta D-18 (planning/07-decisions-and-open-questions.md): el
// binario queda vendorizado dentro de node_modules/playwright-core/
// .local-browsers/ (instalado con PLAYWRIGHT_BROWSERS_PATH=0, ver
// planning/11-infografia-artifact-type.md) para que scripts/build-adapters.mjs
// lo capture sin cambios — nunca se descarga en tiempo de ejecución (D-20).

import { basename, dirname, extname, join, resolve } from "node:path";
import { loadAndValidateInfografiaSpec, repoRoot } from "../../scripts/lib/infografia-spec.mjs";
import { buildInfografiaDocument } from "../html/infografia/document.mjs";
import { readFileSync } from "node:fs";

// Debe fijarse ANTES de cargar 'playwright' (por eso el import es dinámico,
// no estático — un import estático se resuelve antes de que esta línea
// corra). El binario de Chromium se instaló con PLAYWRIGHT_BROWSERS_PATH=0
// (planning/11-infografia-artifact-type.md) precisamente para que quede
// dentro de node_modules/playwright-core/.local-browsers/ y viaje con la
// copia ciega de node_modules en scripts/build-adapters.mjs — sin fijar la
// misma variable en tiempo de ejecución, playwright busca en el caché global
// del usuario en vez de ahí.
process.env.PLAYWRIGHT_BROWSERS_PATH = "0";
const { chromium } = await import("playwright");

const target = process.argv[2];
if (!target) {
  console.error("Uso: node renderers/pdf/render.mjs <infografia.yaml> [salida.pdf]");
  process.exit(2);
}

const { infografia: spec, valid, errors } = loadAndValidateInfografiaSpec(target);
if (!valid) {
  console.error(`No se renderiza: ${target} falla la validación estructural de la Infografía Spec.`);
  for (const err of errors) console.error(`  - ${err}`);
  process.exit(1);
}

const outPath = process.argv[3]
  ? resolve(process.argv[3])
  : join(dirname(resolve(target)), `${basename(target, extname(target))}.pdf`);

const html = buildInfografiaDocument(spec, { repoRoot });

const canvasRules = JSON.parse(readFileSync(join(repoRoot, "core/brand/rules/infografia-canvas.json"), "utf8"));
const profile = canvasRules.profiles[spec.infografia.format];

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: profile.widthPx, height: 1200 } });
  await page.setContent(html, { waitUntil: "networkidle" });
  // La altura real del documento (no la del viewport) determina el alto de
  // página — una infografía es un lienzo único, no páginas A4 múltiples.
  const contentHeight = await page.evaluate(() => document.querySelector(".infografia").scrollHeight);
  await page.setViewportSize({ width: profile.widthPx, height: contentHeight });
  await page.pdf({
    path: outPath,
    width: `${profile.widthPx}px`,
    height: `${contentHeight}px`,
    printBackground: true,
    pageRanges: "1",
  });
} finally {
  await browser.close();
}

console.log(`Generado: ${outPath} (formato ${spec.infografia.format}, ancho ${profile.widthPx}px)`);
