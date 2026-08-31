import { join } from "node:path";
import { CANVAS, SAFE, TYPE_SCALE_PX, TYPE_SCALE_MIN_PX, centeredContentYIn, px2in, px2pt } from "../constants.mjs";
import { addTitle, addBody } from "../elements.mjs";
import { addNavyGradientBackground, addBrandWaveImage } from "../decor.mjs";
import { estimateBlockHeightPx, fitTitleSizePx } from "../../html/text-measure.mjs";

export default function renderSeparator(pptxSlide, slide, { colors, repoRoot }) {
  if (slide.background === "photo") {
    // Cortinilla cinematográfica: mismo tratamiento que cover{background:photo}
    // (imagen full-bleed + velo navy), reutilizado tal cual — planning/09-visual-richness-and-content-density.md.
    pptxSlide.addImage({ path: join(repoRoot, "core/brand", slide.photo), x: 0, y: 0, w: px2in(CANVAS.width), h: px2in(CANVAS.height) });
    pptxSlide.addShape("rect", {
      x: 0, y: 0, w: px2in(CANVAS.width), h: px2in(CANVAS.height),
      fill: { color: colors.sabanaBlueDeep, transparency: 35 },
      line: { type: "none" },
    });
  } else {
    addNavyGradientBackground(pptxSlide, colors);
    addBrandWaveImage(pptxSlide, repoRoot);
  }

  const titleSizePx = fitTitleSizePx(slide.title, {
    maxSizePx: TYPE_SCALE_PX.sectionTitle,
    minSizePx: TYPE_SCALE_MIN_PX.sectionTitle,
    widthPx: 900,
    weight: "black",
  });
  const titleHeightPx = estimateBlockHeightPx(slide.title, { sizePx: titleSizePx, widthPx: 900, weight: "black" });
  const descriptorHeightPx = slide.descriptor
    ? estimateBlockHeightPx(slide.descriptor, { sizePx: 20, widthPx: 800, weight: "regular", lineHeight: 1.55 })
    : 0;
  const contentHeightPx = (slide.sectionNumber != null ? 130 : 0) + titleHeightPx + 20 + descriptorHeightPx;

  let y = centeredContentYIn("separator", contentHeightPx);

  if (slide.sectionNumber != null) {
    addTitle(pptxSlide, String(slide.sectionNumber), { x: px2in(SAFE.left), y, w: 3, h: px2in(96 * 1.15), sizePt: 72, color: colors.sabanaBlue300 });
    y += px2in(130);
  }
  addTitle(pptxSlide, slide.title, { x: px2in(SAFE.left), y, w: 9, h: px2in(titleHeightPx), sizePt: px2pt(titleSizePx), color: "FFFFFF" });
  y += px2in(titleHeightPx + 20);

  if (slide.descriptor) {
    addBody(pptxSlide, slide.descriptor, { x: px2in(SAFE.left), y, w: 8, h: px2in(descriptorHeightPx), sizePt: 15, color: colors.sabanaBlue300 });
  }

  return "dark";
}
