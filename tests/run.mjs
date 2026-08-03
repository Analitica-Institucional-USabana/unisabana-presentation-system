#!/usr/bin/env node
// Corredor de pruebas mínimo (sin framework — D-15, planning/07-decisions-and-
// open-questions.md: CLI delgada, determinista). No existía `npm test` hasta
// ahora (planning/05-testing-strategy.md lo describe pero no lo implementaba);
// este script es exactamente eso: valida cada golden fixture de
// tests/schema/, tests/golden-decks/ y tests/golden-infografias/ contra el
// resultado documentado en su propio comentario, y ejercita el motor de
// gráficas (renderers/html/charts/) contra cada variante declarada en el
// esquema — sin necesidad de un runner externo (jest/vitest/mocha).
//
// Uso: npm test  (o: node tests/run.mjs)
// Exit code 0 si todo pasa, 1 si algo falla — pensado para CI.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadAndValidateDeckSpec } from "../scripts/lib/deck-spec.mjs";
import { loadAndValidateInfografiaSpec } from "../scripts/lib/infografia-spec.mjs";
import { validateDeckSpecRules, validateInfografiaSpecRules } from "../validators/index.mjs";
import { MODULE_CHARTS } from "../renderers/html/charts/index.mjs";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const p = (rel) => join(repoRoot, rel);

let failures = 0;
function check(name, ok, detail) {
  if (ok) {
    console.log(`  OK   ${name}`);
  } else {
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
    failures++;
  }
}

function hasError(reports) {
  return reports.some((r) => r.status === "error");
}
function hasWarning(reports) {
  return reports.some((r) => r.status === "warning");
}

console.log("== Estructural (JSON Schema) ==");

const structuralCases = [
  { path: "tests/schema/example-deck.yaml", kind: "deck", expectValid: true },
  { path: "tests/schema/example-deck-invalid.yaml", kind: "deck", expectValid: false },
  { path: "tests/schema/example-infografia.yaml", kind: "infografia", expectValid: true },
  { path: "tests/schema/example-infografia-invalid.yaml", kind: "infografia", expectValid: false },
];

for (const tc of structuralCases) {
  const { valid } = tc.kind === "deck" ? loadAndValidateDeckSpec(p(tc.path)) : loadAndValidateInfografiaSpec(p(tc.path));
  check(`${tc.path} → ${tc.expectValid ? "VÁLIDO" : "INVÁLIDO"}`, valid === tc.expectValid);
}

console.log("\n== Reglas de marca (golden fixtures) ==");

const brandCases = [
  { path: "tests/golden-decks/imagery-violation.yaml", kind: "deck", expect: "error" },
  { path: "tests/golden-decks/density-violation.yaml", kind: "deck", expect: "warning" },
  { path: "tests/golden-infografias/icon-violation.yaml", kind: "infografia", expect: "error" },
  { path: "tests/golden-infografias/density-violation.yaml", kind: "infografia", expect: "warning" },
  { path: "tests/golden-infografias/cobrand-accent-collision.yaml", kind: "infografia", expect: "warning" },
  { path: "tests/schema/example-deck.yaml", kind: "deck", expect: "no-error" },
  { path: "tests/schema/example-infografia.yaml", kind: "infografia", expect: "no-error" },
];

for (const tc of brandCases) {
  const reports =
    tc.kind === "deck"
      ? validateDeckSpecRules(loadAndValidateDeckSpec(p(tc.path)).deck, { repoRoot })
      : validateInfografiaSpecRules(loadAndValidateInfografiaSpec(p(tc.path)).infografia, { repoRoot });

  if (tc.expect === "error") check(`${tc.path} → algún [ERROR]`, hasError(reports));
  else if (tc.expect === "warning") check(`${tc.path} → algún [WARNING], ningún [ERROR]`, !hasError(reports) && hasWarning(reports));
  else check(`${tc.path} → ningún [ERROR]`, !hasError(reports));
}

console.log("\n== Motor de gráficas (renderers/html/charts) ==");

const schema = JSON.parse(readFileSync(p("core/schemas/infografia-spec.schema.json"), "utf8"));
const MODULE_DEF_BY_TYPE = {
  indicators: "moduleIndicators",
  comparison: "moduleComparison",
  trend: "moduleTrend",
  distribution: "moduleDistribution",
  composition: "moduleComposition",
  relationship: "moduleRelationship",
  process: "moduleProcess",
  hierarchy: "moduleHierarchy",
  geography: "moduleGeography",
  strategy: "moduleStrategy",
};

const SAMPLE_PAYLOAD = {
  indicators: { items: [{ label: "Avance", value: 62, unit: "%" }, { label: "Meta", value: 40 }] },
  comparison: {
    categories: ["Ingeniería", "Medicina", "Educación"],
    series: [{ name: "2024", values: [40, 30, 58] }, { name: "2025", values: [-10, 20, 15] }],
  },
  trend: {
    categories: ["2021", "2022", "2023", "2024"],
    series: [{ name: "Matrícula", values: [100, 120, 115, 140] }, { name: "Egresados", values: [50, 60, 65, 70] }],
  },
  distribution: {
    points: [
      { x: 1, y: 2, group: "A" }, { x: 4, y: 5, group: "A" }, { x: 2, y: 3, group: "A" }, { x: 8, y: 9, group: "A" },
      { x: 3, y: 4, group: "B" }, { x: 6, y: 7, group: "B" }, { x: 5, y: 6, group: "B" }, { x: 9, y: 10, group: "B" },
    ],
    bins: [{ label: "0-10", count: 5 }, { label: "10-20", count: 12 }],
  },
  composition: { items: [{ label: "Pregrado", value: 60 }, { label: "Posgrado", value: 30 }, { label: "Continuada", value: 10 }] },
  relationship: {
    nodes: [{ id: "a", label: "Facultad A" }, { id: "b", label: "Facultad B" }, { id: "c", label: "Unidad C" }],
    links: [{ source: "a", target: "b", value: 5 }, { source: "b", target: "c", value: 3 }],
  },
  process: {
    steps: [
      { label: "Diagnóstico", description: "Análisis inicial", icon: "check" },
      { label: "Diseño", lane: "Equipo A" },
      { label: "Implementación", lane: "Equipo B", value: 40 },
    ],
  },
  hierarchy: {
    root: {
      label: "Rectoría",
      children: [{ label: "Vicerrectoría A", children: [{ label: "Facultad 1" }, { label: "Facultad 2" }] }, { label: "Vicerrectoría B" }],
    },
  },
  geography: {
    basemap: "colombia",
    regions: [{ region: "cundinamarca", label: "Cundinamarca", value: 80 }, { region: "antioquia", label: "Antioquia", value: 45 }],
  },
  strategy: {
    items: [{ label: "Producto A", x: 3, y: 7, size: 5, category: "Clave" }, { label: "Producto B", x: 8, y: 2, size: 9, category: "Soporte" }],
    axes: { xLabel: "Esfuerzo", yLabel: "Impacto" },
  },
};

for (const [type, defName] of Object.entries(MODULE_DEF_BY_TYPE)) {
  const variants = schema.$defs[defName].properties.variant?.enum ?? [null];
  const chartFn = MODULE_CHARTS[type];
  for (const variant of variants) {
    const module = { id: "test", type, title: "Prueba", variant: variant ?? undefined, ...SAMPLE_PAYLOAD[type] };
    let result;
    let error;
    try {
      result = chartFn(module, { widthPx: 900, repoRoot });
    } catch (e) {
      error = e;
    }
    const label = `${type}/${variant ?? "(sin variant)"}`;
    if (error) {
      check(label, false, error.message);
      continue;
    }
    const shapeOk = result && typeof result.heightPx === "number" && !Number.isNaN(result.heightPx) && typeof result.html === "string";
    const contentOk = shapeOk && !result.html.includes("undefined") && !result.html.includes("NaN");
    check(label, shapeOk && contentOk, shapeOk ? "contiene 'undefined'/'NaN' en el HTML generado" : "forma de retorno inválida");
  }
}

console.log(`\n${failures === 0 ? "TODO OK" : `${failures} prueba(s) fallida(s)`}`);
process.exit(failures === 0 ? 0 : 1);
