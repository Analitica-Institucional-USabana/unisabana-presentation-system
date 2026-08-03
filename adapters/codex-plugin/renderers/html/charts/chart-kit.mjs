// Primitivas SVG compartidas por las 10 familias de renderers/html/charts/*.mjs.
// guidelines/infografias.md §5: apariencia editorial (sin 3D, sin degradados
// innecesarios, sin clipart) — por eso todo es SVG plano generado aquí, nunca
// una librería de gráficas externa (requisito offline D-20).
//
// Paleta: nunca colores libres (guidelines/infografias.md §9) — una rampa de
// 5 tonos derivados del ÚNICO acento activo (institutional o de facultad,
// core/brand/tokens.css), más dos neutrales de --ink-*. Esto es exactamente
// el uso permitido por el catálogo ("colores secundarios solo para comparar/
// destacar/categorizar"), nunca una paleta libre inventada por serie.
export const ACCENT_RAMP = [
  "var(--accent-dark)",
  "var(--accent)",
  "var(--accent-mid)",
  "var(--accent-300)",
  "var(--ink-500)",
];

export function colorForIndex(i) {
  return ACCENT_RAMP[i % ACCENT_RAMP.length];
}

export function escapeXml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function svgWrap(widthPx, heightPx, innerSvg) {
  return `<svg width="${widthPx}" height="${heightPx}" viewBox="0 0 ${widthPx} ${heightPx}" xmlns="http://www.w3.org/2000/svg" style="display:block;overflow:visible">${innerSvg}</svg>`;
}

// Escala lineal continua: [d0,d1] (dominio de datos) -> [r0,r1] (píxeles).
export function scaleLinear([d0, d1], [r0, r1]) {
  const span = d1 - d0 || 1;
  return (v) => r0 + ((v - d0) / span) * (r1 - r0);
}

// Escala de banda categórica: reparte `categories.length` bandas de igual
// ancho en [r0,r1], con `paddingRatio` de espacio entre bandas.
export function scaleBand(categories, [r0, r1], paddingRatio = 0.35) {
  const n = Math.max(1, categories.length);
  const step = (r1 - r0) / n;
  const bandwidth = step * (1 - paddingRatio);
  const pad = (step - bandwidth) / 2;
  return {
    bandwidth,
    step,
    x: (cat) => r0 + categories.indexOf(cat) * step + pad,
    xByIndex: (i) => r0 + i * step + pad,
  };
}

export function textEl(x, y, text, { size = 14, anchor = "start", weight = 400, color = "var(--text-body)" } = {}) {
  return `<text x="${x}" y="${y}" font-size="${size}" font-family="var(--font-sans)" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${escapeXml(text)}</text>`;
}

export function lineEl(x1, y1, x2, y2, { color = "var(--border-subtle)", width = 1, dash } = {}) {
  const d = dash ? ` stroke-dasharray="${dash}"` : "";
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"${d} />`;
}

export function rectEl(x, y, width, height, { fill = "var(--accent)", rx = 4 } = {}) {
  return `<rect x="${x}" y="${y}" width="${Math.max(0, width)}" height="${Math.max(0, height)}" fill="${fill}" rx="${rx}" />`;
}

export function circleEl(cx, cy, r, { fill = "var(--accent)", stroke, strokeWidth = 2 } = {}) {
  const s = stroke ? ` stroke="${stroke}" stroke-width="${strokeWidth}"` : "";
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${s} />`;
}

// Eje Y numérico simple: 4 líneas guía horizontales + etiqueta de valor,
// sin ejes decorativos adicionales (guidelines/infografias.md §5).
export function gridlinesY({ x0, x1, y0, y1, maxValue, ticks = 4 }) {
  let html = "";
  for (let i = 0; i <= ticks; i++) {
    const v = (maxValue / ticks) * i;
    const y = y0 - (v / (maxValue || 1)) * (y0 - y1);
    html += lineEl(x0, y, x1, y, { color: "var(--border-subtle)", width: 1 });
    html += textEl(x0 - 8, y + 4, formatNumber(v), { size: 12, anchor: "end", color: "var(--text-muted)" });
  }
  return html;
}

export function formatNumber(n) {
  const v = Number(n);
  if (Number.isNaN(v)) return String(n);
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

// Título de módulo (encabezado "una única idea") + wrapper — cada renderer de
// familia solo genera el gráfico en sí; el título/fuente del módulo los pone
// el document.mjs del artefacto para mantener el mismo Y de arranque en todos.
export function legendRow(labels, { widthPx } = {}) {
  const items = labels
    .map(
      (label, i) =>
        `<span style="display:inline-flex;align-items:center;gap:6px;margin-right:20px"><span style="width:12px;height:12px;border-radius:3px;background:${colorForIndex(i)};display:inline-block"></span><span style="font-family:var(--font-sans);font-size:14px;color:var(--text-body)">${label}</span></span>`
    )
    .join("");
  return `<div style="display:flex;flex-wrap:wrap;align-items:center;width:${widthPx ? widthPx + "px" : "100%"}">${items}</div>`;
}
