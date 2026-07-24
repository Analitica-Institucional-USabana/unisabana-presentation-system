// Orquestador del validador de marca (Hito 6, planning/03-migration-roadmap.md).
// Dos capas independientes:
//  1. Reglas sobre el Deck Spec (antes de renderizar): imagery, density.
//  2. Reglas sobre el HTML ya renderizado (después de renderizar): logo, ai-disclosure.
// Ambas producen reportes por slide con la misma forma (validators/report.mjs);
// se fusionan si se ejecutan las dos.

import { createSlideReport, mergeSlideReports, overallVerdict } from "./report.mjs";
import { checkImagery } from "./rules/imagery.mjs";
import { checkDensity } from "./rules/density.mjs";
import { checkIcons } from "./rules/icons.mjs";
import { checkLogo } from "./rules/logo.mjs";
import { checkAiDisclosure } from "./rules/ai-disclosure.mjs";

export function validateDeckSpecRules(deck, ctx) {
  const reportsById = new Map(deck.slides.map((s) => [s.id, createSlideReport(s.id)]));
  checkImagery(deck, ctx, reportsById);
  checkDensity(deck, ctx, reportsById);
  checkIcons(deck, ctx, reportsById);
  return [...reportsById.values()].map((r) => r.finalize());
}

export function validateRenderedHtmlRules(html, deck, ctx) {
  const reportsById = new Map(deck.slides.map((s) => [s.id, createSlideReport(s.id)]));
  checkLogo(html, deck, ctx, reportsById);
  checkAiDisclosure(html, deck, ctx, reportsById);
  return [...reportsById.values()].map((r) => r.finalize());
}

export function mergeReportSets(a, b) {
  const byId = new Map(a.map((r) => [r.slideId, r]));
  for (const r of b) {
    byId.set(r.slideId, byId.has(r.slideId) ? mergeSlideReports(byId.get(r.slideId), r) : r);
  }
  return [...byId.values()];
}

export { overallVerdict };
