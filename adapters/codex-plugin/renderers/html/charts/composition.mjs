// Familia "Composición" (guidelines/infografias.md §4). module.items
// (dataPoint: label+value, parte de un todo). 'sunburst' aquí se reduce a un
// anillo simple (más grueso) porque module.items es una lista plana, no una
// jerarquía — una jerarquía real de composición vive en la familia
// `hierarchy`. 'mosaic' se simplifica a una sola fila de anchos proporcionales
// (equivalente a un stacked bar de una sola banda) por el mismo motivo: no
// hay una segunda dimensión categórica en el módulo para cruzar.
import { colorForIndex, textEl, escapeXml, formatNumber } from "./chart-kit.mjs";

function polarToCartesian(cx, cy, r, angle) {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

function ringChart(items, { widthPx, thickness = 0.42 } = {}) {
  const total = items.reduce((sum, it) => sum + it.value, 0) || 1;
  const size = Math.min(widthPx, 320);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;
  const innerR = r * (1 - thickness);
  let angle = -Math.PI / 2;
  let svg = "";
  items.forEach((it, i) => {
    const slice = (it.value / total) * Math.PI * 2;
    const end = angle + slice;
    const [x0, y0] = polarToCartesian(cx, cy, r, angle);
    const [x1, y1] = polarToCartesian(cx, cy, r, end);
    const [ix1, iy1] = polarToCartesian(cx, cy, innerR, end);
    const [ix0, iy0] = polarToCartesian(cx, cy, innerR, angle);
    const largeArc = slice > Math.PI ? 1 : 0;
    svg += `<path d="M ${x0} ${y0} A ${r} ${r} 0 ${largeArc} 1 ${x1} ${y1} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix0} ${iy0} Z" fill="${colorForIndex(i)}" stroke="var(--paper)" stroke-width="2" />`;
    angle = end;
  });
  svg += textEl(cx, cy - 2, formatNumber(total), { size: 26, anchor: "middle", weight: 900, color: "var(--text-strong)" });
  svg += textEl(cx, cy + 18, "total", { size: 12, anchor: "middle", color: "var(--text-muted)" });
  const svgHtml = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`;
  const legend = items
    .map((it, i) => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="width:12px;height:12px;border-radius:3px;background:${colorForIndex(i)};display:inline-block;flex-shrink:0"></span><span style="font-family:var(--font-sans);font-size:14px;color:var(--text-body)">${escapeXml(it.label)} — <strong>${formatNumber((it.value / total) * 100)}%</strong></span></div>`)
    .join("");
  return { heightPx: size, html: `<div style="display:flex;gap:24px;align-items:center;width:${widthPx}px">${svgHtml}<div>${legend}</div></div>` };
}

function waffle(items, widthPx) {
  const total = items.reduce((sum, it) => sum + it.value, 0) || 1;
  const cells = [];
  let acc = 0;
  items.forEach((it, i) => {
    const n = Math.round((it.value / total) * 100);
    for (let k = 0; k < n && cells.length < 100; k++) cells.push(i);
  });
  while (cells.length < 100) cells.push(items.length - 1);
  const cellSize = 18;
  const gap = 3;
  let svg = "";
  cells.forEach((colorIdx, i) => {
    const col = i % 10;
    const row = Math.floor(i / 10);
    svg += `<rect x="${col * (cellSize + gap)}" y="${row * (cellSize + gap)}" width="${cellSize}" height="${cellSize}" rx="2" fill="${colorForIndex(colorIdx)}" />`;
  });
  const gridSize = 10 * (cellSize + gap) - gap;
  const svgHtml = `<svg width="${gridSize}" height="${gridSize}" viewBox="0 0 ${gridSize} ${gridSize}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`;
  const legend = items
    .map((it, i) => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="width:12px;height:12px;border-radius:3px;background:${colorForIndex(i)};display:inline-block;flex-shrink:0"></span><span style="font-family:var(--font-sans);font-size:14px;color:var(--text-body)">${escapeXml(it.label)} — <strong>${formatNumber((it.value / total) * 100)}%</strong></span></div>`)
    .join("");
  return { heightPx: gridSize, html: `<div style="display:flex;gap:24px;align-items:center;width:${widthPx}px">${svgHtml}<div>${legend}</div></div>` };
}

function treemap(items, widthPx) {
  const total = items.reduce((sum, it) => sum + it.value, 0) || 1;
  const height = 220;
  const sorted = [...items].sort((a, b) => b.value - a.value);
  let x = 0;
  const svgParts = sorted.map((it, i) => {
    const w = (it.value / total) * widthPx;
    const rect = `<rect x="${x}" y="0" width="${Math.max(0, w - 2)}" height="${height}" fill="${colorForIndex(i)}" />`;
    const label = w > 70 ? textEl(x + 10, 26, it.label, { size: 15, weight: 700, color: "var(--paper)" }) +
      textEl(x + 10, 50, `${formatNumber((it.value / total) * 100)}%`, { size: 13, color: "var(--paper)" }) : "";
    x += w;
    return rect + label;
  });
  return { heightPx: height, html: `<svg width="${widthPx}" height="${height}" viewBox="0 0 ${widthPx} ${height}" xmlns="http://www.w3.org/2000/svg">${svgParts.join("")}</svg>` };
}

function mosaic(items, widthPx) {
  return treemap(items, widthPx);
}

export default function renderComposition(module, { widthPx } = {}) {
  const variant = module.variant || "donut";
  switch (variant) {
    case "waffle":
      return waffle(module.items, widthPx);
    case "treemap":
      return treemap(module.items, widthPx);
    case "sunburst":
      return ringChart(module.items, { widthPx, thickness: 0.6 });
    case "mosaic":
      return mosaic(module.items, widthPx);
    case "donut":
    default:
      return ringChart(module.items, { widthPx });
  }
}
