// Adapta el campo `chart` del Deck Spec (core/schemas/deck-spec.schema.json#/$defs/chart)
// al motor de gráficas ya existente para Infografías (renderers/html/charts/,
// MODULE_CHARTS) en vez de escribir un segundo motor SVG — mismo principio de
// paleta/tipografía, mismo look, cero código de dibujo nuevo.
// planning/09-visual-richness-and-content-density.md Fase 1.
import { MODULE_CHARTS } from "./charts/index.mjs";

const CHART_TYPE_TO_MODULE = {
  "bar-horizontal": { type: "comparison", variant: "bars-horizontal" },
  "bar-vertical": { type: "comparison", variant: "bars-vertical" },
  line: { type: "trend", variant: "line" },
  area: { type: "trend", variant: "area" },
  donut: { type: "composition", variant: "donut" },
  scatter: { type: "distribution", variant: "scatter" },
  radar: { type: "strategy", variant: "radar" },
  // Fase 2 (planning/09 adenda): sin equivalente nativo en pptxgenjs, pero el
  // motor SVG de la Infografía ya sabe dibujarlos — mismo principio de reuso.
  "matrix-2x2": { type: "strategy", variant: "matrix-2x2" },
  funnel: { type: "process", variant: "funnel" },
  hierarchy: { type: "hierarchy", variant: "orgchart" },
  network: { type: "relationship", variant: "network" },
  treemap: { type: "composition", variant: "treemap" },
  pyramid: { type: "hierarchy", variant: "pyramid" },
  venn: { type: "strategy", variant: "venn" },
};

// Charts circulares (donut/radar): su alto natural depende de su ANCHO (ver
// charts/composition.mjs#ringChart, charts/strategy.mjs#radar — ninguno
// acepta un alto directamente), así que quedan "letterboxed" — un cuadro
// ancho-y-bajo solo produce un círculo tan grande como la dimensión más
// chica. Antes se les daba un ancho fijo de 640px sin mirar la altura
// disponible, lo que además los recortaba muy por debajo de su propio tope
// (ver charts/strategy.mjs: a 640px de ancho el radar cae al piso de 360px
// en vez de su tope de 560px) — de ahí la queja de "se ven muy chiquitas".
// Con `capHeightPx`, se les da un ancho ~igual al alto disponible (probamos
// "cuadrado"); si el resultado real no calza exacto, renderFittedChartBlock
// sigue siendo la red de seguridad que lo ajusta al presupuesto real.
const NARROW_CHART_TYPES = new Set(["donut", "radar", "matrix-2x2", "network", "venn"]);

export function chartWidthPx(chart, fullWidthPx, capHeightPx) {
  if (!NARROW_CHART_TYPES.has(chart.type)) return fullWidthPx;
  return Math.min(fullWidthPx, capHeightPx ?? fullWidthPx);
}

// El módulo 'hierarchy/pyramid' espera un árbol (module.root) y agrupa las
// etiquetas por profundidad — un chart{type:pyramid} de Deck Spec es en
// cambio una lista PLANA y ya ordenada (items[0]=cúspide/angosto...
// items[N-1]=base/ancho). Encadenar cada ítem como hijo único del anterior
// reproduce exactamente ese orden como profundidades 0..N-1 sin tocar
// hierarchies.mjs — cada nivel queda con un solo nodo, nunca varios a la vez.
function chainTree(items) {
  let node = { label: items[items.length - 1].label };
  for (let i = items.length - 2; i >= 0; i--) node = { label: items[i].label, children: [node] };
  return node;
}

export function renderChartBlock(chart, { widthPx, repoRoot }) {
  const mapping = CHART_TYPE_TO_MODULE[chart.type];
  if (!mapping) throw new Error(`chart-block: tipo de chart no soportado '${chart.type}'`);

  const module = { id: "chart", type: mapping.type, variant: mapping.variant, title: chart.title };
  if (chart.categories) module.categories = chart.categories;
  if (chart.series) module.series = chart.series;
  if (chart.points) module.points = chart.points;
  if (chart.axes) module.axes = chart.axes;
  if (chart.nodes) module.nodes = chart.nodes;
  if (chart.links) module.links = chart.links;
  if (chart.items) {
    if (chart.type === "radar") {
      // El módulo 'strategy/radar' espera matrixItem{label,x,y} (comparte
      // forma con matrix-2x2/bcg); un radar de Deck Spec es de un solo eje de
      // valor por ítem, así que x queda en 0 (no se usa para radar).
      module.items = chart.items.map((it) => ({ label: it.label, x: 0, y: it.value }));
    } else if (chart.type === "funnel") {
      // El módulo 'process' espera `steps`, no `items` — misma forma
      // {label, value?}, solo cambia el nombre del campo.
      module.steps = chart.items;
    } else if (chart.type === "pyramid") {
      module.root = chainTree(chart.items);
    } else {
      module.items = chart.items;
    }
  }
  if (chart.tree) module.root = chart.tree;

  return MODULE_CHARTS[mapping.type](module, { widthPx, repoRoot });
}

// Los charts de charts/*.mjs no aceptan un presupuesto de alto — cada familia
// calcula su propio heightPx "natural" (fijo o según cantidad de categorías/
// ancho). Sin esto, un chart alto (radar, area con leyenda) empuja el resto
// del contenido fuera de contentBand() y se solapa con el pie de página —
// exactamente el bug reportado 2026-08-31. En vez de tocar cada familia de
// charts/*.mjs (7 archivos, riesgo de romper la Infografía que sí los mide
// bien hoy), se envuelve el resultado ya renderizado en un contenedor que lo
// escala uniformemente (mismo aspecto, nunca se recorta) para que quepa en
// `capHeightPx` — el ancho visual final se reduce en la misma proporción.
export function renderFittedChartBlock(chart, { widthPx, repoRoot }, capHeightPx) {
  const natural = renderChartBlock(chart, { widthPx, repoRoot });
  if (!capHeightPx || natural.heightPx <= capHeightPx) return { ...natural, widthPx };
  const scale = capHeightPx / natural.heightPx;
  const html = `<div style="width:${widthPx}px;height:${natural.heightPx}px;transform:scale(${scale});transform-origin:top left;">${natural.html}</div>`;
  return { heightPx: capHeightPx, widthPx: Math.round(widthPx * scale), html };
}
