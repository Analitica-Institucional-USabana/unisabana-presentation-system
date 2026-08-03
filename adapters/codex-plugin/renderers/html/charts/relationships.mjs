// Familia "Relaciones" (guidelines/infografias.md §4). module.nodes +
// module.links (core/schemas/infografia-spec.schema.json#/$defs/node,link).
// 'network'/'chord'/'bubble' usan un layout circular simple (sin simulación
// de fuerzas) — suficiente para comunicar la estructura de relaciones sin
// depender de una librería externa (requisito offline D-20).
import { colorForIndex, textEl, escapeXml, formatNumber } from "./chart-kit.mjs";

function circleLayout(nodes, { cx, cy, r }) {
  const n = nodes.length;
  return nodes.map((node, i) => {
    const angle = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return { ...node, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), angle };
  });
}

function degreeWeight(nodes, links) {
  const weight = new Map(nodes.map((n) => [n.id, 0]));
  for (const l of links) {
    weight.set(l.source, (weight.get(l.source) || 0) + (l.value || 1));
    weight.set(l.target, (weight.get(l.target) || 0) + (l.value || 1));
  }
  return weight;
}

function network(nodes, links, widthPx, { sizeByDegree = false } = {}) {
  const size = Math.min(widthPx, 420);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 60;
  const positioned = circleLayout(nodes, { cx, cy, r });
  const byId = new Map(positioned.map((n) => [n.id, n]));
  const weight = degreeWeight(nodes, links);
  const maxW = Math.max(1, ...weight.values());

  let svg = "";
  links.forEach((l) => {
    const a = byId.get(l.source);
    const b = byId.get(l.target);
    if (!a || !b) return;
    const strokeW = Math.max(1, ((l.value || 1) / maxW) * 6);
    svg += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="var(--accent-300)" stroke-width="${strokeW}" opacity="0.8" />`;
  });
  positioned.forEach((node, i) => {
    const radius = sizeByDegree ? 10 + ((weight.get(node.id) || 1) / maxW) * 22 : 14;
    svg += `<circle cx="${node.x}" cy="${node.y}" r="${radius}" fill="${colorForIndex(i)}" stroke="var(--paper)" stroke-width="2" />`;
    const labelX = node.x + (node.x > cx ? radius + 6 : -(radius + 6));
    svg += textEl(labelX, node.y + 4, node.label, { size: 12, anchor: node.x > cx ? "start" : "end", color: "var(--text-strong)", weight: 600 });
  });
  return { heightPx: size, html: `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>` };
}

function sankey(nodes, links, widthPx) {
  const sourceIds = [...new Set(links.map((l) => l.source))];
  const targetIds = [...new Set(links.map((l) => l.target))];
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const rowH = 46;
  const height = Math.max(sourceIds.length, targetIds.length) * rowH + 20;
  const leftX = 90;
  const rightX = widthPx - 90;

  const leftY = new Map(sourceIds.map((id, i) => [id, 30 + i * rowH]));
  const rightY = new Map(targetIds.map((id, i) => [id, 30 + i * rowH]));
  const maxVal = Math.max(1, ...links.map((l) => l.value || 1));

  let svg = "";
  links.forEach((l, i) => {
    const y0 = leftY.get(l.source);
    const y1 = rightY.get(l.target);
    const strokeW = Math.max(2, ((l.value || 1) / maxVal) * 26);
    svg += `<path d="M ${leftX} ${y0} C ${(leftX + rightX) / 2} ${y0}, ${(leftX + rightX) / 2} ${y1}, ${rightX} ${y1}" fill="none" stroke="${colorForIndex(i % 5)}" stroke-width="${strokeW}" opacity="0.55" />`;
  });
  sourceIds.forEach((id) => {
    const y = leftY.get(id);
    svg += `<circle cx="${leftX}" cy="${y}" r="6" fill="var(--accent-dark)" />`;
    svg += textEl(leftX - 12, y + 4, byId.get(id)?.label || id, { size: 13, anchor: "end", weight: 600, color: "var(--text-strong)" });
  });
  targetIds.forEach((id) => {
    const y = rightY.get(id);
    svg += `<circle cx="${rightX}" cy="${y}" r="6" fill="var(--accent-dark)" />`;
    svg += textEl(rightX + 12, y + 4, byId.get(id)?.label || id, { size: 13, anchor: "start", weight: 600, color: "var(--text-strong)" });
  });
  return { heightPx: height, html: `<svg width="${widthPx}" height="${height}" viewBox="0 0 ${widthPx} ${height}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>` };
}

function correlationMatrix(nodes, links, widthPx) {
  const n = nodes.length;
  const cell = Math.min(64, (widthPx - 140) / n);
  const originX = 140;
  const originY = 30;
  const valueOf = new Map();
  links.forEach((l) => {
    valueOf.set(`${l.source}|${l.target}`, l.value ?? 0);
    valueOf.set(`${l.target}|${l.source}`, l.value ?? 0);
  });
  const maxVal = Math.max(1, ...links.map((l) => Math.abs(l.value ?? 0)));
  let svg = "";
  nodes.forEach((rowNode, r) => {
    svg += textEl(originX - 10, originY + r * cell + cell / 2 + 4, rowNode.label, { size: 12, anchor: "end", color: "var(--text-strong)" });
    nodes.forEach((colNode, c) => {
      const v = r === c ? maxVal : valueOf.get(`${rowNode.id}|${colNode.id}`) ?? 0;
      const intensity = Math.min(1, Math.abs(v) / maxVal);
      const bg = `color-mix(in srgb, var(--accent) ${Math.round(intensity * 100)}%, var(--paper))`;
      svg += `<rect x="${originX + c * cell}" y="${originY + r * cell}" width="${cell - 2}" height="${cell - 2}" fill="${bg}" rx="3" />`;
    });
  });
  nodes.forEach((colNode, c) => {
    svg += `<text x="${originX + c * cell + cell / 2}" y="${originY - 8}" font-size="11" font-family="var(--font-sans)" fill="var(--text-strong)" text-anchor="middle" transform="rotate(-35 ${originX + c * cell + cell / 2} ${originY - 8})">${escapeXml(colNode.label)}</text>`;
  });
  const height = originY + n * cell + 10;
  return { heightPx: height, html: `<svg width="${widthPx}" height="${height}" viewBox="0 0 ${widthPx} ${height}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>` };
}

function chord(nodes, links, widthPx) {
  const size = Math.min(widthPx, 420);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 40;
  const weight = degreeWeight(nodes, links);
  const total = Math.max(1, [...weight.values()].reduce((a, b) => a + b, 0));
  let angle = -Math.PI / 2;
  const arcs = new Map();
  let svg = "";
  nodes.forEach((node, i) => {
    const span = ((weight.get(node.id) || 1) / total) * Math.PI * 2;
    const mid = angle + span / 2;
    arcs.set(node.id, { start: angle, end: angle + span, mid });
    const x0 = cx + r * Math.cos(angle), y0 = cy + r * Math.sin(angle);
    const x1 = cx + r * Math.cos(angle + span), y1 = cy + r * Math.sin(angle + span);
    const largeArc = span > Math.PI ? 1 : 0;
    svg += `<path d="M ${x0} ${y0} A ${r} ${r} 0 ${largeArc} 1 ${x1} ${y1}" fill="none" stroke="${colorForIndex(i)}" stroke-width="14" stroke-linecap="round" />`;
    const lx = cx + (r + 22) * Math.cos(mid), ly = cy + (r + 22) * Math.sin(mid);
    svg += textEl(lx, ly + 4, node.label, { size: 11, anchor: mid > Math.PI / 2 && mid < (3 * Math.PI) / 2 ? "end" : "start", color: "var(--text-strong)" });
    angle += span;
  });
  links.forEach((l) => {
    const a = arcs.get(l.source);
    const b = arcs.get(l.target);
    if (!a || !b) return;
    const ax = cx + (r - 16) * Math.cos(a.mid), ay = cy + (r - 16) * Math.sin(a.mid);
    const bx = cx + (r - 16) * Math.cos(b.mid), by = cy + (r - 16) * Math.sin(b.mid);
    svg += `<path d="M ${ax} ${ay} Q ${cx} ${cy}, ${bx} ${by}" fill="none" stroke="var(--ink-300)" stroke-width="${Math.max(1, ((l.value || 1) / total) * 60)}" opacity="0.5" />`;
  });
  return { heightPx: size, html: `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>` };
}

export default function renderRelationship(module, { widthPx } = {}) {
  const variant = module.variant || "network";
  const { nodes, links } = module;
  switch (variant) {
    case "sankey":
      return sankey(nodes, links, widthPx);
    case "bubble":
      return network(nodes, links, widthPx, { sizeByDegree: true });
    case "correlation-matrix":
      return correlationMatrix(nodes, links, widthPx);
    case "chord":
      return chord(nodes, links, widthPx);
    case "network":
    default:
      return network(nodes, links, widthPx);
  }
}
