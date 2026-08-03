// Familia "Comparación" (guidelines/infografias.md §4). module.categories +
// module.series (core/schemas/infografia-spec.schema.json#/$defs/categoricalSeries).
import { scaleLinear, scaleBand, textEl, lineEl, rectEl, circleEl, colorForIndex, svgWrap, legendRow, formatNumber, gridlinesY } from "./chart-kit.mjs";

const ROW_HEIGHT = 34;
const ROW_GAP = 14;
const LABEL_RESERVE = 190;
const VALUE_GUTTER = 56;

function maxAbsValue(series) {
  return Math.max(1, ...series.flatMap((s) => s.values.map((v) => Math.abs(v))));
}

function horizontalBars(module, widthPx, { grouped = false, stacked = false, divergent = false, sortDesc = false } = {}) {
  const { categories, series } = module;
  const order = sortDesc
    ? [...categories].sort((a, b) => series[0].values[categories.indexOf(b)] - series[0].values[categories.indexOf(a)])
    : categories;

  const chartX0 = LABEL_RESERVE;
  const chartX1 = widthPx - VALUE_GUTTER;
  const rowH = ROW_HEIGHT * (grouped ? series.length : 1) + (grouped ? (series.length - 1) * 3 : 0);
  const totalH = order.length * (rowH + ROW_GAP);

  const max = divergent ? maxAbsValue(series) : Math.max(1, ...series.flatMap((s) => s.values));
  const zeroX = divergent ? chartX0 + (chartX1 - chartX0) / 2 : chartX0;
  const scale = divergent
    ? scaleLinear([0, max], [0, (chartX1 - chartX0) / 2])
    : scaleLinear([0, max], [0, chartX1 - chartX0]);

  let svg = "";
  if (!divergent) svg += lineEl(chartX0, 4, chartX0, totalH - ROW_GAP + 4, { color: "var(--border-subtle)" });
  else svg += lineEl(zeroX, 4, zeroX, totalH - ROW_GAP + 4, { color: "var(--border-subtle)" });

  order.forEach((cat, i) => {
    const rowY = i * (rowH + ROW_GAP);
    svg += textEl(chartX0 - 16, rowY + rowH / 2 + 5, cat, { size: 15, anchor: "end", weight: 500, color: "var(--text-strong)" });

    series.forEach((s, si) => {
      const v = s.values[categories.indexOf(cat)];
      const barY = rowY + (grouped ? si * (ROW_HEIGHT + 3) : 0);
      const barH = grouped ? ROW_HEIGHT - 6 : ROW_HEIGHT - 6;
      if (divergent) {
        const w = scale(Math.abs(v));
        const x = v >= 0 ? zeroX : zeroX - w;
        svg += rectEl(x, barY, w, barH, { fill: colorForIndex(si) });
      } else {
        const w = scale(v);
        svg += rectEl(chartX0, barY, w, barH, { fill: colorForIndex(si) });
        svg += textEl(chartX0 + w + 10, barY + barH / 2 + 5, `${formatNumber(v)}`, { size: 13, color: "var(--text-muted)" });
      }
    });
  });

  return { heightPx: Math.max(0, totalH - ROW_GAP), svg, widthPx };
}

function verticalBars(module, widthPx, { grouped = false, stacked = false } = {}) {
  const { categories, series } = module;
  const chartH = 240;
  const chartY0 = chartH;
  const chartY1 = 0;
  const bandScale = scaleBand(categories, [LABEL_RESERVE - 150, widthPx], 0.4);
  const max = stacked
    ? Math.max(1, ...categories.map((_, ci) => series.reduce((sum, s) => sum + s.values[ci], 0)))
    : Math.max(1, ...series.flatMap((s) => s.values));
  const scale = scaleLinear([0, max], [0, chartH]);

  let svg = gridlinesY({ x0: LABEL_RESERVE - 150, x1: widthPx, y0: chartH, y1: 0, maxValue: max });
  svg += lineEl(LABEL_RESERVE - 150, chartH, widthPx, chartH, { color: "var(--ink-300)" });

  categories.forEach((cat, ci) => {
    const groupX = bandScale.x(cat);
    const subWidth = grouped ? bandScale.bandwidth / series.length : bandScale.bandwidth;
    let stackBase = 0;
    series.forEach((s, si) => {
      const v = s.values[ci];
      const h = scale(v);
      const x = grouped ? groupX + si * subWidth : groupX;
      const y = stacked ? chartH - scale(stackBase) - h : chartH - h;
      svg += rectEl(x + 2, y, Math.max(2, subWidth - 4), h, { fill: colorForIndex(si) });
      stackBase += v;
    });
    svg += textEl(groupX + bandScale.bandwidth / 2, chartH + 22, cat, { size: 13, anchor: "middle", color: "var(--text-body)" });
  });

  return { heightPx: chartH + 40, svg, widthPx };
}

function lollipop(module, widthPx) {
  const { categories, series } = module;
  const s = series[0];
  const chartX0 = LABEL_RESERVE;
  const chartX1 = widthPx - VALUE_GUTTER;
  const max = Math.max(1, ...s.values);
  const scale = scaleLinear([0, max], [0, chartX1 - chartX0]);
  const totalH = categories.length * (ROW_HEIGHT + ROW_GAP);
  let svg = "";
  categories.forEach((cat, i) => {
    const y = i * (ROW_HEIGHT + ROW_GAP) + ROW_HEIGHT / 2;
    const v = s.values[i];
    const x = chartX0 + scale(v);
    svg += textEl(chartX0 - 16, y + 5, cat, { size: 15, anchor: "end", weight: 500, color: "var(--text-strong)" });
    svg += lineEl(chartX0, y, x, y, { color: "var(--accent-300)", width: 3 });
    svg += circleEl(x, y, 7, { fill: "var(--accent)" });
    svg += textEl(x + 14, y + 5, formatNumber(v), { size: 13, color: "var(--text-muted)" });
  });
  return { heightPx: totalH - ROW_GAP, svg, widthPx };
}

function dumbbell(module, widthPx) {
  const { categories, series } = module;
  const [a, b] = series;
  const max = Math.max(1, ...a.values, ...(b ? b.values : []));
  const chartX0 = LABEL_RESERVE;
  const chartX1 = widthPx - VALUE_GUTTER;
  const scale = scaleLinear([0, max], [0, chartX1 - chartX0]);
  const totalH = categories.length * (ROW_HEIGHT + ROW_GAP);
  let svg = "";
  categories.forEach((cat, i) => {
    const y = i * (ROW_HEIGHT + ROW_GAP) + ROW_HEIGHT / 2;
    const xa = chartX0 + scale(a.values[i]);
    const xb = b ? chartX0 + scale(b.values[i]) : xa;
    svg += textEl(chartX0 - 16, y + 5, cat, { size: 15, anchor: "end", weight: 500, color: "var(--text-strong)" });
    svg += lineEl(Math.min(xa, xb), y, Math.max(xa, xb), y, { color: "var(--ink-300)", width: 3 });
    svg += circleEl(xa, y, 7, { fill: colorForIndex(0) });
    if (b) svg += circleEl(xb, y, 7, { fill: colorForIndex(1) });
  });
  return { heightPx: totalH - ROW_GAP, svg, widthPx };
}

function bullet(module, widthPx) {
  const { categories, series } = module;
  const actual = series[0];
  const target = series[1];
  const chartX0 = LABEL_RESERVE;
  const chartX1 = widthPx - VALUE_GUTTER;
  const max = Math.max(1, ...actual.values, ...(target ? target.values : []));
  const scale = scaleLinear([0, max], [0, chartX1 - chartX0]);
  const totalH = categories.length * (ROW_HEIGHT + ROW_GAP);
  let svg = "";
  categories.forEach((cat, i) => {
    const rowY = i * (ROW_HEIGHT + ROW_GAP);
    svg += textEl(chartX0 - 16, rowY + ROW_HEIGHT / 2 + 5, cat, { size: 15, anchor: "end", weight: 500, color: "var(--text-strong)" });
    svg += rectEl(chartX0, rowY + 6, chartX1 - chartX0, ROW_HEIGHT - 12, { fill: "var(--accent-100)", rx: 3 });
    svg += rectEl(chartX0, rowY + 10, scale(actual.values[i]), ROW_HEIGHT - 20, { fill: "var(--accent)", rx: 2 });
    if (target) {
      const tx = chartX0 + scale(target.values[i]);
      svg += lineEl(tx, rowY, tx, rowY + ROW_HEIGHT, { color: "var(--accent-dark)", width: 3 });
    }
  });
  return { heightPx: totalH - ROW_GAP, svg, widthPx };
}

export default function renderComparison(module, { widthPx, repoRoot } = {}) {
  const variant = module.variant || "bars-horizontal";
  let result;
  switch (variant) {
    case "ranking":
      result = horizontalBars(module, widthPx, { sortDesc: true });
      break;
    case "grouped":
      result = verticalBars(module, widthPx, { grouped: true });
      break;
    case "stacked":
      result = verticalBars(module, widthPx, { stacked: true });
      break;
    case "divergent":
      result = horizontalBars(module, widthPx, { divergent: true });
      break;
    case "lollipop":
      result = lollipop(module, widthPx);
      break;
    case "dumbbell":
      result = dumbbell(module, widthPx);
      break;
    case "bullet":
      result = bullet(module, widthPx);
      break;
    case "bars-vertical":
      result = verticalBars(module, widthPx);
      break;
    case "bars-horizontal":
    default:
      result = horizontalBars(module, widthPx);
      break;
  }

  const showLegend = module.series.length > 1 && !["lollipop", "bullet"].includes(variant);
  const legendHtml = showLegend ? legendRow(module.series.map((s) => s.name)) : "";
  const legendHeight = showLegend ? 32 : 0;

  const html = `<div style="width:${widthPx}px">${svgWrap(widthPx, result.heightPx, result.svg)}${legendHtml ? `<div style="margin-top:8px">${legendHtml}</div>` : ""}</div>`;
  return { heightPx: result.heightPx + legendHeight, html };
}
