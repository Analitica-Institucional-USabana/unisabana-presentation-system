import { SAFE, px2in } from "../constants.mjs";

export default function renderQuote(pptxSlide, slide, { colors }) {
  pptxSlide.background = { color: colors.sabanaBlueDeep };
  pptxSlide.addText(`“${slide.text}”`, {
    x: px2in(SAFE.left), y: px2in(250), w: 9, h: 1.6,
    fontFace: "Libre Franklin", fontSize: 26, color: "FFFFFF", fit: "shrink",
  });
  pptxSlide.addText(`— ${slide.attribution}`, {
    x: px2in(SAFE.left), y: px2in(430), w: 8, h: 0.5,
    fontFace: "Libre Franklin", fontSize: 15, bold: true, color: colors.sabanaBlue300,
  });
  return "dark";
}
