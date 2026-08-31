// Familia "Procesos" (guidelines/infografias.md §4). module.steps
// ({label, description?, icon?, lane?, value?}).
import { escapeXml, colorForIndex, textEl, formatNumber, svgWrap } from "./chart-kit.mjs";
import { iconMarkup } from "../icons.mjs";

const STEP_GAP = 16;

function chevron(steps, widthPx, { repoRoot } = {}) {
  const n = steps.length;
  const w = (widthPx - STEP_GAP * (n - 1)) / n;
  const h = 130;
  const notch = 18;
  const badgeR = 27;
  let svg = "";
  steps.forEach((step, i) => {
    const x = i * (w + STEP_GAP);
    const points = i === n - 1
      ? `${x},0 ${x + w},0 ${x + w},${h} ${x},${h} ${x + notch},${h / 2}`
      : `${x},0 ${x + w},0 ${x + w + notch},${h / 2} ${x + w},${h} ${x},${h} ${x + notch},${h / 2}`;
    svg += `<polygon points="${points}" fill="${colorForIndex(i)}" />`;
    // Insignia circular centrada (antes el número flotaba solo cerca del
    // borde superior de la flecha, sin relleno ni centrado real).
    const numCx = x + w / 2 + notch / 2;
    const numCy = h / 2;
    svg += `<circle cx="${numCx}" cy="${numCy}" r="${badgeR}" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.6)" stroke-width="2" />`;
    svg += textEl(numCx, numCy + 9, `${i + 1}`, { size: 26, anchor: "middle", weight: 900, color: "var(--paper)" });
  });
  const svgHtml = svgWrap(widthPx, h, svg);
  const labels = steps
    .map((step, i) => {
      const x = i * (w + STEP_GAP);
      const iconHtml = step.icon && repoRoot ? `<div style="display:flex;justify-content:center;margin-bottom:4px">${iconMarkup(repoRoot, step.icon, { sizePx: 22, color: colorForIndex(i) })}</div>` : "";
      return `<div style="position:absolute;left:${x}px;top:${h + 12}px;width:${w}px;box-sizing:border-box;padding:0 4px">
        ${iconHtml}
        <div style="font-family:var(--font-sans);font-size:15px;font-weight:var(--fw-bold);color:var(--text-strong);text-align:center">${escapeXml(step.label)}</div>
        ${step.description ? `<div style="font-family:var(--font-sans);font-size:13px;color:var(--text-muted);text-align:center;margin-top:4px">${escapeXml(step.description)}</div>` : ""}
      </div>`;
    })
    .join("");
  return { heightPx: h + 70, html: `<div style="position:relative;width:${widthPx}px;height:${h + 70}px">${svgHtml}${labels}</div>` };
}

function pipeline(steps, widthPx) {
  const n = steps.length;
  const boxW = (widthPx - STEP_GAP * (n - 1)) / n;
  const boxH = 64;
  const arrowW = STEP_GAP;
  let svg = "";
  steps.forEach((step, i) => {
    const x = i * (boxW + STEP_GAP);
    svg += `<rect x="${x}" y="0" width="${boxW}" height="${boxH}" rx="8" fill="${colorForIndex(i)}" />`;
    svg += textEl(x + boxW / 2, boxH / 2 + 5, step.label, { size: 14, anchor: "middle", weight: 700, color: "var(--paper)" });
    if (i < n - 1) {
      const ax = x + boxW;
      svg += `<polygon points="${ax},${boxH / 2 - 7} ${ax + arrowW - 2},${boxH / 2} ${ax},${boxH / 2 + 7}" fill="var(--ink-500)" />`;
    }
  });
  return { heightPx: boxH, html: svgWrap(widthPx, boxH, svg) };
}

function flowchart(steps, widthPx) {
  const boxH = 64;
  const gap = 40;
  const boxW = Math.min(560, widthPx * 0.6);
  const cx = widthPx / 2;
  let svg = "";
  steps.forEach((step, i) => {
    const y = i * (boxH + gap);
    svg += `<rect x="${cx - boxW / 2}" y="${y}" width="${boxW}" height="${boxH}" rx="10" fill="${colorForIndex(i)}" />`;
    svg += textEl(cx, y + boxH / 2 + 5, step.label, { size: 16, anchor: "middle", weight: 700, color: "var(--paper)" });
    if (i < steps.length - 1) {
      const ay = y + boxH;
      svg += `<line x1="${cx}" y1="${ay}" x2="${cx}" y2="${ay + gap - 8}" stroke="var(--ink-400)" stroke-width="2" />`;
      svg += `<polygon points="${cx - 6},${ay + gap - 8} ${cx + 6},${ay + gap - 8} ${cx},${ay + gap}" fill="var(--ink-400)" />`;
    }
  });
  const height = steps.length * boxH + (steps.length - 1) * gap;
  return { heightPx: height, html: svgWrap(widthPx, height, svg) };
}

function swimlane(steps, widthPx) {
  const lanes = [...new Set(steps.map((s) => s.lane || "General"))];
  const laneH = 84;
  const boxW = Math.min(220, (widthPx - 160) / 3);
  const gap = 30;
  let svg = "";
  lanes.forEach((lane, li) => {
    const y = li * laneH;
    svg += `<rect x="0" y="${y}" width="${widthPx}" height="${laneH}" fill="${li % 2 === 0 ? "var(--accent-100)" : "var(--paper)"}" opacity="0.5" />`;
    svg += textEl(10, y + 24, lane, { size: 13, weight: 700, color: "var(--text-strong)" });
  });
  const stepsByLane = new Map(lanes.map((l) => [l, 0]));
  steps.forEach((step) => {
    const lane = step.lane || "General";
    const li = lanes.indexOf(lane);
    const idx = stepsByLane.get(lane);
    stepsByLane.set(lane, idx + 1);
    const x = 130 + idx * (boxW + gap);
    const y = li * laneH + 34;
    svg += `<rect x="${x}" y="${y}" width="${boxW}" height="${laneH - 24}" rx="8" fill="${colorForIndex(li)}" />`;
    svg += textEl(x + boxW / 2, y + (laneH - 24) / 2 + 5, step.label, { size: 14, anchor: "middle", weight: 700, color: "var(--paper)" });
  });
  return { heightPx: lanes.length * laneH, html: svgWrap(widthPx, lanes.length * laneH, svg) };
}

function funnel(steps, widthPx) {
  const n = steps.length;
  const rowH = 54;
  const values = steps.map((s) => (s.value != null ? s.value : n - steps.indexOf(s)));
  const max = Math.max(...values);
  let svg = "";
  steps.forEach((step, i) => {
    const w = Math.max(60, (values[i] / max) * widthPx);
    const x = (widthPx - w) / 2;
    const y = i * (rowH + 6);
    svg += `<rect x="${x}" y="${y}" width="${w}" height="${rowH}" fill="${colorForIndex(i)}" rx="4" />`;
    svg += textEl(widthPx / 2, y + rowH / 2 + 5, `${step.label}${step.value != null ? ` · ${formatNumber(step.value)}` : ""}`, { size: 14, anchor: "middle", weight: 700, color: "var(--paper)" });
  });
  const height = n * (rowH + 6) - 6;
  return { heightPx: height, html: svgWrap(widthPx, height, svg) };
}

function journeyMap(steps, widthPx, opts) {
  return chevron(steps, widthPx, opts);
}

export default function renderProcess(module, { widthPx, repoRoot } = {}) {
  const variant = module.variant || "chevron";
  const steps = module.steps;
  switch (variant) {
    case "flowchart":
      return flowchart(steps, widthPx);
    case "swimlane":
      return swimlane(steps, widthPx);
    case "funnel":
      return funnel(steps, widthPx);
    case "journey-map":
      return journeyMap(steps, widthPx, { repoRoot });
    case "pipeline":
      return pipeline(steps, widthPx);
    case "chevron":
    default:
      return chevron(steps, widthPx, { repoRoot });
  }
}
