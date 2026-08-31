// Familia "Jerarquías" (guidelines/infografias.md §4). module.root
// (core/schemas/infografia-spec.schema.json#/$defs/treeNode, recursivo).
import { colorForIndex, svgWrap, wrapText, multilineTextEl } from "./chart-kit.mjs";
import { layoutTree } from "./tree-layout.mjs";

const NODE_GAP = 28;
const LINE_HEIGHT = 17;
const NODE_PAD_Y = 16;

function wrapLabel(label, maxWidthPx, sizePx = 13, weight = 700) {
  return wrapText(label, maxWidthPx, { sizePx, weight });
}

function multilineText(cx, cy, lines, { sizePx = 13, weight = 700, color = "var(--paper)" } = {}) {
  return multilineTextEl(cx, cy, lines, { size: sizePx, weight, color, lineHeight: LINE_HEIGHT });
}

function verticalTree(root, widthPx) {
  const { nodes, edges, leafCount } = layoutTree(root);
  const maxDepth = Math.max(...nodes.map((n) => n.depth));
  const colWidth = widthPx / leafCount;
  const nodeWidth = Math.max(110, Math.min(colWidth - NODE_GAP, 240));

  // Cada nodo envuelve su etiqueta y calcula su propia altura; cada nivel usa
  // la altura máxima de sus nodos para que todas las filas queden alineadas.
  for (const n of nodes) {
    n.lines = wrapLabel(n.label, nodeWidth - 20);
    n.height = n.lines.length * LINE_HEIGHT + NODE_PAD_Y;
  }
  const rowHeight = [];
  for (let d = 0; d <= maxDepth; d++) {
    rowHeight[d] = Math.max(...nodes.filter((n) => n.depth === d).map((n) => n.height));
  }
  const rowTop = [0];
  for (let d = 1; d <= maxDepth; d++) rowTop[d] = rowTop[d - 1] + rowHeight[d - 1] + 46;
  const height = rowTop[maxDepth] + rowHeight[maxDepth] + 10;

  const px = (n) => n.x * colWidth + colWidth / 2;
  const py = (n) => rowTop[n.depth] + rowHeight[n.depth] / 2 + 10;

  let svg = "";
  edges.forEach(([a, b]) => {
    const pa = nodes[a], pb = nodes[b];
    svg += `<line x1="${px(pa)}" y1="${py(pa) + pa.height / 2}" x2="${px(pb)}" y2="${py(pb) - pb.height / 2}" stroke="var(--ink-300)" stroke-width="2" />`;
  });
  nodes.forEach((n) => {
    const x = px(n) - nodeWidth / 2;
    const y = py(n) - n.height / 2;
    svg += `<rect x="${x}" y="${y}" width="${nodeWidth}" height="${n.height}" rx="8" fill="${colorForIndex(n.depth)}" />`;
    svg += multilineText(px(n), py(n), n.lines);
  });
  return { heightPx: height, html: svgWrap(widthPx, height, svg) };
}

function mindmap(root, widthPx) {
  const size = Math.max(420, Math.min(widthPx * 0.62, 620));
  const cx = size / 2;
  const cy = size / 2;

  let svg = "";
  function visit(node, depth, angleStart, angleEnd, parentX, parentY) {
    const angle = (angleStart + angleEnd) / 2;
    const r = depth * (size * 0.24);
    const x = depth === 0 ? cx : cx + r * Math.cos(angle);
    const y = depth === 0 ? cy : cy + r * Math.sin(angle);
    if (depth > 0) {
      svg += `<line x1="${parentX}" y1="${parentY}" x2="${x}" y2="${y}" stroke="var(--ink-300)" stroke-width="2" />`;
    }
    const rNode = depth === 0 ? 56 : 42;
    const lines = wrapLabel(node.label, rNode * 1.7, depth === 0 ? 14 : 12);
    svg += `<circle cx="${x}" cy="${y}" r="${rNode}" fill="${colorForIndex(depth)}" />`;
    svg += multilineText(x, y, lines, { sizePx: depth === 0 ? 14 : 12 });
    const children = node.children || [];
    const span = angleEnd - angleStart;
    children.forEach((child, i) => {
      const childStart = angleStart + (span / children.length) * i;
      const childEnd = angleStart + (span / children.length) * (i + 1);
      visit(child, depth + 1, childStart, childEnd, x, y);
    });
  }
  visit(root, 0, 0, Math.PI * 2, cx, cy);
  return { heightPx: size, html: `<div style="display:flex;justify-content:center;width:${widthPx}px">${svgWrap(size, size, svg)}</div>` };
}

function pyramid(root, widthPx) {
  const levels = [];
  function visit(node, depth) {
    if (!levels[depth]) levels[depth] = [];
    levels[depth].push(node.label);
    (node.children || []).forEach((c) => visit(c, depth + 1));
  }
  visit(root, 0);
  const rowH = 72;
  const height = levels.length * (rowH + 8) - 8;
  let svg = "";
  levels.forEach((labels, depth) => {
    const w = widthPx * ((depth + 1) / levels.length);
    const x = (widthPx - w) / 2;
    const y = depth * (rowH + 8);
    const lines = wrapLabel(labels.join(" · "), w - 40, 15);
    svg += `<rect x="${x}" y="${y}" width="${w}" height="${rowH}" fill="${colorForIndex(depth)}" rx="6" />`;
    svg += multilineText(widthPx / 2, y + rowH / 2, lines, { sizePx: 15 });
  });
  return { heightPx: height, html: svgWrap(widthPx, height, svg) };
}

export default function renderHierarchy(module, { widthPx } = {}) {
  const variant = module.variant || "tree";
  switch (variant) {
    case "mindmap":
      return mindmap(module.root, widthPx);
    case "pyramid":
      return pyramid(module.root, widthPx);
    case "orgchart":
    case "tree":
    default:
      return verticalTree(module.root, widthPx);
  }
}
