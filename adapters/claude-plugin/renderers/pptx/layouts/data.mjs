import { CANVAS, SAFE, CONTENT_COLUMN_GAP, TYPE_SCALE_PX, FOOTER_ZONE_HEIGHT, BANNER_HEIGHT_PX, BANNER_GAP_PX, centeredContentYIn, px2in, px2pt } from "../constants.mjs";
import { addTitle, addBody, addStatBlock, addBanner } from "../elements.mjs";
import { estimateBlockHeightPx } from "../../html/text-measure.mjs";

export default function renderData(pptxSlide, slide, { colors }) {
  pptxSlide.background = { color: colors.paper };

  const titleWidthPx = CANVAS.width - SAFE.left - SAFE.right;
  const titleHeightPx = estimateBlockHeightPx(slide.title, { sizePx: TYPE_SCALE_PX.slideTitle, widthPx: titleWidthPx, weight: "black" });

  const n = slide.stats.length;
  const valueSizePt = n <= 2 ? 60 : n <= 4 ? 44 : 34;
  const statRowHeightPx = valueSizePt / 0.75 + 120; // pt->px + margen para label/caption/delta
  const bannerBlockHeightPx = slide.banner ? BANNER_GAP_PX + BANNER_HEIGHT_PX : 0;

  const contentHeightPx = titleHeightPx + 60 + statRowHeightPx + bannerBlockHeightPx;
  const titleY = centeredContentYIn("content", contentHeightPx);
  addTitle(pptxSlide, slide.title, { x: px2in(SAFE.left), y: titleY, w: px2in(titleWidthPx), h: px2in(titleHeightPx), sizePt: px2pt(TYPE_SCALE_PX.slideTitle), color: colors.sabanaBlue });

  const statsY = titleY + px2in(titleHeightPx + 60);
  const availW = px2in(titleWidthPx);
  const gap = px2in(CONTENT_COLUMN_GAP);
  const statW = (availW - gap * (n - 1)) / n;

  slide.stats.forEach((stat, i) => {
    const x = px2in(SAFE.left) + i * (statW + gap);
    const accentColor = stat.accent === "alert" ? colors.juridicas500 : undefined;
    addStatBlock(pptxSlide, stat, { x, y: statsY, w: statW, valueSizePt, colors, accentColor, badge: stat.badge });
  });

  if (slide.banner) {
    addBanner(pptxSlide, slide.banner, {
      x: px2in(SAFE.left),
      y: statsY + px2in(statRowHeightPx + BANNER_GAP_PX),
      w: availW,
      h: px2in(BANNER_HEIGHT_PX),
      colors,
    });
  }

  addBody(pptxSlide, `Fuente: ${slide.source} · ${slide.period}`, {
    x: px2in(SAFE.left),
    y: px2in(CANVAS.height - SAFE.bottom - FOOTER_ZONE_HEIGHT - 20),
    w: availW,
    sizePt: 11,
    color: colors.ink500,
  });

  return "light";
}
