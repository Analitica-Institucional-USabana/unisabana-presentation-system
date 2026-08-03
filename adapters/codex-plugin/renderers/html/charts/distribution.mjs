// Familia "Distribución" (guidelines/infografias.md §4). module.points
// {x,y?,group?} o module.bins {label,count} según variant.
import { scaleLinear, textEl, lineEl, rectEl, circleEl, colorForIndex, svgWrap, gridlinesY } from "./chart-kit.mjs";

const CHART_H = 220;
const LABEL_GUTTER = 44;

function quartiles(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const q = (p) => {
    const idx = (sorted.length - 1) * p;
    const lo = Math.floor(idx), hi = Math.ceil(idx);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  };
  return { min: sorted[0], q1: q(0.25), median: q(0.5), q3: q(0.75), max: sorted[sorted.length - 1] };
}

function groupsOf(points) {
  const groups = new Map();
  for (const p of points) {
    const key = p.group || "";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p.x);
  }
  return groups;
}

function dotPlot(points, widthPx) {
  const max = Math.max(1, ...points.map((p) => p.x));
  const min = Math.min(0, ...points.map((p) => p.x));
  const scaleX = scaleLinear([min, max], [LABEL_GUTTER, widthPx - 10]);
  const y = 30;
  let svg = lineEl(LABEL_GUTTER, y, widthPx - 10, y, { color: "var(--border-subtle)" });
  points.forEach((p) => svg += circleEl(scaleX(p.x), y, 7, { fill: "var(--accent)" }));
  return { heightPx: 60, svg };
}

function scatter(points, widthPx) {
  const maxX = Math.max(1, ...points.map((p) => p.x));
  const minX = Math.min(0, ...points.map((p) => p.x));
  const maxY = Math.max(1, ...points.map((p) => p.y ?? 0));
  const scaleX = scaleLinear([minX, maxX], [LABEL_GUTTER, widthPx - 10]);
  const scaleY = scaleLinear([0, maxY], [CHART_H, 0]);
  let svg = gridlinesY({ x0: LABEL_GUTTER, x1: widthPx, y0: CHART_H, y1: 0, maxValue: maxY });
  svg += lineEl(LABEL_GUTTER, CHART_H, widthPx - 10, CHART_H, { color: "var(--ink-300)" });
  const groups = [...new Set(points.map((p) => p.group || ""))];
  points.forEach((p) => {
    const ci = groups.indexOf(p.group || "");
    svg += circleEl(scaleX(p.x), scaleY(p.y ?? 0), 6, { fill: colorForIndex(ci) });
  });
  return { heightPx: CHART_H + 20, svg };
}

function histogram(bins, widthPx) {
  const max = Math.max(1, ...bins.map((b) => b.count));
  const barGap = 8;
  const barWidth = (widthPx - LABEL_GUTTER - bins.length * barGap) / bins.length;
  let svg = gridlinesY({ x0: LABEL_GUTTER, x1: widthPx, y0: CHART_H, y1: 0, maxValue: max });
  bins.forEach((b, i) => {
    const h = (b.count / max) * CHART_H;
    const x = LABEL_GUTTER + i * (barWidth + barGap);
    svg += rectEl(x, CHART_H - h, barWidth, h, { fill: "var(--accent)" });
    svg += textEl(x + barWidth / 2, CHART_H + 20, b.label, { size: 12, anchor: "middle", color: "var(--text-body)" });
  });
  return { heightPx: CHART_H + 36, svg };
}

function boxPlot(points, widthPx, { violin = false } = {}) {
  const groups = groupsOf(points);
  const names = [...groups.keys()];
  const allValues = points.map((p) => p.x);
  const max = Math.max(...allValues);
  const min = Math.min(...allValues);
  const scaleY = scaleLinear([min, max], [CHART_H, 0]);
  const bandWidth = Math.min(90, (widthPx - LABEL_GUTTER) / names.length - 20);
  let svg = gridlinesY({ x0: LABEL_GUTTER, x1: widthPx, y0: CHART_H, y1: 0, maxValue: max });
  names.forEach((name, i) => {
    const values = groups.get(name);
    const { min: mn, q1, median, q3, max: mx } = quartiles(values);
    const cx = LABEL_GUTTER + 40 + i * ((widthPx - LABEL_GUTTER - 40) / names.length);
    svg += lineEl(cx, scaleY(mn), cx, scaleY(mx), { color: "var(--ink-300)", width: 2 });
    if (violin) {
      // Silueta simplificada (no es una KDE real): un rombo entre q1/q3 que se
      // angosta hacia min/max, suficiente para transmitir "más denso al centro"
      // sin fabricar una estimación de densidad que no se calculó.
      svg += `<path d="M ${cx} ${scaleY(mx)} L ${cx - bandWidth / 2} ${scaleY(q3)} L ${cx - bandWidth / 4} ${scaleY(median)} L ${cx - bandWidth / 2} ${scaleY(q1)} L ${cx} ${scaleY(mn)} L ${cx + bandWidth / 2} ${scaleY(q1)} L ${cx + bandWidth / 4} ${scaleY(median)} L ${cx + bandWidth / 2} ${scaleY(q3)} Z" fill="var(--accent-100)" stroke="var(--accent)" stroke-width="1.5" />`;
    } else {
      svg += rectEl(cx - bandWidth / 2, scaleY(q3), bandWidth, scaleY(q1) - scaleY(q3), { fill: "var(--accent-100)", rx: 3 });
      svg += `<rect x="${cx - bandWidth / 2}" y="${scaleY(q3)}" width="${bandWidth}" height="${scaleY(q1) - scaleY(q3)}" fill="none" stroke="var(--accent)" stroke-width="1.5" rx="3" />`;
    }
    svg += lineEl(cx - bandWidth / 2, scaleY(median), cx + bandWidth / 2, scaleY(median), { color: "var(--accent-dark)", width: 2.5 });
    svg += textEl(cx, CHART_H + 22, name || "—", { size: 13, anchor: "middle", color: "var(--text-body)" });
  });
  return { heightPx: CHART_H + 40, svg };
}

export default function renderDistribution(module, { widthPx } = {}) {
  const variant = module.variant || "dot-plot";
  let result;
  switch (variant) {
    case "scatter":
      result = scatter(module.points || [], widthPx);
      break;
    case "histogram":
      result = histogram(module.bins || [], widthPx);
      break;
    case "box-plot":
      result = boxPlot(module.points || [], widthPx);
      break;
    case "violin":
      result = boxPlot(module.points || [], widthPx, { violin: true });
      break;
    case "dot-plot":
    default:
      result = dotPlot(module.points || [], widthPx);
      break;
  }
  return { heightPx: result.heightPx, html: svgWrap(widthPx, result.heightPx, result.svg) };
}
