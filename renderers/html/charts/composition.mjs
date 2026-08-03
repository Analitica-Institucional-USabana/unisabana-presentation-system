// Familia "Composición" (guidelines/infografias.md §4). module.items
// (dataPoint: label+value, parte de un todo). 'sunburst' aquí se reduce a un
// anillo simple (más grueso) porque module.items es una lista plana, no una
// jerarquía — una jerarquía real de composición vive en la familia
// `hierarchy`. 'mosaic' se simplifica a una sola fila de anchos proporcionales
// (equivalente a un stacked bar de una sola banda) por el mismo motivo: no
// hay una segunda dimensión categórica en el módulo para cruzar.
import { colorForIndex, textEl, escapeXml, formatNumber, svgWrap } from "./chart-kit.mjs";

function polarToCartesian(cx, cy, r, angle) {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

// Leyenda enriquecida: swatch + etiqueta + porcentaje + barra de participación
// (no solo texto) — usa el ancho que le deja el donut/waffle en vez de quedar
// como una columna angosta de texto suelto.
function richLegend(items, total, legendWidthPx) {
  const rows = items
    .map((it, i) => {
      const pct = (it.value / total) * 100;
      return `<div style="margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
          <span style="width:12px;height:12px;border-radius:3px;background:${colorForIndex(i)};display:inline-block;flex-shrink:0"></span>
          <span style="font-family:var(--font-sans);font-size:15px;color:var(--text-strong);font-weight:var(--fw-medium)">${escapeXml(it.label)}</span>
          <span style="font-family:var(--font-sans);font-size:15px;font-weight:var(--fw-bold);color:${colorForIndex(i)};margin-left:auto">${formatNumber(pct)}%</span>
        </div>
        <div style="height:8px;width:100%;background:var(--accent-100);border-radius:var(--radius-pill);overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${colorForIndex(i)};border-radius:var(--radius-pill)"></div>
        </div>
      </div>`;
    })
    .join("");
  return `<div style="width:${legendWidthPx}px">${rows}</div>`;
}

function ringChart(items, { widthPx, thickness = 0.42 } = {}) {
  const total = items.reduce((sum, it) => sum + it.value, 0) || 1;
  const size = Math.max(280, Math.min(widthPx * 0.44, 440));
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
    svg += `<path d="M ${x0} ${y0} A ${r} ${r} 0 ${largeArc} 1 ${x1} ${y1} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix0} ${iy0} Z" fill="${colorForIndex(i)}" stroke="var(--paper)" stroke-width="3" />`;
    angle = end;
  });
  svg += textEl(cx, cy - 4, formatNumber(total), { size: 34, anchor: "middle", weight: 900, color: "var(--text-strong)" });
  svg += textEl(cx, cy + 22, "total", { size: 13, anchor: "middle", color: "var(--text-muted)" });
  const svgHtml = svgWrap(size, size, svg);
  const legendWidth = Math.max(160, widthPx - size - 40);
  return { heightPx: size, html: `<div style="display:flex;gap:40px;align-items:center;justify-content:center;width:${widthPx}px">${svgHtml}${richLegend(items, total, legendWidth)}</div>` };
}

function waffle(items, widthPx) {
  const total = items.reduce((sum, it) => sum + it.value, 0) || 1;
  const cells = [];
  items.forEach((it, i) => {
    const n = Math.round((it.value / total) * 100);
    for (let k = 0; k < n && cells.length < 100; k++) cells.push(i);
  });
  while (cells.length < 100) cells.push(items.length - 1);
  const cellSize = Math.max(22, Math.min((widthPx * 0.45) / 10 - 4, 34));
  const gap = 4;
  let svg = "";
  cells.forEach((colorIdx, i) => {
    const col = i % 10;
    const row = Math.floor(i / 10);
    svg += `<rect x="${col * (cellSize + gap)}" y="${row * (cellSize + gap)}" width="${cellSize}" height="${cellSize}" rx="3" fill="${colorForIndex(colorIdx)}" />`;
  });
  const gridSize = 10 * (cellSize + gap) - gap;
  const svgHtml = svgWrap(gridSize, gridSize, svg);
  const legendWidth = Math.max(160, widthPx - gridSize - 40);
  return { heightPx: gridSize, html: `<div style="display:flex;gap:40px;align-items:center;justify-content:center;width:${widthPx}px">${svgHtml}${richLegend(items, total, legendWidth)}</div>` };
}

function treemap(items, widthPx) {
  const total = items.reduce((sum, it) => sum + it.value, 0) || 1;
  const height = 260;
  const sorted = [...items].sort((a, b) => b.value - a.value);
  let x = 0;
  const svgParts = sorted.map((it, i) => {
    const w = (it.value / total) * widthPx;
    const rect = `<rect x="${x}" y="0" width="${Math.max(0, w - 3)}" height="${height}" fill="${colorForIndex(i)}" rx="4" />`;
    const canLabel = w > 60;
    const label = canLabel
      ? textEl(x + 14, 32, it.label, { size: Math.min(18, 12 + w / 60), weight: 700, color: "var(--paper)" }) +
        textEl(x + 14, 60, `${formatNumber((it.value / total) * 100)}%`, { size: 15, color: "var(--paper)" })
      : "";
    x += w;
    return rect + label;
  });
  return { heightPx: height, html: svgWrap(widthPx, height, svgParts.join("")) };
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
