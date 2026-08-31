import { CANVAS, SAFE, BANNER_HEIGHT_PX, BANNER_GAP_PX, CHART_GAP_PX, contentBand, centeredContentYIn, px2in, px2pt } from "../constants.mjs";
import { addTitle, addBody, addBanner } from "../elements.mjs";
import { estimateBlockHeightPx } from "../../html/text-measure.mjs";
import { chartWidthPx } from "../../html/chart-block.mjs";
import { addChartBlock } from "../chart-block.mjs";

export default function renderMessage(pptxSlide, slide, { colors, repoRoot }) {
  pptxSlide.background = { color: slide.background === "tinted" ? colors.surfaceTint : colors.paper };

  // Mismo criterio que renderers/html/layouts/message.mjs: con un chart de
  // por medio, el título/apoyo bajan de tamaño para devolverle espacio real
  // al chart en vez de dejarlo aplastado en ~100px de alto.
  const titleSizePx = slide.chart ? 38 : 56;
  const supportingSizePx = slide.chart ? 18 : 24;
  const gapPx = slide.chart ? 16 : 24;
  const titleHeightPx = estimateBlockHeightPx(slide.title, { sizePx: titleSizePx, widthPx: 1000, weight: "black" });
  const supportingHeightPx = slide.supporting
    ? estimateBlockHeightPx(slide.supporting, { sizePx: supportingSizePx, widthPx: 900, weight: "regular", lineHeight: 1.55 })
    : 0;
  const bannerBlockHeightPx = slide.banner ? BANNER_GAP_PX + BANNER_HEIGHT_PX : 0;
  const availWidthPx = CANVAS.width - SAFE.left - SAFE.right;
  // A diferencia del HTML (que necesita escalar el SVG para caber, ver
  // renderers/html/chart-block.mjs#renderFittedChartBlock), un chart nativo
  // de pptxgenjs se estira a la caja que se le dé — el "cap" acá es
  // directamente el alto que se usa, sin necesidad de truco de escala.
  const band = contentBand("content");
  const MEASUREMENT_SLOP_PX = 20; // ver renderers/html/layouts/message.mjs — mismo margen para estimateBlockHeightPx.
  const chartHeightPx = slide.chart
    ? Math.max(120, band.bottom - band.top - titleHeightPx - gapPx - supportingHeightPx - (slide.supporting ? gapPx : 0) - bannerBlockHeightPx - CHART_GAP_PX - MEASUREMENT_SLOP_PX)
    : 0;
  const chartBlockHeightPx = slide.chart ? CHART_GAP_PX + chartHeightPx : 0;
  const contentHeightPx = titleHeightPx + gapPx + supportingHeightPx + bannerBlockHeightPx + chartBlockHeightPx;

  let y = centeredContentYIn("content", contentHeightPx);

  addTitle(pptxSlide, slide.title, { x: px2in(SAFE.left), y, w: 10, h: px2in(titleHeightPx), sizePt: px2pt(titleSizePx), color: colors.sabanaBlue });
  y += px2in(titleHeightPx + gapPx);

  if (slide.supporting) {
    addBody(pptxSlide, slide.supporting, { x: px2in(SAFE.left), y, w: 9, h: px2in(supportingHeightPx), sizePt: px2pt(supportingSizePx), color: colors.ink700 });
    y += px2in(supportingHeightPx + gapPx);
  }

  if (slide.banner) {
    const bannerWidth = px2in(availWidthPx);
    addBanner(pptxSlide, slide.banner, { x: px2in(SAFE.left), y, w: bannerWidth, h: px2in(BANNER_HEIGHT_PX), colors, repoRoot });
    y += px2in(BANNER_HEIGHT_PX);
  }

  if (slide.chart) {
    const chartW = chartWidthPx(slide.chart, availWidthPx, chartHeightPx);
    y += px2in(CHART_GAP_PX);
    addChartBlock(pptxSlide, slide.chart, { x: px2in(SAFE.left) + (px2in(availWidthPx) - px2in(chartW)) / 2, y, w: px2in(chartW), h: px2in(chartHeightPx), colors });
  }
  return "light";
}
