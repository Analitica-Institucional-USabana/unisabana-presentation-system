import { CANVAS, SAFE, CONTENT_COLUMN_GAP, TYPE_SCALE_PX, contentBand, px2in, px2pt } from "../constants.mjs";
import { addTitle, addBulletCard } from "../elements.mjs";
import { estimateBlockHeightPx } from "../../html/text-measure.mjs";

export default function renderComparison(pptxSlide, slide, { colors }) {
  pptxSlide.background = { color: colors.paper };

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

  slide.columns.forEach((col, i) => {
    const x = px2in(SAFE.left) + i * (colW + gap);
    addBulletCard(pptxSlide, col, { x, y: colsY, w: colW, h: colsH, colors });
  });

  return "light";
}
