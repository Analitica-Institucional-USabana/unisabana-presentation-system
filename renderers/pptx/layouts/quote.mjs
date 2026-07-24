import { SAFE, centeredContentYIn, px2in, px2pt } from "../constants.mjs";
import { NAVY_GRADIENT, addWavePanel } from "../decor.mjs";
import { estimateBlockHeightPx } from "../../html/text-measure.mjs";

export default function renderQuote(pptxSlide, slide, { colors }) {
  pptxSlide.background = NAVY_GRADIENT(colors);
  addWavePanel(pptxSlide, colors);

  const textHeightPx = estimateBlockHeightPx(slide.text, { sizePx: 40, widthPx: 1000, weight: "medium", lineHeight: 1.35 });
  const attributionHeightPx = estimateBlockHeightPx(slide.attribution, { sizePx: 20, widthPx: 900, weight: "semibold", lineHeight: 1.4 });
  const contentHeightPx = textHeightPx + 30 + attributionHeightPx;

  let y = centeredContentYIn("content", contentHeightPx);

  pptxSlide.addText(`“${slide.text}”`, {
    x: px2in(SAFE.left), y, w: 9, h: px2in(textHeightPx),
    fontFace: "Libre Franklin", fontSize: px2pt(40), color: "FFFFFF", fit: "shrink",
  });
  y += px2in(textHeightPx + 30);

  pptxSlide.addText(`— ${slide.attribution}`, {
    x: px2in(SAFE.left), y, w: 8, h: px2in(attributionHeightPx),
    fontFace: "Libre Franklin", fontSize: 15, bold: true, color: colors.sabanaBlue300,
  });
  return "dark";
}
