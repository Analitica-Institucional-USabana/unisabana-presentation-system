#!/usr/bin/env node
// Renderer HTML autocontenido para el artefacto Infografía.
// Uso: node renderers/html/render-infografia.mjs <infografia.yaml> [salida.html]
//
// Mismo principio D-16 que renderers/html/render.mjs (deck): nunca se
// renderiza una Infografía Spec que falla la validación estructural.

import { writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { loadAndValidateInfografiaSpec, repoRoot } from "../../scripts/lib/infografia-spec.mjs";
import { buildInfografiaDocument } from "./infografia/document.mjs";

const target = process.argv[2];
if (!target) {
  console.error("Uso: node renderers/html/render-infografia.mjs <infografia.yaml> [salida.html]");
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
  : join(dirname(resolve(target)), `${basename(target, extname(target))}.html`);

const html = buildInfografiaDocument(spec, { repoRoot });
writeFileSync(outPath, html, "utf8");

console.log(`Generado: ${outPath} (${spec.modules.length} módulos, ${(html.length / 1024).toFixed(0)} KB)`);
