#!/usr/bin/env node
// Renderer HTML autocontenido (Hito 5, planning/03-migration-roadmap.md).
// Uso: node renderers/html/render.mjs <deck.yaml> [salida.html]
//
// Decisión D-16 (planning/07-decisions-and-open-questions.md): validación ANTES
// del renderizado. Nunca se renderiza un Deck Spec que falla la validación
// estructural — si además se necesita cumplimiento de marca (Hito 6, validators/
// determinista), eso se ejecuta como paso adicional posterior, todavía no existe.

import { writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { loadAndValidateDeckSpec, repoRoot } from "../../scripts/lib/deck-spec.mjs";
import { buildDocument } from "./document.mjs";

const target = process.argv[2];
if (!target) {
  console.error("Uso: node renderers/html/render.mjs <deck.yaml> [salida.html]");
  process.exit(2);
}

const { deck, valid, errors } = loadAndValidateDeckSpec(target);
if (!valid) {
  console.error(`No se renderiza: ${target} falla la validación estructural del Deck Spec.`);
  for (const err of errors) console.error(`  - ${err}`);
  process.exit(1);
}

const outPath = process.argv[3]
  ? resolve(process.argv[3])
  : join(dirname(resolve(target)), `${basename(target, extname(target))}.html`);

const html = buildDocument(deck, { repoRoot });
writeFileSync(outPath, html, "utf8");

console.log(`Generado: ${outPath} (${deck.slides.length} slides, ${(html.length / 1024).toFixed(0)} KB)`);
