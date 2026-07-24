import { SAFE, TYPE_SCALE_PT, px2in } from "../constants.mjs";
import { addTitle, addBody } from "../elements.mjs";

export default function renderSeparator(pptxSlide, slide, { colors }) {
  pptxSlide.background = { color: colors.sabanaBlueDeep };
  let y = px2in(220);

  if (slide.sectionNumber != null) {
    addTitle(pptxSlide, String(slide.sectionNumber), { x: px2in(SAFE.left), y, w: 3, h: 1.3, sizePt: 72, color: colors.sabanaBlue300 });
    y += px2in(130);
  }
  addTitle(pptxSlide, slide.title, { x: px2in(SAFE.left), y, w: 9, h: 1.2, sizePt: TYPE_SCALE_PT.sectionTitle, color: "FFFFFF" });
  y += px2in(Math.round(TYPE_SCALE_PT.sectionTitle * 1.3) + 20);

  if (slide.descriptor) {
    addBody(pptxSlide, slide.descriptor, { x: px2in(SAFE.left), y, w: 8, sizePt: 15, color: colors.sabanaBlue300 });
  }

  return "dark";
}
