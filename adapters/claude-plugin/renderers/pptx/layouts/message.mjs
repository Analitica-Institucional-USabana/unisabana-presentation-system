import { SAFE, px2in } from "../constants.mjs";
import { addTitle, addBody } from "../elements.mjs";

export default function renderMessage(pptxSlide, slide, { colors }) {
  pptxSlide.background = { color: colors.paper };
  addTitle(pptxSlide, slide.title, { x: px2in(SAFE.left), y: px2in(260), w: 10, h: 1.6, sizePt: 42, color: colors.sabanaBlue });
  if (slide.supporting) {
    addBody(pptxSlide, slide.supporting, { x: px2in(SAFE.left), y: px2in(260) + 1.4, w: 9, sizePt: 18, color: colors.ink700 });
  }
  return "light";
}
