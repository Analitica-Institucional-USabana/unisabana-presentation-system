import { SAFE, centeredContentYIn, px2in, px2pt } from "../constants.mjs";
import { addTitle, addBody } from "../elements.mjs";
import { addNavyGradientBackground, addBrandWaveImage } from "../decor.mjs";
import { estimateBlockHeightPx } from "../../html/text-measure.mjs";

export default function renderClosing(pptxSlide, slide, { colors, repoRoot }) {
  addNavyGradientBackground(pptxSlide, colors);
  addBrandWaveImage(pptxSlide, repoRoot);

  const titleHeightPx = estimateBlockHeightPx(slide.title, { sizePx: 52, widthPx: 1000, weight: "black" });
  const contactHeightPx = slide.contact
    ? estimateBlockHeightPx(slide.contact, { sizePx: 20, widthPx: 800, weight: "regular", lineHeight: 1.55 })
    : 0;
  const contentHeightPx = titleHeightPx + 40 + contactHeightPx;

  let y = centeredContentYIn("closing", contentHeightPx);

  addTitle(pptxSlide, slide.title, { x: px2in(SAFE.left), y, w: 9, h: px2in(titleHeightPx), sizePt: px2pt(52), color: "FFFFFF" });
  y += px2in(titleHeightPx + 40);

  if (slide.contact) {
    addBody(pptxSlide, slide.contact, { x: px2in(SAFE.left), y, w: 8, h: px2in(contactHeightPx), sizePt: 15, color: colors.sabanaBlue300 });
  }
  return "dark";
}
