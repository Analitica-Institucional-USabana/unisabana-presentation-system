import { SAFE, TYPE_SCALE_PT, px2in } from "../constants.mjs";
import { addTitle } from "../elements.mjs";

export default function renderAgenda(pptxSlide, slide, { colors }) {
  pptxSlide.background = { color: colors.paper };
  addTitle(pptxSlide, slide.title || "Agenda", { x: px2in(SAFE.left), y: px2in(SAFE.top + 40), w: 6, h: 0.9, sizePt: TYPE_SCALE_PT.slideTitle, color: colors.sabanaBlue });

  let y = px2in(SAFE.top + 40) + 0.9 + px2in(48);
  slide.items.forEach((item, i) => {
    const num = String(i + 1).padStart(2, "0");
    pptxSlide.addText(
      [
        { text: `${num}  `, options: { fontSize: 18, bold: true, color: colors.accent } },
        { text: item, options: { fontSize: 15, bold: true, color: colors.sabanaBlue } },
      ],
      { x: px2in(SAFE.left), y, w: 8, h: 0.4, fontFace: "Libre Franklin" }
    );
    y += px2in(64);
  });

  return "light";
}
