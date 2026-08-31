// Regla determinista: en un chart categórico (bar-horizontal/vertical, line,
// area) cada series[].values debe tener la misma longitud que categories —
// si no, el renderer alinea mal las barras/puntos en silencio en vez de
// fallar. JSON Schema no puede expresar "dos arrays de igual longitud", por
// eso vive aquí en vez de en core/schemas/deck-spec.schema.json.

const CATEGORICAL_TYPES = new Set(["bar-horizontal", "bar-vertical", "line", "area"]);

export function checkChartData(deck, _ctx, reportsById) {
  for (const slide of deck.slides) {
    const chart = slide.chart;
    if (!chart || !CATEGORICAL_TYPES.has(chart.type)) continue;
    const r = reportsById.get(slide.id);
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
  }
}
