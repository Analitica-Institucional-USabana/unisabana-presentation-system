// Familia "Tendencias" (guidelines/infografias.md §4). module.categories (eje
// temporal) + module.series.
import { scaleLinear, textEl, lineEl, circleEl, colorForIndex, svgWrap, legendRow, gridlinesY } from "./chart-kit.mjs";

const CHART_H = 220;
const LABEL_GUTTER = 40;

function xPositions(categories, chartW) {
  const n = categories.length;
  const step = n > 1 ? chartW / (n - 1) : 0;
  return categories.map((_, i) => i * step);
}

function pathFor(values, xs, scaleY) {
  return values.map((v, i) => `${i === 0 ? "M" : "L"} ${xs[i]} ${scaleY(v)}`).join(" ");
}

function lineOrArea(module, widthPx, { area = false, stacked = false } = {}) {
  const { categories, series } = module;
  const chartX0 = LABEL_GUTTER;
  const chartW = widthPx - LABEL_GUTTER - 10;
  const max = stacked
    ? Math.max(1, ...categories.map((_, ci) => series.reduce((sum, s) => sum + s.values[ci], 0)))
    : Math.max(1, ...series.flatMap((s) => s.values));
  const scaleY = scaleLinear([0, max], [CHART_H, 0]);
  const xs = xPositions(categories, chartW).map((x) => x + chartX0);

  let svg = gridlinesY({ x0: chartX0, x1: widthPx, y0: CHART_H, y1: 0, maxValue: max });

  let stackAcc = categories.map(() => 0);
  series.forEach((s, si) => {
    const topValues = stacked ? s.values.map((v, ci) => (stackAcc[ci] += v)) : s.values;
    const baseValues = stacked ? topValues.map((v, ci) => v - s.values[ci]) : categories.map(() => 0);
    if (area || stacked) {
      const topPath = pathFor(topValues, xs, scaleY);
      const basePathRev = baseValues
        .map((v, i) => xs.length - 1 - i)
        .map((i) => `L ${xs[i]} ${scaleY(baseValues[i])}`)
        .join(" ");
      svg += `<path d="${topPath} ${basePathRev} Z" fill="${colorForIndex(si)}" opacity="0.75" />`;
    }
    svg += `<path d="${pathFor(topValues, xs, scaleY)}" fill="none" stroke="${colorForIndex(si)}" stroke-width="3" />`;
    topValues.forEach((v, i) => {
      svg += circleEl(xs[i], scaleY(v), 4, { fill: colorForIndex(si) });
    });
  });

  categories.forEach((cat, i) => {
    svg += textEl(xs[i], CHART_H + 22, cat, { size: 12, anchor: "middle", color: "var(--text-body)" });
  });

  return { heightPx: CHART_H + 40, svg };
}

function slope(module, widthPx) {
  const { categories, series } = module;
  const first = 0;
  const last = categories.length - 1;
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const scaleY = scaleLinear([0, max], [CHART_H, 0]);
  const x0 = LABEL_GUTTER + 60;
  const x1 = widthPx - 60;
  let svg = "";
  svg += textEl(x0, CHART_H + 22, categories[first], { size: 13, anchor: "middle", color: "var(--text-body)" });
  svg += textEl(x1, CHART_H + 22, categories[last], { size: 13, anchor: "middle", color: "var(--text-body)" });
  series.forEach((s, si) => {
    const y0 = scaleY(s.values[first]);
    const y1 = scaleY(s.values[last]);
    svg += lineEl(x0, y0, x1, y1, { color: colorForIndex(si), width: 3 });
    svg += circleEl(x0, y0, 5, { fill: colorForIndex(si) });
    svg += circleEl(x1, y1, 5, { fill: colorForIndex(si) });
    svg += textEl(x1 + 12, y1 + 5, s.name, { size: 13, color: colorForIndex(si), weight: 600 });
  });
  return { heightPx: CHART_H + 40, svg };
}

function sparkline(module, widthPx) {
  const s = module.series[0];
  const h = 60;
  const xs = xPositions(module.categories, widthPx - 10);
  const max = Math.max(1, ...s.values);
  const scaleY = scaleLinear([0, max], [h, 4]);
  const svg = `<path d="${pathFor(s.values, xs, scaleY)}" fill="none" stroke="var(--accent)" stroke-width="2.5" />` +
    circleEl(xs[xs.length - 1], scaleY(s.values[s.values.length - 1]), 4, { fill: "var(--accent-dark)" });
  return { heightPx: h + 10, svg };
}

function timeline(module, widthPx) {
  // Igual a 'line' pero con el eje temporal explícito como la etiqueta principal.
  return lineOrArea(module, widthPx, { area: false });
}

export default function renderTrend(module, { widthPx } = {}) {
  const variant = module.variant || "line";
  let result;
  switch (variant) {
    case "area":
      result = lineOrArea(module, widthPx, { area: true });
      break;
    case "stacked-area":
      result = lineOrArea(module, widthPx, { area: true, stacked: true });
      break;
    case "timeline":
      result = timeline(module, widthPx);
      break;
    case "slope":
      result = slope(module, widthPx);
      break;
    case "sparkline":
      result = sparkline(module, widthPx);
      break;
    case "line":
    default:
      result = lineOrArea(module, widthPx);
      break;
  }
  const showLegend = variant !== "sparkline" && variant !== "slope" && module.series.length > 1;
  const legendHtml = showLegend ? legendRow(module.series.map((s) => s.name)) : "";
  const html = `<div style="width:${widthPx}px">${svgWrap(widthPx, result.heightPx, result.svg)}${legendHtml ? `<div style="margin-top:8px">${legendHtml}</div>` : ""}</div>`;
  return { heightPx: result.heightPx + (showLegend ? 32 : 0), html };
}
