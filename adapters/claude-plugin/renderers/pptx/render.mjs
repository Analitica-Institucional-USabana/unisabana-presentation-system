#!/usr/bin/env node
// Renderer PPTX (Hito 7, planning/03-migration-roadmap.md — POC con pptxgenjs,
// decisión D-07). Uso: node renderers/pptx/render.mjs <deck.yaml> [salida.pptx]
//
// Misma regla que el renderer HTML (D-16): nunca se renderiza un Deck Spec que
// falla la validación estructural.
//
// Limitaciones conocidas de esta POC (documentadas, no ocultas):
//  - La fuente Libre Franklin NO viaja embebida en el .pptx (a diferencia del
//    HTML): si el equipo que abre el archivo no la tiene instalada, PowerPoint
//    sustituye por su fuente por defecto. Ver planning/07-decisions-and-open-questions.md.
//  - No se replica pixel-perfect la plantilla maestra original — explícitamente
//    fuera de alcance del Hito 7.
//  - El logo de atribución IA (SVG) se embebe vía la extensión svgBlip de OOXML;
//    en visores muy antiguos que no la soporten podría no mostrarse.

import { basename, dirname, extname, join, resolve } from "node:path";
import { loadAndValidateDeckSpec, repoRoot } from "../../scripts/lib/deck-spec.mjs";
import { buildPptx } from "./document.mjs";

const target = process.argv[2];
if (!target) {
  console.error("Uso: node renderers/pptx/render.mjs <deck.yaml> [salida.pptx]");
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
  : join(dirname(resolve(target)), `${basename(target, extname(target))}.pptx`);

const pptx = await buildPptx(deck, { repoRoot });
await pptx.writeFile({ fileName: outPath });

console.log(`Generado: ${outPath} (${deck.slides.length} slides)`);
