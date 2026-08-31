import { CANVAS, SAFE, BANNER_HEIGHT_PX, BANNER_GAP_PX, CHART_GAP_PX, contentBand, centeredContentY } from "../constants.mjs";
import { box, title, bodyText, banner } from "../elements.mjs";
import { estimateBlockHeightPx } from "../text-measure.mjs";
import { iconMarkup } from "../icons.mjs";
import { renderFittedChartBlock, chartWidthPx } from "../chart-block.mjs";

export default function renderMessage(slide, { repoRoot } = {}) {
  // Con un chart de por medio, el título/apoyo dejan de ser el protagonista
  // (esa es la responsabilidad del chart) — bajarles el tamaño no es un
  // recorte cosmético, es lo que le devuelve espacio real al chart. Sin esto,
  // un título a 56px de 2 líneas + apoyo se comía la banda entera y el chart
  // quedaba en ~100px de alto ("se ven muy chiquitas", 2026-08-31).
  const titleSizePx = slide.chart ? 38 : 56;
  const supportingSizePx = slide.chart ? 18 : 24;
  const gapPx = slide.chart ? 16 : 24;
  const titleHeight = estimateBlockHeightPx(slide.title, { sizePx: titleSizePx, widthPx: 1000, weight: "black" });
  // bodyText() aplica siempre line-height:var(--lh-body) = 1.55 (core/brand/tokens.css) — la medición debe usar el mismo valor.
  const supportingHeight = slide.supporting
    ? estimateBlockHeightPx(slide.supporting, { sizePx: supportingSizePx, widthPx: 900, weight: "regular", lineHeight: 1.55 })
    : 0;
  const bannerBlockHeight = slide.banner ? BANNER_GAP_PX + BANNER_HEIGHT_PX : 0;
  const availWidth = CANVAS.width - SAFE.left - SAFE.right;
  // El chart nunca puede empujar el contenido fuera de la banda disponible
  // (planning/09 adenda 2026-08-31) — se le da como presupuesto lo que sobre
  // después de título/apoyo/banner, nunca su alto "natural" sin más.
  const band = contentBand("content");
  // -20 de más: estimateBlockHeightPx es una heurística (recomendada por su
  // propio nombre), no una medida pixel-perfecta del texto ya renderizado —
  // sin este margen, un título/apoyo que envuelve una fracción de línea más
  // de lo estimado deja el chart 10-15px por debajo de contentBand().bottom.
  const MEASUREMENT_SLOP_PX = 20;
  const chartCapPx = slide.chart
    ? Math.max(120, band.bottom - band.top - titleHeight - gapPx - supportingHeight - (slide.supporting ? gapPx : 0) - bannerBlockHeight - CHART_GAP_PX - MEASUREMENT_SLOP_PX)
    : 0;
  const chartResult = slide.chart
    ? renderFittedChartBlock(slide.chart, { widthPx: chartWidthPx(slide.chart, availWidth, chartCapPx), repoRoot }, chartCapPx)
    : null;
  const chartBlockHeight = chartResult ? CHART_GAP_PX + chartResult.heightPx : 0;
  const contentHeight = titleHeight + gapPx + supportingHeight + bannerBlockHeight + chartBlockHeight;

  let y = centeredContentY("content", contentHeight);
  const boxes = [];
  boxes.push(title(slide.title, { x: SAFE.left, y, width: 1000, sizePx: titleSizePx }));
  y += titleHeight + gapPx;
  if (slide.supporting) {
    boxes.push(bodyText(slide.supporting, { x: SAFE.left, y, width: 900, sizePx: supportingSizePx }));
    y += supportingHeight + gapPx;
  }
  if (slide.banner) {
    const bannerWidth = availWidth;
    const iconHtml = slide.banner.icon ? iconMarkup(repoRoot, slide.banner.icon, { sizePx: 28 }) : undefined;
    boxes.push(banner({ ...slide.banner, iconHtml }, { x: SAFE.left, y, width: bannerWidth, height: BANNER_HEIGHT_PX }));
    y += BANNER_HEIGHT_PX;
  }
  if (chartResult) {
    y += CHART_GAP_PX;
    boxes.push(box({ x: SAFE.left + (availWidth - chartResult.widthPx) / 2, y, width: chartResult.widthPx, height: chartResult.heightPx, html: chartResult.html }));
  }
  const backgroundCss = slide.background === "tinted" ? "background:var(--surface-tint);" : "background:var(--bg-page);";
  return { tone: "light", backgroundCss, boxesHtml: boxes.join("") };
}
