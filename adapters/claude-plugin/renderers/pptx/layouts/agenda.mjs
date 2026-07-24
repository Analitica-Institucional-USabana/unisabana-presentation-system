import { SAFE, TYPE_SCALE_PX, centeredContentYIn, px2in, px2pt } from "../constants.mjs";
import { addTitle } from "../elements.mjs";
import { estimateBlockHeightPx } from "../../html/text-measure.mjs";

const ROW_HEIGHT_PX = 64;

export default function renderAgenda(pptxSlide, slide, { colors }) {
  pptxSlide.background = { color: colors.paper };

  const titleText = slide.title || "Agenda";
  const titleHeightPx = estimateBlockHeightPx(titleText, { sizePx: TYPE_SCALE_PX.slideTitle, widthPx: 700, weight: "black" });
  const itemsHeightPx = slide.items.length * ROW_HEIGHT_PX;
  const contentHeightPx = titleHeightPx + 48 + itemsHeightPx;

  let y = centeredContentYIn("content", contentHeightPx);
  addTitle(pptxSlide, titleText, { x: px2in(SAFE.left), y, w: 6, h: px2in(titleHeightPx), sizePt: px2pt(TYPE_SCALE_PX.slideTitle), color: colors.sabanaBlue });
  y += px2in(titleHeightPx + 48);

  slide.items.forEach((item, i) => {
    const num = String(i + 1).padStart(2, "0");
    pptxSlide.addText(
      [
        { text: `${num}  `, options: { fontSize: 18, bold: true, color: colors.accent } },
        { text: item, options: { fontSize: 15, bold: true, color: colors.sabanaBlue } },
      ],
      { x: px2in(SAFE.left), y, w: 8, h: px2in(ROW_HEIGHT_PX), fontFace: "Libre Franklin" }
    );
    y += px2in(ROW_HEIGHT_PX);
  });

  return "light";
}
