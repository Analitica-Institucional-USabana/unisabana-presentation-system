#!/usr/bin/env node
// Validador de esquema mínimo de la Infografía Spec.
// Uso: node scripts/validate-infografia-spec.mjs <archivo.yaml>
// Valida SOLO estructura (JSON Schema). La validación de reglas de marca
// (paleta, logo, co-marca, densidad de módulos, iconografía, accesibilidad,
// fuentes obligatorias) vive en validators/ — ver scripts/validate-brand.mjs.

import { loadAndValidateInfografiaSpec } from "./lib/infografia-spec.mjs";

const target = process.argv[2];
if (!target) {
  console.error("Uso: node scripts/validate-infografia-spec.mjs <archivo.yaml>");
  process.exit(2);
}

const { valid, errors } = loadAndValidateInfografiaSpec(target);

if (valid) {
  console.log(`VÁLIDO: ${target}`);
  process.exit(0);
} else {
  console.error(`INVÁLIDO: ${target}`);
  for (const err of errors) console.error(`  - ${err}`);
  process.exit(1);
}
