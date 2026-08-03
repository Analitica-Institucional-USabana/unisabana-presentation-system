// Familia "Jerarquías" (guidelines/infografias.md §4). module.root
// (core/schemas/infografia-spec.schema.json#/$defs/treeNode, recursivo).
import { colorForIndex, textEl } from "./chart-kit.mjs";

const LEVEL_HEIGHT = 90;
const NODE_W = 140;
const NODE_H = 46;

// Layout de árbol vertical simplificado: hojas repartidas en X en orden de
// aparición, cada padre centrado sobre el promedio de sus hijos.
function layoutTree(root) {
  const nodes = [];
  const edges = [];
  let leafCounter = 0;

  function visit(node, depth, parentId) {
    const id = nodes.length;
    const isLeaf = !node.children || node.children.length === 0;
    let x;
    if (isLeaf) {
      x = leafCounter;
      leafCounter += 1;
    }
    const entry = { id, label: node.label, depth, x: 0, childIds: [] };
    nodes.push(entry);
    if (parentId != null) {
      edges.push([parentId, id]);
      nodes[parentId].childIds.push(id);
    }
    if (isLeaf) {
      entry.x = x;
    } else {
      const childXs = node.children.map((child) => visit(child, depth + 1, id));
      entry.x = childXs.reduce((a, b) => a + b, 0) / childXs.length;
    }
    return entry.x;
  }
  visit(root, 0, null);
  return { nodes, edges, leafCount: Math.max(1, leafCounter) };
}

function verticalTree(root, widthPx) {
  const { nodes, edges, leafCount } = layoutTree(root);
  const maxDepth = Math.max(...nodes.map((n) => n.depth));
  const colWidth = widthPx / leafCount;
  const height = (maxDepth + 1) * LEVEL_HEIGHT;

  const px = (n) => n.x * colWidth + colWidth / 2;
  const py = (n) => n.depth * LEVEL_HEIGHT + NODE_H / 2 + 10;

  let svg = "";
  edges.forEach(([a, b]) => {
    const pa = nodes[a], pb = nodes[b];
    svg += `<line x1="${px(pa)}" y1="${py(pa) + NODE_H / 2}" x2="${px(pb)}" y2="${py(pb) - NODE_H / 2}" stroke="var(--ink-300)" stroke-width="2" />`;
  });
  nodes.forEach((n, i) => {
    const x = px(n) - NODE_W / 2;
    const y = py(n) - NODE_H / 2;
    svg += `<rect x="${x}" y="${y}" width="${NODE_W}" height="${NODE_H}" rx="8" fill="${colorForIndex(n.depth)}" />`;
    svg += textEl(px(n), py(n) + 5, n.label, { size: 13, anchor: "middle", weight: 700, color: "var(--paper)" });
  });
  return { heightPx: height, html: `<svg width="${widthPx}" height="${height}" viewBox="0 0 ${widthPx} ${height}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>` };
}

function mindmap(root, widthPx) {
  const size = Math.min(widthPx, 460);
  const cx = size / 2;
  const cy = size / 2;

  let svg = "";
  function visit(node, depth, angleStart, angleEnd, parentX, parentY) {
    const angle = (angleStart + angleEnd) / 2;
    const r = depth * 110;
    const x = depth === 0 ? cx : cx + r * Math.cos(angle);
    const y = depth === 0 ? cy : cy + r * Math.sin(angle);
    if (depth > 0) {
      svg += `<line x1="${parentX}" y1="${parentY}" x2="${x}" y2="${y}" stroke="var(--ink-300)" stroke-width="2" />`;
    }
    const rNode = depth === 0 ? 44 : 30;
    svg += `<circle cx="${x}" cy="${y}" r="${rNode}" fill="${colorForIndex(depth)}" />`;
    svg += textEl(x, y + 4, node.label, { size: depth === 0 ? 14 : 12, anchor: "middle", weight: 700, color: "var(--paper)" });
    const children = node.children || [];
    const span = angleEnd - angleStart;
    children.forEach((child, i) => {
      const childStart = angleStart + (span / children.length) * i;
      const childEnd = angleStart + (span / children.length) * (i + 1);
      visit(child, depth + 1, childStart, childEnd, x, y);
    });
  }
  visit(root, 0, 0, Math.PI * 2, cx, cy);
  return { heightPx: size, html: `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>` };
}

function pyramid(root, widthPx) {
  const levels = [];
  function visit(node, depth) {
    if (!levels[depth]) levels[depth] = [];
    levels[depth].push(node.label);
    (node.children || []).forEach((c) => visit(c, depth + 1));
  }
  visit(root, 0);
  const rowH = 64;
  const height = levels.length * (rowH + 6) - 6;
  let svg = "";
  levels.forEach((labels, depth) => {
    const w = widthPx * ((depth + 1) / levels.length);
    const x = (widthPx - w) / 2;
    const y = depth * (rowH + 6);
    svg += `<rect x="${x}" y="${y}" width="${w}" height="${rowH}" fill="${colorForIndex(depth)}" rx="4" />`;
    svg += textEl(widthPx / 2, y + rowH / 2 + 5, labels.join(" · "), { size: 14, anchor: "middle", weight: 700, color: "var(--paper)" });
  });
  return { heightPx: height, html: `<svg width="${widthPx}" height="${height}" viewBox="0 0 ${widthPx} ${height}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>` };
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
