// Diagramas Fase 2 (planning/09-visual-richness-and-content-density.md
// adenda) sin equivalente nativo en pptxgenjs (a diferencia de bar/line/donut/
// etc., ver chart-block.mjs) — se dibujan con formas (addShape/addText),
// mismo principio que ya usa renderers/pptx/layouts/process.mjs para sus
// flechas y círculos numerados. Reutiliza el layout PURO ya escrito para la
// Infografía (tree-layout.mjs, wrapText) en vez de reinventarlo; solo el
// paso de dibujo es distinto (formas de pptxgenjs en vez de SVG).
import { wrapText } from "../html/charts/chart-kit.mjs";
import { layoutTree } from "../html/charts/tree-layout.mjs";

function accentRamp(colors) {
  return [colors.accentDark, colors.accent, colors.accentMid, colors.ink500];
}

// Línea recta entre dos puntos arbitrarios — pptxgenjs dibuja su shape "line"
// siempre dentro de una caja (x,y,w,h) de esquina a esquina; `flipV` decide
// si va de arriba-izq a abajo-der o de abajo-izq a arriba-der. Sin esto, una
// línea diagonal "hacia atrás" (x2<x1) sale espejada.
function addConnector(pptxSlide, x1, y1, x2, y2, line) {
  const x = Math.min(x1, x2),
    y = Math.min(y1, y2);
  const w = Math.max(Math.abs(x2 - x1), 0.001),
    h = Math.max(Math.abs(y2 - y1), 0.001);
  const flipV = (x1 - x2) * (y1 - y2) < 0;
  pptxSlide.addShape("line", { x, y, w, h, flipV, line });
}

// chart{type:funnel} — mismo algoritmo que renderers/html/charts/processes.mjs#funnel:
// N etapas apiladas, ancho proporcional a value (o al orden si no hay value),
// centradas horizontalmente.
export function drawFunnel(pptxSlide, items, { x, y, w, h, colors }) {
  const ramp = accentRamp(colors);
  const n = items.length;
  const gap = 0.05;
  const rowH = Math.max(0.3, (h - gap * (n - 1)) / n);
  const values = items.map((it, i) => (it.value != null ? it.value : n - i));
  const max = Math.max(...values);
  items.forEach((it, i) => {
    const rowW = Math.max(w * 0.22, (values[i] / max) * w);
    const rowX = x + (w - rowW) / 2;
    const rowY = y + i * (rowH + gap);
    pptxSlide.addShape("rect", { x: rowX, y: rowY, w: rowW, h: rowH, fill: { color: ramp[i % ramp.length] }, line: { type: "none" } });
    const label = it.value != null ? `${it.label} · ${it.value}` : it.label;
    pptxSlide.addText(label, {
      x: rowX + 0.05,
      y: rowY,
      w: rowW - 0.1,
      h: rowH,
      fontFace: "Libre Franklin",
      fontSize: 12,
      bold: true,
      color: colors.paper,
      align: "center",
      valign: "middle",
      fit: "shrink",
    });
  });
}

// chart{type:matrix-2x2} — mismo algoritmo que renderers/html/charts/strategy.mjs#quadrantGrid
// (variante 'matrix-2x2' plana, sin sombreado de cuadrante): marco cuadrado +
// cruz + un punto por ítem, normalizado a partir de min/max reales de x/y.
export function drawMatrix2x2(pptxSlide, items, axes, { x, y, w, h, colors }) {
  const size = Math.min(w, h);
  const sx = x + (w - size) / 2;
  const sy = y + (h - size) / 2;

  pptxSlide.addShape("rect", { x: sx, y: sy, w: size, h: size, fill: { type: "none" }, line: { color: colors.ink200, width: 1.25 } });
  addConnector(pptxSlide, sx + size / 2, sy, sx + size / 2, sy + size, { color: colors.ink200, width: 1 });
  addConnector(pptxSlide, sx, sy + size / 2, sx + size, sy + size / 2, { color: colors.ink200, width: 1 });

  const xs = items.map((it) => it.x),
    ys = items.map((it) => it.y);
  const minX = Math.min(...xs, 0),
    maxX = Math.max(...xs, 1);
  const minY = Math.min(...ys, 0),
    maxY = Math.max(...ys, 1);
  const ramp = accentRamp(colors);
  const r = Math.min(0.09, size / 24);
  items.forEach((it, i) => {
    const px = sx + ((it.x - minX) / (maxX - minX || 1)) * size;
    const py = sy + size - ((it.y - minY) / (maxY - minY || 1)) * size;
    pptxSlide.addShape("ellipse", { x: px - r, y: py - r, w: r * 2, h: r * 2, fill: { color: ramp[i % ramp.length] }, line: { color: colors.paper, width: 1.5 } });
    pptxSlide.addText(it.label, {
      x: px - 0.9,
      y: py - r - 0.3,
      w: 1.8,
      h: 0.26,
      fontFace: "Libre Franklin",
      fontSize: 10,
      bold: true,
      color: colors.ink700,
      align: "center",
      valign: "bottom",
    });
  });

  if (axes?.xLabel) {
    pptxSlide.addText(axes.xLabel, { x: sx, y: sy + size + 0.04, w: size, h: 0.24, fontFace: "Libre Franklin", fontSize: 11, bold: true, color: colors.ink700, align: "center" });
  }
  if (axes?.yLabel) {
    pptxSlide.addText(axes.yLabel, {
      x: sx - 0.55,
      y: sy + size / 2 - 0.5,
      w: 1,
      h: 0.24,
      fontFace: "Libre Franklin",
      fontSize: 11,
      bold: true,
      color: colors.ink700,
      align: "center",
      rotate: 270,
    });
  }
}

// chart{type:hierarchy} — reutiliza layoutTree() (mismo cálculo de posiciones
// que renderers/html/charts/hierarchies.mjs#verticalTree), pero dibuja con
// rect+línea+texto de pptxgenjs en vez de SVG.
export function drawHierarchy(pptxSlide, root, { x, y, w, h, colors }) {
  const { nodes, edges, leafCount } = layoutTree(root);
  const maxDepth = Math.max(...nodes.map((n) => n.depth));
  const colWidth = w / leafCount;
  const nodeWidth = Math.max(0.9, Math.min(colWidth - 0.15, 2.2));
  const ramp = accentRamp(colors);
  const rowGap = 0.35;

  // wrapText mide en píxeles (heurística de renderers/html/text-measure.mjs);
  // se usa aquí solo para decidir en cuántas líneas parte una etiqueta, no
  // para una medida exacta en pulgadas — ponytail: aproximación suficiente
  // para evitar una sola línea desbordando la caja, no pixel-perfect.
  for (const n of nodes) {
    n.lines = wrapText(n.label, (nodeWidth - 0.15) * 96, { sizePx: 12, weight: 700 });
    n.heightIn = Math.max(0.35, n.lines.length * 0.19 + 0.14);
  }
  const rowHeight = [];
  for (let d = 0; d <= maxDepth; d++) rowHeight[d] = Math.max(...nodes.filter((n) => n.depth === d).map((n) => n.heightIn));
  const rowTop = [0];
  for (let d = 1; d <= maxDepth; d++) rowTop[d] = rowTop[d - 1] + rowHeight[d - 1] + rowGap;
  const totalHeight = rowTop[maxDepth] + rowHeight[maxDepth];
  // Si el árbol (con su gap fijo entre niveles) no cabe en `h`, se escala
  // verticalmente en vez de desbordar — mismo espíritu que renderFittedChartBlock
  // del lado HTML, aplicado aquí directo en pulgadas.
  const scaleY = totalHeight > h ? h / totalHeight : 1;

  const px = (n) => x + n.x * colWidth + colWidth / 2;
  const py = (n) => y + (rowTop[n.depth] + rowHeight[n.depth] / 2) * scaleY;

  edges.forEach(([a, b]) => {
    const pa = nodes[a],
      pb = nodes[b];
    const y1 = py(pa) + (pa.heightIn * scaleY) / 2;
    const y2 = py(pb) - (pb.heightIn * scaleY) / 2;
    addConnector(pptxSlide, px(pa), y1, px(pb), y2, { color: colors.ink200, width: 1.25 });
  });

  nodes.forEach((n) => {
    const nodeH = n.heightIn * scaleY;
    const nodeX = px(n) - nodeWidth / 2;
    const nodeY = py(n) - nodeH / 2;
    pptxSlide.addShape("roundRect", { x: nodeX, y: nodeY, w: nodeWidth, h: nodeH, rectRadius: 0.06, fill: { color: ramp[n.depth % ramp.length] }, line: { type: "none" } });
    pptxSlide.addText(n.lines.join("\n"), {
      x: nodeX + 0.05,
      y: nodeY,
      w: nodeWidth - 0.1,
      h: nodeH,
      fontFace: "Libre Franklin",
      fontSize: 11,
      bold: true,
      color: colors.paper,
      align: "center",
      valign: "middle",
      fit: "shrink",
    });
  });
}

// chart{type:network} — mismo algoritmo que renderers/html/charts/relationships.mjs#network:
// layout circular simple (sin simulación de fuerzas), grosor de línea según
// peso del enlace. Un hub-and-spoke es solo un caso particular de los datos
// (un nodo con enlaces a todos los demás), no una variante de dibujo distinta.
export function drawNetwork(pptxSlide, nodesIn, links, { x, y, w, h, colors }) {
  const size = Math.min(w, h);
  const cx = x + w / 2,
    cy = y + h / 2;
  const r = Math.max(0.4, size / 2 - 0.55); // 0.55in reservados para las etiquetas fuera del círculo
  const n = nodesIn.length;
  const positioned = nodesIn.map((node, i) => {
    const angle = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return { ...node, px: cx + r * Math.cos(angle), py: cy + r * Math.sin(angle) };
  });
  const byId = new Map(positioned.map((nd) => [nd.id, nd]));

  const weight = new Map(nodesIn.map((nd) => [nd.id, 0]));
  links.forEach((l) => {
    weight.set(l.source, (weight.get(l.source) || 0) + (l.value || 1));
    weight.set(l.target, (weight.get(l.target) || 0) + (l.value || 1));
  });
  const maxW = Math.max(1, ...weight.values());
  links.forEach((l) => {
    const a = byId.get(l.source),
      b = byId.get(l.target);
    if (!a || !b) return;
    addConnector(pptxSlide, a.px, a.py, b.px, b.py, { color: colors.accentMid, width: Math.max(0.75, ((l.value || 1) / maxW) * 3) });
  });

  const ramp = accentRamp(colors);
  const nodeR = 0.16;
  positioned.forEach((node, i) => {
    pptxSlide.addShape("ellipse", { x: node.px - nodeR, y: node.py - nodeR, w: nodeR * 2, h: nodeR * 2, fill: { color: ramp[i % ramp.length] }, line: { color: colors.paper, width: 1.5 } });
    const labelY = node.py > cy + 0.05 ? node.py + nodeR + 0.03 : node.py - nodeR - 0.28;
    pptxSlide.addText(node.label, {
      x: node.px - 0.9,
      y: labelY,
      w: 1.8,
      h: 0.25,
      fontFace: "Libre Franklin",
      fontSize: 10,
      bold: true,
      color: colors.ink700,
      align: "center",
    });
  });
}

// chart{type:treemap} — mismo algoritmo que renderers/html/charts/composition.mjs#treemap
// (simplificado a una sola fila: no hay una segunda dimensión categórica en
// `items` para cruzar, mismo motivo documentado ahí para la Infografía).
export function drawTreemap(pptxSlide, items, { x, y, w, h, colors }) {
  const total = items.reduce((sum, it) => sum + it.value, 0) || 1;
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const ramp = accentRamp(colors);
  let curX = x;
  sorted.forEach((it, i) => {
    const itemW = Math.max(0.12, (it.value / total) * w);
    pptxSlide.addShape("rect", { x: curX, y, w: itemW, h, fill: { color: ramp[i % ramp.length] }, line: { color: colors.paper, width: 1.5 } });
    if (itemW > 0.65) {
      pptxSlide.addText(`${it.label}\n${Math.round((it.value / total) * 100)}%`, {
        x: curX + 0.08,
        y: y + 0.08,
        w: itemW - 0.16,
        h: h - 0.16,
        fontFace: "Libre Franklin",
        fontSize: 12,
        bold: true,
        color: colors.paper,
        align: "left",
        valign: "top",
        fit: "shrink",
      });
    }
    curX += itemW;
  });
}

// chart{type:pyramid} — mismo espíritu que drawFunnel pero invertido: items[0]
// es la cúspide (más angosta), items[n-1] es la base (más ancha). A diferencia
// del lado HTML (que reutiliza hierarchies.mjs#pyramid encadenando `items` en
// un árbol de un solo hijo — ver chart-block.mjs#chainTree), acá no hace
// falta ese rodeo: se dibuja directo sobre la lista plana.
export function drawPyramid(pptxSlide, items, { x, y, w, h, colors }) {
  const ramp = accentRamp(colors);
  const n = items.length;
  const gap = 0.05;
  const rowH = Math.max(0.3, (h - gap * (n - 1)) / n);
  items.forEach((it, i) => {
    const rowW = Math.max(w * 0.18, w * ((i + 1) / n));
    const rowX = x + (w - rowW) / 2;
    const rowY = y + i * (rowH + gap);
    pptxSlide.addShape("rect", { x: rowX, y: rowY, w: rowW, h: rowH, fill: { color: ramp[i % ramp.length] }, line: { type: "none" } });
    pptxSlide.addText(it.label, {
      x: rowX + 0.05,
      y: rowY,
      w: rowW - 0.1,
      h: rowH,
      fontFace: "Libre Franklin",
      fontSize: 12,
      bold: true,
      color: colors.paper,
      align: "center",
      valign: "middle",
      fit: "shrink",
    });
  });
}

// chart{type:venn} — mismo algoritmo que renderers/html/charts/strategy.mjs#venn
// (2 o 3 conjuntos, posiciones fijas — más de 3 ya no se valida, ver
// validators/rules/chart-data.mjs). Círculos translúcidos superpuestos.
export function drawVenn(pptxSlide, items, { x, y, w, h, colors }) {
  const size = Math.min(w, h);
  const cx = x + w / 2,
    cy = y + h / 2;
  const r = size / 3.2;
  const ramp = accentRamp(colors);
  const positions =
    items.length === 2
      ? [
          { px: cx - r * 0.55, py: cy },
          { px: cx + r * 0.55, py: cy },
        ]
      : [
          { px: cx - r * 0.6, py: cy - r * 0.4 },
          { px: cx + r * 0.6, py: cy - r * 0.4 },
          { px: cx, py: cy + r * 0.5 },
        ];
  items.forEach((it, i) => {
    const p = positions[i];
    pptxSlide.addShape("ellipse", { x: p.px - r, y: p.py - r, w: r * 2, h: r * 2, fill: { color: ramp[i % ramp.length], transparency: 55 }, line: { color: ramp[i % ramp.length], width: 1.5 } });
  });
  items.forEach((it, i) => {
    const p = positions[i];
    const labelY = items.length === 3 && i === 2 ? p.py + r + 0.06 : p.py - r - 0.3;
    pptxSlide.addText(it.label, {
      x: p.px - 0.9,
      y: labelY,
      w: 1.8,
      h: 0.26,
      fontFace: "Libre Franklin",
      fontSize: 11,
      bold: true,
      color: colors.ink700,
      align: "center",
    });
  });
}
