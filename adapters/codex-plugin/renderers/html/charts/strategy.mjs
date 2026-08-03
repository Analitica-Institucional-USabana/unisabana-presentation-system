// Familia "Estrategia" (guidelines/infografias.md §4). module.items
// (matrixItem: label,x,y,size?,category?) + module.axes opcional.
// Nunca semáforo rojo/ámbar/verde en 'risk-matrix' (guidelines/infografias.md
// §9 "únicamente colores institucionales autorizados") — la intensidad de
// riesgo se codifica con la rampa de acento (claro=bajo, oscuro=alto), nunca
// con un color fuera de la paleta activa.
import { escapeXml, colorForIndex, textEl } from "./chart-kit.mjs";

const SIZE = 380;
const PAD = 40;

function quadrantGrid(items, widthPx, axes, { quadrantLabels, shadeByQuadrant = false, sizeFromItem = false }) {
  const size = Math.min(widthPx, SIZE + PAD * 2);
  const plotSize = size - PAD * 2;
  const cx = PAD + plotSize / 2;
  const cy = PAD + plotSize / 2;

  let svg = "";
  if (shadeByQuadrant) {
    svg += `<rect x="${PAD}" y="${PAD}" width="${plotSize / 2}" height="${plotSize / 2}" fill="var(--accent-100)" />`;
    svg += `<rect x="${cx}" y="${PAD}" width="${plotSize / 2}" height="${plotSize / 2}" fill="var(--accent-300)" opacity="0.7" />`;
    svg += `<rect x="${PAD}" y="${cy}" width="${plotSize / 2}" height="${plotSize / 2}" fill="var(--accent-300)" opacity="0.7" />`;
    svg += `<rect x="${cx}" y="${cy}" width="${plotSize / 2}" height="${plotSize / 2}" fill="var(--accent)" opacity="0.55" />`;
  }
  svg += `<rect x="${PAD}" y="${PAD}" width="${plotSize}" height="${plotSize}" fill="none" stroke="var(--ink-300)" stroke-width="1.5" />`;
  svg += `<line x1="${cx}" y1="${PAD}" x2="${cx}" y2="${PAD + plotSize}" stroke="var(--ink-300)" stroke-width="1" />`;
  svg += `<line x1="${PAD}" y1="${cy}" x2="${PAD + plotSize}" y2="${cy}" stroke="var(--ink-300)" stroke-width="1" />`;

  if (quadrantLabels) {
    svg += textEl(PAD + plotSize * 0.25, PAD + 16, quadrantLabels.topLeft, { size: 12, anchor: "middle", weight: 700, color: "var(--text-muted)" });
    svg += textEl(PAD + plotSize * 0.75, PAD + 16, quadrantLabels.topRight, { size: 12, anchor: "middle", weight: 700, color: "var(--text-muted)" });
    svg += textEl(PAD + plotSize * 0.25, PAD + plotSize - 6, quadrantLabels.bottomLeft, { size: 12, anchor: "middle", weight: 700, color: "var(--text-muted)" });
    svg += textEl(PAD + plotSize * 0.75, PAD + plotSize - 6, quadrantLabels.bottomRight, { size: 12, anchor: "middle", weight: 700, color: "var(--text-muted)" });
  }

  const xs = items.map((it) => it.x), ys = items.map((it) => it.y);
  const minX = Math.min(...xs, 0), maxX = Math.max(...xs, 1);
  const minY = Math.min(...ys, 0), maxY = Math.max(...ys, 1);
  const px = (v) => PAD + ((v - minX) / (maxX - minX || 1)) * plotSize;
  const py = (v) => PAD + plotSize - ((v - minY) / (maxY - minY || 1)) * plotSize;

  const maxSize = Math.max(1, ...items.map((it) => it.size || 1));
  items.forEach((it, i) => {
    const r = sizeFromItem ? 8 + ((it.size || 1) / maxSize) * 22 : 9;
    svg += `<circle cx="${px(it.x)}" cy="${py(it.y)}" r="${r}" fill="${colorForIndex(i)}" stroke="var(--paper)" stroke-width="2" />`;
    svg += textEl(px(it.x), py(it.y) - r - 6, it.label, { size: 12, anchor: "middle", weight: 600, color: "var(--text-strong)" });
  });

  if (axes?.xLabel) svg += textEl(PAD + plotSize / 2, PAD + plotSize + 28, axes.xLabel, { size: 13, anchor: "middle", weight: 700, color: "var(--text-strong)" });
  if (axes?.yLabel) svg += `<text x="${PAD - 24}" y="${PAD + plotSize / 2}" font-size="13" font-family="var(--font-sans)" font-weight="700" fill="var(--text-strong)" text-anchor="middle" transform="rotate(-90 ${PAD - 24} ${PAD + plotSize / 2})">${escapeXml(axes.yLabel)}</text>`;

  return { heightPx: size + (axes?.xLabel ? 20 : 0), html: `<svg width="${size}" height="${size + (axes?.xLabel ? 20 : 0)}" viewBox="0 0 ${size} ${size + (axes?.xLabel ? 20 : 0)}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>` };
}

function radar(items, widthPx) {
  const size = Math.min(widthPx, 380);
  const cx = size / 2, cy = size / 2;
  const r = size / 2 - 50;
  const max = Math.max(1, ...items.map((it) => it.y));
  const n = items.length;
  const angleFor = (i) => -Math.PI / 2 + (i / n) * Math.PI * 2;

  let svg = "";
  [0.25, 0.5, 0.75, 1].forEach((frac) => {
    const pts = items.map((_, i) => {
      const a = angleFor(i);
      return `${cx + r * frac * Math.cos(a)},${cy + r * frac * Math.sin(a)}`;
    });
    svg += `<polygon points="${pts.join(" ")}" fill="none" stroke="var(--border-subtle)" stroke-width="1" />`;
  });
  const dataPts = items.map((it, i) => {
    const a = angleFor(i);
    const v = (it.y / max) * r;
    return `${cx + v * Math.cos(a)},${cy + v * Math.sin(a)}`;
  });
  svg += `<polygon points="${dataPts.join(" ")}" fill="var(--accent)" opacity="0.45" stroke="var(--accent-dark)" stroke-width="2" />`;
  items.forEach((it, i) => {
    const a = angleFor(i);
    const lx = cx + (r + 24) * Math.cos(a);
    const ly = cy + (r + 24) * Math.sin(a);
    svg += textEl(lx, ly, it.label, { size: 12, anchor: "middle", weight: 600, color: "var(--text-strong)" });
  });
  return { heightPx: size, html: `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>` };
}

function venn(items, widthPx) {
  const size = Math.min(widthPx, 380);
  const r = size / 3.2;
  const cy = size / 2;
  const positions = items.length === 2 ? [size / 2 - r * 0.55, size / 2 + r * 0.55] : [size / 2 - r * 0.6, size / 2 + r * 0.6, size / 2];
  const yPositions = items.length === 3 ? [cy - r * 0.4, cy - r * 0.4, cy + r * 0.5] : [cy, cy];
  let svg = "";
  items.forEach((it, i) => {
    svg += `<circle cx="${positions[i]}" cy="${yPositions[i] ?? cy}" r="${r}" fill="${colorForIndex(i)}" opacity="0.45" stroke="${colorForIndex(i)}" stroke-width="2" />`;
    svg += textEl(positions[i], (yPositions[i] ?? cy) - r - 10, it.label, { size: 13, anchor: "middle", weight: 700, color: "var(--text-strong)" });
  });
  return { heightPx: size, html: `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>` };
}

function canvas(items, widthPx) {
  const categories = [...new Set(items.map((it) => it.category || "General"))];
  const cols = Math.min(3, categories.length) || 1;
  const colWidth = (widthPx - (cols - 1) * 16) / cols;
  const cards = categories
    .map((cat, i) => {
      const catItems = items.filter((it) => (it.category || "General") === cat);
      const bullets = catItems.map((it) => `<div style="font-size:14px;color:var(--text-body);margin-bottom:6px">• ${escapeXml(it.label)}</div>`).join("");
      return `<div style="width:${colWidth}px;box-sizing:border-box;background:var(--paper);border:1px solid var(--border-subtle);border-top:4px solid ${colorForIndex(i)};border-radius:var(--radius-md);padding:14px;margin-bottom:16px">
        <div style="font-family:var(--font-sans);font-size:14px;font-weight:800;color:var(--text-strong);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:10px">${escapeXml(cat)}</div>
        ${bullets}
      </div>`;
    })
    .join("");
  return { heightPx: 220, html: `<div style="display:flex;flex-wrap:wrap;gap:16px;width:${widthPx}px">${cards}</div>` };
}

export default function renderStrategy(module, { widthPx } = {}) {
  const variant = module.variant || "matrix-2x2";
  const items = module.items;
  const axes = module.axes;
  switch (variant) {
    case "eisenhower":
      return quadrantGrid(items, widthPx, axes, {
        quadrantLabels: { topLeft: "Planificar", topRight: "Hacer ya", bottomLeft: "Delegar", bottomRight: "Eliminar" },
      });
    case "bcg":
      return quadrantGrid(items, widthPx, axes, { sizeFromItem: true });
    case "risk-matrix":
      return quadrantGrid(items, widthPx, axes, { shadeByQuadrant: true });
    case "radar":
      return radar(items, widthPx);
    case "venn":
      return venn(items, widthPx);
    case "canvas":
      return canvas(items, widthPx);
    case "matrix-2x2":
    default:
      return quadrantGrid(items, widthPx, axes, {});
  }
}
