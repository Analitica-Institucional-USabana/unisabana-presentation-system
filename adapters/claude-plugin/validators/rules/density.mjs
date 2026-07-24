// Reglas de densidad (core/brand/rules/density.json#/slideContentLimits). Son
// "preferidas", no un tope estructural duro (el propio readme.md lo aclara:
// "guía visual, no un objetivo a llenar mecánicamente") — por eso se reportan
// como warning, nunca como error. Los topes verdaderamente duros (ej. máximo
// de columnas en comparison) ya están en core/schemas/deck-spec.schema.json
// y por tanto ni siquiera llegan a esta capa.

import { readFileSync } from "node:fs";
import { join } from "node:path";

export function checkDensity(deck, { repoRoot }, reportsById) {
  const rules = JSON.parse(readFileSync(join(repoRoot, "core/brand/rules/density.json"), "utf8"));
  const limits = rules.slideContentLimits;

  for (const slide of deck.slides) {
    const r = reportsById.get(slide.id);

    if (slide.type === "agenda" && slide.items.length > limits.maxAgendaItemsPreferred) {
      r.add(
        "warning",
        `density.json#/slideContentLimits/maxAgendaItemsPreferred=${limits.maxAgendaItemsPreferred}: esta agenda tiene ${slide.items.length} ítems.`
      );
    } else if (slide.type === "agenda") {
      r.add("pass", `Agenda dentro del límite preferido (${slide.items.length}/${limits.maxAgendaItemsPreferred}).`);
    }

    if (slide.type === "process" && slide.steps.length > limits.maxProcessStepsPreferred) {
      r.add(
        "warning",
        `density.json#/slideContentLimits/maxProcessStepsPreferred=${limits.maxProcessStepsPreferred}: este proceso tiene ${slide.steps.length} pasos — considera dividirlo en vez de encoger el texto.`
      );
    } else if (slide.type === "process") {
      r.add("pass", `Proceso dentro del límite preferido (${slide.steps.length}/${limits.maxProcessStepsPreferred}).`);
    }

    if (slide.type === "data" && slide.stats.length > limits.maxChartSeriesPreferred) {
      r.add(
        "warning",
        `density.json#/slideContentLimits/maxChartSeriesPreferred=${limits.maxChartSeriesPreferred}: ${slide.stats.length} cifras en una sola diapositiva.`
      );
    } else if (slide.type === "data") {
      r.add("pass", `Cifras dentro del límite preferido (${slide.stats.length}/${limits.maxChartSeriesPreferred}).`);
    }
  }
}
