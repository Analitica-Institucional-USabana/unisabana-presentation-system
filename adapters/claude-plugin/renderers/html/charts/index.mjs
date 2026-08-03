// Dispatch de las 10 familias de módulo por module.type (core/schemas/infografia-spec.schema.json).
// Cada renderer de familia recibe (module, {widthPx, repoRoot}) y devuelve {heightPx, html}.
import renderIndicators from "./indicators.mjs";
import renderComparison from "./comparison.mjs";
import renderTrend from "./trends.mjs";
import renderDistribution from "./distribution.mjs";
import renderComposition from "./composition.mjs";
import renderRelationship from "./relationships.mjs";
import renderProcess from "./processes.mjs";
import renderHierarchy from "./hierarchies.mjs";
import renderGeography from "./geography.mjs";
import renderStrategy from "./strategy.mjs";

export const MODULE_CHARTS = {
  indicators: renderIndicators,
  comparison: renderComparison,
  trend: renderTrend,
  distribution: renderDistribution,
  composition: renderComposition,
  relationship: renderRelationship,
  process: renderProcess,
  hierarchy: renderHierarchy,
  geography: renderGeography,
  strategy: renderStrategy,
};
