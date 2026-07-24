import { SAFE, px2in } from "../constants.mjs";
import { addTitle, addBody } from "../elements.mjs";

export default function renderClosing(pptxSlide, slide, { colors }) {
  pptxSlide.background = { color: colors.sabanaBlueDeep };
  addTitle(pptxSlide, slide.title, { x: px2in(SAFE.left), y: px2in(280), w: 9, h: 1.4, sizePt: 38, color: "FFFFFF" });
  if (slide.contact) {
    addBody(pptxSlide, slide.contact, { x: px2in(SAFE.left), y: px2in(380), w: 8, sizePt: 15, color: colors.sabanaBlue300 });
  }
  return "dark";
}
