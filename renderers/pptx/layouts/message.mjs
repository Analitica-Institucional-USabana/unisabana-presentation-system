import { SAFE, centeredContentYIn, px2in, px2pt } from "../constants.mjs";
import { addTitle, addBody } from "../elements.mjs";
import { estimateBlockHeightPx } from "../../html/text-measure.mjs";

export default function renderMessage(pptxSlide, slide, { colors }) {
  pptxSlide.background = { color: colors.paper };

  const titleHeightPx = estimateBlockHeightPx(slide.title, { sizePx: 56, widthPx: 1000, weight: "black" });
  const supportingHeightPx = slide.supporting
    ? estimateBlockHeightPx(slide.supporting, { sizePx: 24, widthPx: 900, weight: "regular", lineHeight: 1.55 })
    : 0;
  const contentHeightPx = titleHeightPx + 24 + supportingHeightPx;

  let y = centeredContentYIn("content", contentHeightPx);

  addTitle(pptxSlide, slide.title, { x: px2in(SAFE.left), y, w: 10, h: px2in(titleHeightPx), sizePt: px2pt(56), color: colors.sabanaBlue });
  y += px2in(titleHeightPx + 24);

  if (slide.supporting) {
    addBody(pptxSlide, slide.supporting, { x: px2in(SAFE.left), y, w: 9, h: px2in(supportingHeightPx), sizePt: 18, color: colors.ink700 });
  }
  return "light";
}
