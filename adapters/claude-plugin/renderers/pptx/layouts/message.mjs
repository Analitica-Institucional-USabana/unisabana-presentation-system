import { CANVAS, SAFE, BANNER_HEIGHT_PX, BANNER_GAP_PX, centeredContentYIn, px2in, px2pt } from "../constants.mjs";
import { addTitle, addBody, addBanner } from "../elements.mjs";
import { estimateBlockHeightPx } from "../../html/text-measure.mjs";

export default function renderMessage(pptxSlide, slide, { colors }) {
  pptxSlide.background = { color: slide.background === "tinted" ? colors.surfaceTint : colors.paper };

  const titleHeightPx = estimateBlockHeightPx(slide.title, { sizePx: 56, widthPx: 1000, weight: "black" });
  const supportingHeightPx = slide.supporting
    ? estimateBlockHeightPx(slide.supporting, { sizePx: 24, widthPx: 900, weight: "regular", lineHeight: 1.55 })
    : 0;
  const bannerBlockHeightPx = slide.banner ? BANNER_GAP_PX + BANNER_HEIGHT_PX : 0;
  const contentHeightPx = titleHeightPx + 24 + supportingHeightPx + bannerBlockHeightPx;

  let y = centeredContentYIn("content", contentHeightPx);

  addTitle(pptxSlide, slide.title, { x: px2in(SAFE.left), y, w: 10, h: px2in(titleHeightPx), sizePt: px2pt(56), color: colors.sabanaBlue });
  y += px2in(titleHeightPx + 24);

  if (slide.supporting) {
    addBody(pptxSlide, slide.supporting, { x: px2in(SAFE.left), y, w: 9, h: px2in(supportingHeightPx), sizePt: 18, color: colors.ink700 });
    y += px2in(supportingHeightPx + 24);
  }

  if (slide.banner) {
    const bannerWidth = px2in(CANVAS.width - SAFE.left - SAFE.right);
    addBanner(pptxSlide, slide.banner, { x: px2in(SAFE.left), y, w: bannerWidth, h: px2in(BANNER_HEIGHT_PX), colors });
  }
  return "light";
}
