// Gráficos y diagramas para el campo `chart` del Deck Spec. Fase 1 (bar..radar,
// planning/09-visual-richness-and-content-density.md): nativos de PowerPoint
// (pptxgenjs addChart) — no hace falta pre-rasterizar nada, y quedan editables
// en PowerPoint (cambiar cifras sin regenerar el deck). Fase 2 (matrix-2x2,
// funnel, hierarchy — adenda de la misma nota): sin equivalente nativo en
// pptxgenjs, se dibujan con formas (ver diagrams.mjs), mismo principio que ya
// usa renderers/pptx/layouts/process.mjs.
import { drawFunnel, drawMatrix2x2, drawHierarchy, drawNetwork, drawTreemap, drawPyramid, drawVenn } from "./diagrams.mjs";

const CHART_TYPE = {
  "bar-horizontal": "bar",
  "bar-vertical": "bar",
  line: "line",
  area: "area",
  donut: "doughnut",
  scatter: "scatter",
  radar: "radar",
};

// Mismo principio de rampa de acento que renderers/html/charts/chart-kit.mjs
// (ACCENT_RAMP), resuelto a hex concreto vía colors.mjs en vez de var(--...).
// Sin accent-300 (colors.mjs no lo resuelve para pptx) — 4 tonos alcanzan
// para las series que un chart nativo de Fase 1 razonablemente tiene (≤4).
function accentRamp(colors) {
  return [colors.accentDark, colors.accent, colors.accentMid, colors.ink500];
}

function categoricalSeries(categories, series) {
  return series.map((s) => ({ name: s.name, labels: categories, values: s.values }));
}

export function addChartBlock(pptxSlide, chart, { x, y, w, h, colors }) {
  // Fase 2: sin objeto de gráfico nativo — se dibuja con formas.
  if (chart.type === "funnel") return drawFunnel(pptxSlide, chart.items, { x, y, w, h, colors });
  if (chart.type === "matrix-2x2") return drawMatrix2x2(pptxSlide, chart.items, chart.axes, { x, y, w, h, colors });
  if (chart.type === "hierarchy") return drawHierarchy(pptxSlide, chart.tree, { x, y, w, h, colors });
  if (chart.type === "network") return drawNetwork(pptxSlide, chart.nodes, chart.links, { x, y, w, h, colors });
  if (chart.type === "treemap") return drawTreemap(pptxSlide, chart.items, { x, y, w, h, colors });
  if (chart.type === "pyramid") return drawPyramid(pptxSlide, chart.items, { x, y, w, h, colors });
  if (chart.type === "venn") return drawVenn(pptxSlide, chart.items, { x, y, w, h, colors });

  const chartType = CHART_TYPE[chart.type];
  if (!chartType) throw new Error(`chart-block: tipo de chart no soportado en PPTX '${chart.type}'`);
  const base = { x, y, w, h, chartColors: accentRamp(colors), showTitle: false, dataLabelColor: colors.ink700 };

  switch (chart.type) {
    case "bar-horizontal":
      pptxSlide.addChart(chartType, categoricalSeries(chart.categories, chart.series), { ...base, barDir: "bar", showLegend: chart.series.length > 1 });
      break;
    case "bar-vertical":
      pptxSlide.addChart(chartType, categoricalSeries(chart.categories, chart.series), { ...base, barDir: "col", showLegend: chart.series.length > 1 });
      break;
    case "line":
    case "area":
      pptxSlide.addChart(chartType, categoricalSeries(chart.categories, chart.series), { ...base, showLegend: chart.series.length > 1 });
      break;
    case "donut":
      pptxSlide.addChart(chartType, [{ name: chart.title || "Serie", labels: chart.items.map((i) => i.label), values: chart.items.map((i) => i.value) }], {
        ...base,
        showLegend: true,
        showPercent: true,
        // El % se dibuja ENCIMA de cada porción, no sobre fondo blanco — la
        // rampa de acento de este deck son azules oscuros (accentDark/accent/
        // accentMid), así que dataLabelColor (ink700, pensado para leyendas y
        // ejes sobre blanco) queda casi invisible aquí. Override a blanco,
        // reportado 2026-08-31 ("queda invisible en el gráfico").
        dataLabelColor: colors.paper,
      });
      break;
    case "radar":
      pptxSlide.addChart(
        chartType,
        [{ name: chart.title || "Serie", labels: chart.items.map((i) => i.label), values: chart.items.map((i) => i.value) }],
        { ...base, showLegend: false }
      );
      break;
    case "scatter": {
      // ponytail: pptxgenjs modela scatter con la primera serie como eje X
      // compartido por todas las demás (no admite un X independiente por
      // grupo) — con `group` en los puntos, todos caen en una sola serie Y;
      // se pierde el color por grupo que sí tiene la versión HTML. Separar
      // por grupo en PPTX si eso importa más que tener un chart nativo editable.
      const data = [
        { name: "X", values: chart.points.map((p) => p.x) },
        { name: chart.title || "Serie", values: chart.points.map((p) => p.y) },
      ];
      pptxSlide.addChart(chartType, data, { ...base, showLegend: false });
      break;
    }
  }
}
