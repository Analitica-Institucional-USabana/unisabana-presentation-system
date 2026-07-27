import { CANVAS, PAGE_NUMBER, px2in } from "./constants.mjs";

const BOX_WIDTH_PX = 80;
const BOX_HEIGHT_PX = 24;

export function addPageNumber(pptxSlide, index, total, tone) {
  const { left, bottom, textPx } = PAGE_NUMBER;
  const color = tone === "dark" ? "98B1D3" : "717175"; // sabana-blue-300 / ink-500

  pptxSlide.addText(`${index} / ${total}`, {
    x: px2in(left),
    y: px2in(CANVAS.height) - px2in(bottom) - px2in(BOX_HEIGHT_PX),
    w: px2in(BOX_WIDTH_PX),
    h: px2in(BOX_HEIGHT_PX),
    fontFace: "Libre Franklin",
    fontSize: textPx * 0.75,
    color,
    align: "left",
    valign: "middle",
  });
}
