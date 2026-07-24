#!/usr/bin/env node
// Validador de marca (Hito 6, planning/03-migration-roadmap.md).
// Uso: node scripts/validate-brand.mjs <deck.yaml> [renderizado.html]
//
// Sin el segundo argumento, solo corren las reglas que se pueden verificar
// sobre el Deck Spec (imagery, density). Con el HTML renderizado, además
// corren logo y atribución IA. La validación estructural (Hito 4) siempre
// corre primero — nunca se evalúan reglas de marca sobre un Deck Spec inválido.

import { readFileSync } from "node:fs";
import { loadAndValidateDeckSpec, repoRoot } from "./lib/deck-spec.mjs";
import { validateDeckSpecRules, validateRenderedHtmlRules, mergeReportSets, overallVerdict } from "../validators/index.mjs";

const deckPath = process.argv[2];
const htmlPath = process.argv[3];
if (!deckPath) {
  console.error("Uso: node scripts/validate-brand.mjs <deck.yaml> [renderizado.html]");
  process.exit(2);
}

const { deck, valid, errors } = loadAndValidateDeckSpec(deckPath);
if (!valid) {
  console.error(`INVÁLIDO (estructura): ${deckPath}`);
  for (const err of errors) console.error(`  - ${err}`);
  process.exit(1);
}

let reports = validateDeckSpecRules(deck, { repoRoot });
if (htmlPath) {
  const html = readFileSync(htmlPath, "utf8");
  reports = mergeReportSets(reports, validateRenderedHtmlRules(html, deck, { repoRoot }));
}

let hasError = false;
for (const r of reports) {
  console.log(`\n[${r.status.toUpperCase()}] ${r.slideId}`);
  for (const m of r.messages) console.log(`  - (${m.severity}) ${m.message}`);
  if (r.status === "error") hasError = true;
}

console.log(`\nVeredicto: ${overallVerdict(reports)}`);
process.exit(hasError ? 1 : 0);
