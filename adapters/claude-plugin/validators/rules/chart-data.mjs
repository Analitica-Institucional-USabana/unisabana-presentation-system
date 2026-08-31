// Reglas deterministas sobre chart{} que JSON Schema no puede expresar:
// - categórico (bar/line/area): cada series[].values debe tener la misma
//   longitud que categories, si no el renderer alinea mal barras/puntos en
//   silencio.
// - `items` es un array compartido por 7 tipos distintos (donut/radar/
//   treemap/matrix-2x2/funnel/pyramid/venn) con requisitos de campo
//   distintos por tipo — el esquema solo exige `label`, aquí se exige el
//   resto según `type`.
// - network: cada link.source/target debe referenciar un nodes[].id real.

const CATEGORICAL_TYPES = new Set(["bar-horizontal", "bar-vertical", "line", "area"]);
const VALUE_ITEM_TYPES = new Set(["donut", "radar", "treemap"]);
const ORDERED_ITEM_TYPES = new Set(["funnel", "pyramid"]);

export function checkChartData(deck, _ctx, reportsById) {
  for (const slide of deck.slides) {
    const chart = slide.chart;
    if (!chart) continue;
    const r = reportsById.get(slide.id);

    if (CATEGORICAL_TYPES.has(chart.type)) {
      const nCategories = chart.categories.length;
      const badSeries = chart.series.filter((s) => s.values.length !== nCategories);
      if (badSeries.length) {
        r.add(
          "error",
          `chart: la(s) serie(s) ${badSeries.map((s) => `'${s.name}'`).join(", ")} tienen values.length distinto de categories.length (${nCategories}).`
        );
      } else {
        r.add("pass", `Chart '${chart.type}': series alineadas con categories (${nCategories}).`);
      }
    } else if (VALUE_ITEM_TYPES.has(chart.type)) {
      const missing = chart.items.filter((it) => typeof it.value !== "number");
      if (missing.length) {
        r.add("error", `chart '${chart.type}': item(s) sin 'value' numérico: ${missing.map((it) => `'${it.label}'`).join(", ")}.`);
      } else {
        r.add("pass", `Chart '${chart.type}': ${chart.items.length} ítem(s) con 'value'.`);
      }
    } else if (chart.type === "matrix-2x2") {
      const missing = chart.items.filter((it) => typeof it.x !== "number" || typeof it.y !== "number");
      if (missing.length) {
        r.add("error", `chart 'matrix-2x2': item(s) sin 'x'/'y' numéricos: ${missing.map((it) => `'${it.label}'`).join(", ")}.`);
      } else {
        r.add("pass", `Chart 'matrix-2x2': ${chart.items.length} ítem(s) posicionados.`);
      }
    } else if (ORDERED_ITEM_TYPES.has(chart.type)) {
      // `value` es opcional en funnel/pyramid (el orden del array ya define
      // la secuencia) — nada que validar más allá de lo que ya exige el esquema.
      r.add("pass", `Chart '${chart.type}': ${chart.items.length} nivel(es)/etapa(s).`);
    } else if (chart.type === "venn") {
      if (chart.items.length > 3) {
        r.add("error", `chart 'venn': ${chart.items.length} ítems — solo se soportan 2 o 3 conjuntos (más allá de eso la intersección deja de leerse).`);
      } else {
        r.add("pass", `Chart 'venn': ${chart.items.length} conjunto(s).`);
      }
    } else if (chart.type === "network") {
      const ids = new Set(chart.nodes.map((n) => n.id));
      const badLinks = chart.links.filter((l) => !ids.has(l.source) || !ids.has(l.target));
      if (badLinks.length) {
        r.add(
          "error",
          `chart 'network': ${badLinks.length} link(s) referencian un 'source'/'target' que no está en 'nodes' (ids válidos: ${[...ids].join(", ")}).`
        );
      } else {
        r.add("pass", `Chart 'network': ${chart.nodes.length} nodo(s), ${chart.links.length} enlace(s).`);
      }
    }
  }
}
