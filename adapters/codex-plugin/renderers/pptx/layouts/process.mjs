import { CANVAS, SAFE, TYPE_SCALE_PT, px2in } from "../constants.mjs";
import { addTitle } from "../elements.mjs";

export default function renderProcess(pptxSlide, slide, { colors }) {
  pptxSlide.background = { color: colors.paper };
  const titleY = px2in(SAFE.top + 40);
  addTitle(pptxSlide, slide.title, { x: px2in(SAFE.left), y: titleY, w: px2in(CANVAS.width - SAFE.left - SAFE.right), h: 1, sizePt: TYPE_SCALE_PT.slideTitle, color: colors.sabanaBlue });

  const stepsY = titleY + 1.6;
  const n = slide.steps.length;
  const availW = px2in(CANVAS.width - SAFE.left - SAFE.right);
  const stepW = availW / n;
  const circleSize = 0.5;
  const circleCenterY = stepsY + circleSize / 2;

  pptxSlide.addShape("rect", {
    x: px2in(SAFE.left) + stepW / 2,
    y: circleCenterY - 0.01,
    w: availW - stepW,
    h: 0.02,
    fill: { color: colors.ink200 },
    line: { type: "none" },
  });

  slide.steps.forEach((step, i) => {
    const cx = px2in(SAFE.left) + i * stepW + stepW / 2 - circleSize / 2;
    pptxSlide.addShape("ellipse", { x: cx, y: stepsY, w: circleSize, h: circleSize, fill: { color: colors.accent }, line: { type: "none" } });
    pptxSlide.addText(String(i + 1), {
      x: cx, y: stepsY, w: circleSize, h: circleSize, fontFace: "Libre Franklin", fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle",
    });
    const label = step.description ? `${step.label}\n${step.description}` : step.label;
    pptxSlide.addText(label, {
      x: px2in(SAFE.left) + i * stepW,
      y: stepsY + circleSize + 0.15,
      w: stepW - 0.1,
      h: 0.8,
      fontFace: "Libre Franklin",
      fontSize: 12,
      color: colors.sabanaBlue,
      align: "center",
    });
  });

  return "light";
}
