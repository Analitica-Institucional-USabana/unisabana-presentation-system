import { CANVAS, SAFE, CONTENT_COLUMN_GAP, TYPE_SCALE_PX, contentBand, px2in, px2pt } from "../constants.mjs";
import { addTitle, addBulletCard, addStatusCard } from "../elements.mjs";
import { estimateBlockHeightPx, estimateStatusCardHeightPx, estimateBulletCardHeightPx } from "../../html/text-measure.mjs";

export default function renderComparison(pptxSlide, slide, { colors }) {
  pptxSlide.background = { color: slide.background === "tinted" ? colors.surfaceTint : colors.paper };

  const band = contentBand("content");
  const titleWidthPx = CANVAS.width - SAFE.left - SAFE.right;
  const titleHeightPx = estimateBlockHeightPx(slide.title, { sizePx: TYPE_SCALE_PX.slideTitle, widthPx: titleWidthPx, weight: "black" });

  const titleY = px2in(band.top);
  addTitle(pptxSlide, slide.title, { x: px2in(SAFE.left), y: titleY, w: px2in(titleWidthPx), h: px2in(titleHeightPx), sizePt: px2pt(TYPE_SCALE_PX.slideTitle), color: colors.sabanaBlue });

  const colsY = titleY + px2in(titleHeightPx + 48);
  const colsH = px2in(band.bottom) - colsY;
  const n = slide.columns.length;
  const availW = px2in(titleWidthPx);
  const gap = px2in(CONTENT_COLUMN_GAP);
  const colW = (availW - gap * (n - 1)) / n;

  // planning/10-...md #2: mirror del renderer HTML — la tarjeta nunca es más
  // chica que lo medido, para que el texto no se salga del rectángulo/borde.
  const innerWidthPx = colW * 96 - 48;
  slide.columns.forEach((col, i) => {
    const x = px2in(SAFE.left) + i * (colW + gap);
    if (col.stats?.length || col.badge) {
      const cardH = Math.max(colsH, px2in(estimateStatusCardHeightPx(col, innerWidthPx)));
      addStatusCard(pptxSlide, { heading: col.heading, badge: col.badge, accent: col.accent, stats: col.stats, points: col.points }, { x, y: colsY, w: colW, h: cardH, colors });
    } else {
      const cardH = Math.max(colsH, px2in(estimateBulletCardHeightPx(col, innerWidthPx)));
      addBulletCard(pptxSlide, col, { x, y: colsY, w: colW, h: cardH, colors });
    }
  });

  return "light";
}
