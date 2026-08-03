#!/usr/bin/env node
// Validador de marca (Hito 6, planning/03-migration-roadmap.md). Detecta el
// tipo de artefacto por la clave raíz del YAML — `presentation` (Deck Spec)
// o `infografia` (Infografía Spec, planning/11-infografia-artifact-type.md) —
// y despacha a las reglas correspondientes, para no duplicar el comando.
// Uso: node scripts/validate-brand.mjs <spec.yaml> [renderizado.html]
//
// Sin el segundo argumento, solo corren las reglas verificables sobre el
// propio Spec. Con el HTML renderizado, además corren las reglas de capa 2
// (logo/atribución IA/desborde en deck; accesibilidad en infografía). La
// validación estructural siempre corre primero — nunca se evalúan reglas de
// marca sobre un Spec inválido.

import { readFileSync } from "node:fs";
import yaml from "js-yaml";
import { loadAndValidateDeckSpec, repoRoot } from "./lib/deck-spec.mjs";
import { loadAndValidateInfografiaSpec } from "./lib/infografia-spec.mjs";
import {
  validateDeckSpecRules,
  validateRenderedHtmlRules,
  validateInfografiaSpecRules,
  validateRenderedInfografiaHtmlRules,
  mergeReportSets,
  overallVerdict,
} from "../validators/index.mjs";

const specPath = process.argv[2];
const htmlPath = process.argv[3];
if (!specPath) {
  console.error("Uso: node scripts/validate-brand.mjs <spec.yaml> [renderizado.html]");
  process.exit(2);
}

const rawDoc = yaml.load(readFileSync(specPath, "utf8"));
const kind = rawDoc && typeof rawDoc === "object" && "infografia" in rawDoc ? "infografia" : "deck";

let reports;
if (kind === "infografia") {
  const { infografia: spec, valid, errors } = loadAndValidateInfografiaSpec(specPath);
  if (!valid) {
    console.error(`INVÁLIDO (estructura): ${specPath}`);
    for (const err of errors) console.error(`  - ${err}`);
    process.exit(1);
  }
  reports = validateInfografiaSpecRules(spec, { repoRoot });
  if (htmlPath) {
    const html = readFileSync(htmlPath, "utf8");
    reports = mergeReportSets(reports, validateRenderedInfografiaHtmlRules(html, spec, { repoRoot }));
  }
} else {
  const { deck, valid, errors } = loadAndValidateDeckSpec(specPath);
  if (!valid) {
    console.error(`INVÁLIDO (estructura): ${specPath}`);
    for (const err of errors) console.error(`  - ${err}`);
    process.exit(1);
  }
  reports = validateDeckSpecRules(deck, { repoRoot });
  if (htmlPath) {
    const html = readFileSync(htmlPath, "utf8");
    reports = mergeReportSets(reports, validateRenderedHtmlRules(html, deck, { repoRoot }));
  }
}

let hasError = false;
for (const r of reports) {
  console.log(`\n[${r.status.toUpperCase()}] ${r.slideId}`);
  for (const m of r.messages) console.log(`  - (${m.severity}) ${m.message}`);
  if (r.status === "error") hasError = true;
}

console.log(`\nVeredicto: ${overallVerdict(reports)}`);
process.exit(hasError ? 1 : 0);
