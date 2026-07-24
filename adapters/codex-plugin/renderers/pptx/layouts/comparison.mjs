import { CANVAS, SAFE, CONTENT_COLUMN_GAP, TYPE_SCALE_PT, px2in } from "../constants.mjs";
import { addTitle, addBulletCard } from "../elements.mjs";

export default function renderComparison(pptxSlide, slide, { colors }) {
  pptxSlide.background = { color: colors.paper };
  const titleY = px2in(SAFE.top + 40);
  addTitle(pptxSlide, slide.title, { x: px2in(SAFE.left), y: titleY, w: px2in(CANVAS.width - SAFE.left - SAFE.right), h: 1, sizePt: TYPE_SCALE_PT.slideTitle, color: colors.sabanaBlue });

  const colsY = titleY + 1.1;
  const colsH = px2in(CANVAS.height - SAFE.bottom) - colsY - 0.6;
  const n = slide.columns.length;
  const availW = px2in(CANVAS.width - SAFE.left - SAFE.right);
  const gap = px2in(CONTENT_COLUMN_GAP);
  const colW = (availW - gap * (n - 1)) / n;

  slide.columns.forEach((col, i) => {
    const x = px2in(SAFE.left) + i * (colW + gap);
    addBulletCard(pptxSlide, col, { x, y: colsY, w: colW, h: colsH, colors });
  });

  return "light";
}
