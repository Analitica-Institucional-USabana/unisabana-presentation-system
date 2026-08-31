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
import { checkChartData } from "./rules/chart-data.mjs";
import { checkLogo } from "./rules/logo.mjs";
import { checkAiDisclosure } from "./rules/ai-disclosure.mjs";
import { checkFooterOverflow } from "./rules/footer-overflow.mjs";
import { checkModuleDensity } from "./rules/module-density.mjs";
import { checkIconStyleConsistency } from "./rules/icon-style-consistency.mjs";
import { checkSourcesRequired } from "./rules/sources-required.mjs";
import { checkCobrandConstraints } from "./rules/cobrand-constraints.mjs";
import { checkAccessibilityMinBody } from "./rules/accessibility-min-body.mjs";

export function validateDeckSpecRules(deck, ctx) {
  const reportsById = new Map(deck.slides.map((s) => [s.id, createSlideReport(s.id)]));
  checkImagery(deck, ctx, reportsById);
  checkDensity(deck, ctx, reportsById);
  checkIcons(deck, ctx, reportsById);
  checkChartData(deck, ctx, reportsById);
  return [...reportsById.values()].map((r) => r.finalize());
}

export function validateRenderedHtmlRules(html, deck, ctx) {
  const reportsById = new Map(deck.slides.map((s) => [s.id, createSlideReport(s.id)]));
  checkLogo(html, deck, ctx, reportsById);
  checkAiDisclosure(html, deck, ctx, reportsById);
  checkFooterOverflow(html, deck, ctx, reportsById);
  return [...reportsById.values()].map((r) => r.finalize());
}

// Artefacto Infografía (core/schemas/infografia-spec.schema.json) — reportado
// por módulo (module.id), más una clave "infografia" para hallazgos a nivel
// de toda la pieza (keyNumbers, sources, co-marca, densidad global).
export function validateInfografiaSpecRules(spec, ctx) {
  const reportsById = new Map([
    ["infografia", createSlideReport("infografia")],
    ...spec.modules.map((m) => [m.id, createSlideReport(m.id)]),
  ]);
  checkModuleDensity(spec, ctx, reportsById);
  checkIconStyleConsistency(spec, ctx, reportsById);
  checkSourcesRequired(spec, ctx, reportsById);
  checkCobrandConstraints(spec, ctx, reportsById);
  return [...reportsById.values()].map((r) => r.finalize());
}

export function validateRenderedInfografiaHtmlRules(html, spec, ctx) {
  const reportsById = new Map([
    ["infografia", createSlideReport("infografia")],
    ...spec.modules.map((m) => [m.id, createSlideReport(m.id)]),
  ]);
  checkAccessibilityMinBody(html, spec, ctx, reportsById);
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
