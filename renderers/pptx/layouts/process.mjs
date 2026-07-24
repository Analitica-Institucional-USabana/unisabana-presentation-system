import { CANVAS, SAFE, TYPE_SCALE_PX, BANNER_HEIGHT_PX, BANNER_GAP_PX, centeredContentYIn, px2in, px2pt } from "../constants.mjs";
import { addTitle, addBanner } from "../elements.mjs";
import { estimateBlockHeightPx } from "../../html/text-measure.mjs";

export default function renderProcess(pptxSlide, slide, { colors }) {
  pptxSlide.background = { color: colors.paper };

  const titleWidthPx = CANVAS.width - SAFE.left - SAFE.right;
  const titleHeightPx = estimateBlockHeightPx(slide.title, { sizePx: TYPE_SCALE_PX.slideTitle, widthPx: titleWidthPx, weight: "black" });

  const n = slide.steps.length;
  const stepWidthPx = titleWidthPx / n;
  const circleSizePx = 48;
  const labelBlockHeightPx = Math.max(
    ...slide.steps.map((step) => {
      const labelH = estimateBlockHeightPx(step.label, { sizePx: 18, widthPx: stepWidthPx - 12, weight: "semibold", lineHeight: 1.3 });
      const descH = step.description
        ? 4 + estimateBlockHeightPx(step.description, { sizePx: 14, widthPx: stepWidthPx - 12, weight: "regular", lineHeight: 1.3 })
        : 0;
      return labelH + descH;
    })
  );
  const stepsGapPx = 64;
  const stepBlockHeightPx = circleSizePx + 16 + labelBlockHeightPx;
  const bannerBlockHeightPx = slide.banner ? BANNER_GAP_PX + BANNER_HEIGHT_PX : 0;
  const contentHeightPx = titleHeightPx + stepsGapPx + stepBlockHeightPx + bannerBlockHeightPx;

  const titleY = centeredContentYIn("content", contentHeightPx);
  addTitle(pptxSlide, slide.title, { x: px2in(SAFE.left), y: titleY, w: px2in(titleWidthPx), h: px2in(titleHeightPx), sizePt: px2pt(TYPE_SCALE_PX.slideTitle), color: colors.sabanaBlue });

  const stepsY = titleY + px2in(titleHeightPx + stepsGapPx);
  const availW = px2in(titleWidthPx);
  const stepW = availW / n;
  const circleSize = px2in(circleSizePx);
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
      y: stepsY + circleSize + px2in(16),
      w: stepW - px2in(12),
      h: px2in(labelBlockHeightPx),
      fontFace: "Libre Franklin",
      fontSize: 12,
      color: colors.sabanaBlue,
      align: "center",
    });
  });

  if (slide.banner) {
    addBanner(pptxSlide, slide.banner, {
      x: px2in(SAFE.left),
      y: stepsY + circleSize + px2in(16) + px2in(labelBlockHeightPx) + px2in(BANNER_GAP_PX),
      w: availW,
      h: px2in(BANNER_HEIGHT_PX),
      colors,
    });
  }

  return "light";
}
