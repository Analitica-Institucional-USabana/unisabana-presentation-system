// Familia "Geografía" (guidelines/infografias.md §4). module.basemap
// ('colombia'|'world') + module.regions.
//
// LIMITACIÓN DELIBERADA (documentar, no ocultar — mismo espíritu de
// core/brand/rules/imagery.json "nunca fabricar/simular"): este renderer NO
// dibuja un contorno cartográfico real. Un basemap SVG geográficamente
// preciso (departamentos de Colombia, países del mundo) requiere un asset
// vendorizado verificado por una fuente confiable — no algo que se pueda
// generar de memoria sin riesgo de errores de forma/adyacencia que
// desinformen en una pieza institucional. Hasta que se vendorice un basemap
// real (ver planning/11-infografia-artifact-type.md), 'geography' se
// representa como una lista ordenada por región con color/tamaño codificando
// el valor — funcional y honesto, aunque no espacial.
import { escapeXml, colorForIndex, textEl, formatNumber } from "./chart-kit.mjs";

const ROW_H = 40;
const ROW_GAP = 10;
const LABEL_W = 180;

function basemapLabel(basemap) {
  return basemap === "world" ? "Mundo" : "Colombia";
}

function intensityList(regions, widthPx, { asIntensity = false, asBubble = false } = {}) {
  const max = Math.max(1, ...regions.map((r) => r.value));
  const chartX0 = LABEL_W;
  const chartW = widthPx - chartX0 - 60;
  const totalH = regions.length * (ROW_H + ROW_GAP);
  let svg = "";
  regions.forEach((r, i) => {
    const y = i * (ROW_H + ROW_GAP);
    const intensity = r.value / max;
    svg += textEl(chartX0 - 12, y + ROW_H / 2 + 5, r.label || r.region, { size: 14, anchor: "end", weight: 500, color: "var(--text-strong)" });
    if (asBubble) {
      const radius = 8 + intensity * 18;
      svg += `<circle cx="${chartX0 + 24}" cy="${y + ROW_H / 2}" r="${radius}" fill="var(--accent)" opacity="0.85" />`;
    } else if (asIntensity) {
      const bg = `color-mix(in srgb, var(--accent) ${Math.round(intensity * 100)}%, var(--paper))`;
      svg += `<rect x="${chartX0}" y="${y}" width="${chartW}" height="${ROW_H - 8}" rx="4" fill="${bg}" />`;
    } else {
      svg += `<rect x="${chartX0}" y="${y}" width="${chartW * intensity}" height="${ROW_H - 8}" rx="4" fill="var(--accent)" />`;
    }
    svg += textEl(chartX0 + chartW + 12, y + ROW_H / 2 + 5, formatNumber(r.value), { size: 13, color: "var(--text-muted)" });
  });
  return { heightPx: totalH - ROW_GAP, svg };
}

function heatmapGrid(regions, widthPx) {
  const max = Math.max(1, ...regions.map((r) => r.value));
  const cols = Math.min(6, regions.length);
  const cell = Math.min(90, widthPx / cols - 8);
  let svg = "";
  regions.forEach((r, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * (cell + 8);
    const y = row * (cell + 8);
    const intensity = r.value / max;
    const bg = `color-mix(in srgb, var(--accent) ${Math.round(intensity * 100)}%, var(--paper))`;
    svg += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="6" fill="${bg}" stroke="var(--border-subtle)" />`;
    svg += textEl(x + cell / 2, y + cell / 2 - 4, r.label || r.region, { size: 11, anchor: "middle", weight: 600, color: "var(--text-strong)" });
    svg += textEl(x + cell / 2, y + cell / 2 + 14, formatNumber(r.value), { size: 12, anchor: "middle", color: "var(--text-strong)" });
  });
  const rows = Math.ceil(regions.length / cols);
  const height = rows * (cell + 8) - 8;
  return { heightPx: height, svg };
}

export default function renderGeography(module, { widthPx } = {}) {
  const variant = module.variant || "choropleth";
  const regions = module.regions;
  const header = `<div style="font-family:var(--font-sans);font-size:12px;color:var(--text-muted);margin-bottom:10px">Basemap: ${escapeXml(basemapLabel(module.basemap))} (representación por lista/intensidad, no cartográfica — ver core/brand/assets/maps/)</div>`;
  let result;
  switch (variant) {
    case "bubble-map":
      result = intensityList(regions, widthPx, { asBubble: true });
      break;
    case "heatmap":
      result = heatmapGrid(regions, widthPx);
      break;
    case "point-map":
      result = intensityList(regions, widthPx, { asBubble: true });
      break;
    case "choropleth":
    default:
      result = intensityList(regions, widthPx, { asIntensity: true });
      break;
  }
  const svgHtml = `<svg width="${widthPx}" height="${result.heightPx}" viewBox="0 0 ${widthPx} ${result.heightPx}" xmlns="http://www.w3.org/2000/svg">${result.svg}</svg>`;
  return { heightPx: result.heightPx + 22, html: `<div style="width:${widthPx}px">${header}${svgHtml}</div>` };
}
