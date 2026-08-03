// Familia "Indicadores" dentro del desarrollo (guidelines/infografias.md §4).
// Distinta de infografia.keyNumbers (tira obligatoria del encabezado, ver
// renderers/html/infografia/document.mjs#renderKeyNumbers) — este archivo
// resuelve module.items cuando el agente decide un módulo `indicators` dentro
// del cuerpo (ej. un medidor o barra de avance puntual).
import { escapeXml, colorForIndex, textEl, svgWrap, formatNumber } from "./chart-kit.mjs";

const CARD_GAP = 20;
const CARD_HEIGHT = 110;

function kpiCards(items, widthPx) {
  const n = items.length;
  const cardWidth = (widthPx - CARD_GAP * (n - 1)) / n;
  const cards = items
    .map((item, i) => {
      return `<div style="width:${cardWidth}px;box-sizing:border-box;background:var(--paper);border:1px solid var(--border-subtle);border-left:4px solid ${colorForIndex(i)};border-radius:var(--radius-md);padding:16px;">
        <div style="font-family:var(--font-sans);font-size:36px;font-weight:var(--fw-black);color:var(--accent);line-height:1;">${escapeXml(item.value)}${item.unit ? `<span style="font-size:16px;font-weight:var(--fw-semibold);color:var(--text-muted);margin-left:4px">${escapeXml(item.unit)}</span>` : ""}</div>
        <div style="font-family:var(--font-sans);font-size:15px;font-weight:var(--fw-medium);color:var(--text-strong);margin-top:6px;">${escapeXml(item.label)}</div>
        ${item.note ? `<div style="font-family:var(--font-sans);font-size:13px;color:var(--text-muted);margin-top:4px;">${escapeXml(item.note)}</div>` : ""}
      </div>`;
    })
    .join("");
  return { heightPx: CARD_HEIGHT, html: `<div style="display:flex;gap:${CARD_GAP}px;width:${widthPx}px">${cards}</div>` };
}

function bigNumber(items, widthPx) {
  const item = items[0];
  const html = `<div style="width:${widthPx}px">
    <div style="font-family:var(--font-sans);font-size:96px;font-weight:var(--fw-black);color:var(--accent);line-height:1;letter-spacing:var(--ls-display)">${escapeXml(item.value)}${item.unit ? `<span style="font-size:28px;color:var(--text-muted);margin-left:8px">${escapeXml(item.unit)}</span>` : ""}</div>
    <div style="font-family:var(--font-sans);font-size:22px;font-weight:var(--fw-semibold);color:var(--text-strong);margin-top:8px">${escapeXml(item.label)}</div>
  </div>`;
  return { heightPx: 170, html };
}

function percentage(items, widthPx) {
  const rows = items
    .map((item, i) => {
      const pct = Math.max(0, Math.min(100, Number(item.value) || 0));
      return `<div style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px">
          <span style="font-family:var(--font-sans);font-size:15px;font-weight:var(--fw-medium);color:var(--text-strong)">${escapeXml(item.label)}</span>
          <span style="font-family:var(--font-sans);font-size:22px;font-weight:var(--fw-bold);color:${colorForIndex(i)}">${formatNumber(pct)}%</span>
        </div>
        <div style="height:12px;width:100%;background:var(--accent-100);border-radius:var(--radius-pill);overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${colorForIndex(i)};border-radius:var(--radius-pill)"></div>
        </div>
      </div>`;
    })
    .join("");
  return { heightPx: items.length * 66, html: `<div style="width:${widthPx}px">${rows}</div>` };
}

function progressBarVariant(items, widthPx) {
  return percentage(items, widthPx);
}

function gauge(items, widthPx) {
  const item = items[0];
  const pct = Math.max(0, Math.min(100, Number(item.value) || 0));
  const size = Math.min(widthPx, 260);
  const r = size / 2 - 20;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = Math.PI; // 180deg (left)
  const endAngle = Math.PI + Math.PI * (pct / 100);
  const arcX = (a) => cx + r * Math.cos(a);
  const arcY = (a) => cy + r * Math.sin(a);
  const x0 = arcX(startAngle), y0 = arcY(startAngle);
  const x1 = arcX(Math.PI + Math.PI), y1 = arcY(Math.PI + Math.PI);
  const xv = arcX(endAngle), yv = arcY(endAngle);
  const largeArc = pct > 50 ? 1 : 0;
  let svg = `<path d="M ${x0} ${y0} A ${r} ${r} 0 1 1 ${x1} ${y1}" fill="none" stroke="var(--accent-100)" stroke-width="18" stroke-linecap="round" />`;
  svg += `<path d="M ${x0} ${y0} A ${r} ${r} 0 ${largeArc} 1 ${xv} ${yv}" fill="none" stroke="var(--accent)" stroke-width="18" stroke-linecap="round" />`;
  svg += textEl(cx, cy - 4, `${formatNumber(pct)}%`, { size: 34, anchor: "middle", weight: 900, color: "var(--accent)" });
  svg += textEl(cx, cy + 22, item.label, { size: 14, anchor: "middle", color: "var(--text-muted)" });
  return { heightPx: cy + 30, html: svgWrap(size, cy + 30, svg) };
}

export default function renderIndicators(module, { widthPx } = {}) {
  const variant = module.variant || "kpi-cards";
  const items = module.items;
  switch (variant) {
    case "big-number":
      return bigNumber(items, widthPx);
    case "percentage":
      return percentage(items, widthPx);
    case "progress-bar":
      return progressBarVariant(items, widthPx);
    case "gauge":
      return gauge(items, widthPx);
    case "kpi-cards":
    default:
      return kpiCards(items, widthPx);
  }
}
