// Reglas de densidad de infografía (core/brand/rules/infografia-canvas.json#/moduleContentLimits).
// Igual que validators/rules/density.mjs (deck): son "guía visual, no un
// objetivo a llenar mecánicamente" — siempre warning, nunca error.

import { readFileSync } from "node:fs";
import { join } from "node:path";

export function checkModuleDensity(spec, { repoRoot }, reportsById) {
  const rules = JSON.parse(readFileSync(join(repoRoot, "core/brand/rules/infografia-canvas.json"), "utf8"));
  const limits = rules.moduleContentLimits;
  const root = reportsById.get("infografia");

  if (spec.modules.length > limits.maxModulesPreferred) {
    root.add(
      "warning",
      `infografia-canvas.json#/moduleContentLimits/maxModulesPreferred=${limits.maxModulesPreferred}: esta pieza tiene ${spec.modules.length} módulos — considera dividir en varias piezas o consolidar módulos relacionados.`
    );
  } else {
    root.add("pass", `Cantidad de módulos dentro del límite preferido (${spec.modules.length}/${limits.maxModulesPreferred}).`);
  }

  if (spec.infografia.keyNumbers.length > limits.maxKeyNumbersPreferred) {
    root.add(
      "warning",
      `infografia-canvas.json#/moduleContentLimits/maxKeyNumbersPreferred=${limits.maxKeyNumbersPreferred}: ${spec.infografia.keyNumbers.length} tarjetas KPI en el encabezado.`
    );
  }

  for (const module of spec.modules) {
    const r = reportsById.get(module.id);
    if (!r) continue;

    if ((module.type === "comparison" || module.type === "trend") && module.series.length > limits.maxChartSeriesPreferred) {
      r.add(
        "warning",
        `infografia-canvas.json#/moduleContentLimits/maxChartSeriesPreferred=${limits.maxChartSeriesPreferred}: este módulo combina ${module.series.length} series — cada módulo responde a una única idea (guidelines/infografias.md §3.5), considera dividirlo.`
      );
    } else if (module.type === "comparison" || module.type === "trend") {
      r.add("pass", `Series dentro del límite preferido (${module.series.length}/${limits.maxChartSeriesPreferred}).`);
    }

    if (module.type === "composition" && module.items.length > 6) {
      r.add(
        "warning",
        `guidelines/infografias.md §4 (composición): ${module.items.length} categorías en un mismo módulo — agrupa las menores en "otros" o cambia a un módulo de comparación/ranking.`
      );
    }
  }
}
