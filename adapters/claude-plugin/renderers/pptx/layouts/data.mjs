import { CANVAS, SAFE, CONTENT_COLUMN_GAP, TYPE_SCALE_PT, FOOTER_ZONE_HEIGHT, px2in } from "../constants.mjs";
import { addTitle, addBody, addStatBlock } from "../elements.mjs";

export default function renderData(pptxSlide, slide, { colors }) {
  pptxSlide.background = { color: colors.paper };
  const titleY = px2in(SAFE.top + 40);
  addTitle(pptxSlide, slide.title, { x: px2in(SAFE.left), y: titleY, w: px2in(CANVAS.width - SAFE.left - SAFE.right), h: 1, sizePt: TYPE_SCALE_PT.slideTitle, color: colors.sabanaBlue });

  const statsY = titleY + 1.1;
  const n = slide.stats.length;
  const availW = px2in(CANVAS.width - SAFE.left - SAFE.right);
  const gap = px2in(CONTENT_COLUMN_GAP);
  const statW = (availW - gap * (n - 1)) / n;
  const valueSizePt = n <= 2 ? 60 : n <= 4 ? 44 : 34;

  slide.stats.forEach((stat, i) => {
    const x = px2in(SAFE.left) + i * (statW + gap);
    addStatBlock(pptxSlide, stat, { x, y: statsY, w: statW, valueSizePt, colors });
  });

  addBody(pptxSlide, `Fuente: ${slide.source} · ${slide.period}`, {
    x: px2in(SAFE.left),
    y: px2in(CANVAS.height - SAFE.bottom - FOOTER_ZONE_HEIGHT - 20),
    w: availW,
    sizePt: 11,
    color: colors.ink500,
  });

  return "light";
}
