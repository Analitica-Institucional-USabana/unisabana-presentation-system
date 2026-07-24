#!/usr/bin/env node
// Validador de esquema mínimo del Deck Spec (Hito 4, planning/03-migration-roadmap.md).
// Uso: node scripts/validate-deck-spec.mjs <archivo.yaml>
// Valida SOLO estructura (JSON Schema). La validación de reglas de marca
// (paleta permitida, logo, densidad, imágenes, atribución IA) es el validators/
// determinista previsto para el Hito 6 — todavía no existe.

import { loadAndValidateDeckSpec } from "./lib/deck-spec.mjs";

const target = process.argv[2];
if (!target) {
  console.error("Uso: node scripts/validate-deck-spec.mjs <archivo.yaml>");
  process.exit(2);
}

const { valid, errors } = loadAndValidateDeckSpec(target);

if (valid) {
  console.log(`VÁLIDO: ${target}`);
  process.exit(0);
} else {
  console.error(`INVÁLIDO: ${target}`);
  for (const err of errors) console.error(`  - ${err}`);
  process.exit(1);
}
