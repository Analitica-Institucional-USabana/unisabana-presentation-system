import { join } from "node:path";
import { CANVAS, SAFE, TYPE_SCALE_PX, TYPE_SCALE_MIN_PX, centeredContentYIn, px2in, px2pt } from "../constants.mjs";
import { addTitle, addBody, addEyebrow } from "../elements.mjs";
import { addNavyGradientBackground, addBrandWaveImage } from "../decor.mjs";
import { estimateBlockHeightPx, fitTitleSizePx } from "../../html/text-measure.mjs";

const OWNER_PLACEHOLDER = "Dependencia responsable: pendiente de definir";
const OWNER_LINE_HEIGHT_PX = 32;

export default function renderCover(pptxSlide, slide, { repoRoot, colors, presentation }) {
  const tone = slide.background === "light" ? "light" : "dark";

  if (slide.background === "photo") {
    pptxSlide.addImage({ path: join(repoRoot, "core/brand", slide.photo), x: 0, y: 0, w: px2in(CANVAS.width), h: px2in(CANVAS.height) });
    pptxSlide.addShape("rect", {
      x: 0, y: 0, w: px2in(CANVAS.width), h: px2in(CANVAS.height),
      fill: { color: colors.sabanaBlueDeep, transparency: 35 },
      line: { type: "none" },
    });
  } else if (slide.background === "navy") {
    addNavyGradientBackground(pptxSlide, colors);
    addBrandWaveImage(pptxSlide, repoRoot);
  } else {
    pptxSlide.background = { color: colors.paper };
  }

  const textColor = tone === "dark" ? "FFFFFF" : colors.sabanaBlue;
  const contentWidthPx = CANVAS.width - SAFE.left - SAFE.right - 160;
  const contentW = px2in(contentWidthPx);

  // planning/08-visual-quality-and-layout-fixes.md backlog #1/#4/#6: mismo
  // fix que renderers/html/layouts/cover.mjs — medir líneas reales y centrar,
  // en vez de asumir una sola línea de título.
  const titleSizePx = fitTitleSizePx(slide.title, {
    maxSizePx: TYPE_SCALE_PX.coverTitle,
    minSizePx: TYPE_SCALE_MIN_PX.coverTitle,
    widthPx: contentWidthPx,
    weight: "black",
  });
  const titleHeightPx = estimateBlockHeightPx(slide.title, { sizePx: titleSizePx, widthPx: contentWidthPx, weight: "black" });
  const subtitleHeightPx = slide.subtitle
    ? estimateBlockHeightPx(slide.subtitle, { sizePx: 24, widthPx: contentWidthPx, weight: "medium", lineHeight: 1.55 })
    : 0;
  // planning/10-...md #5: jerarquía de propiedad, mirror del renderer HTML.
  const contentHeightPx = OWNER_LINE_HEIGHT_PX + (slide.eyebrow ? 40 : 0) + titleHeightPx + 24 + subtitleHeightPx;

  let y = centeredContentYIn("cover", contentHeightPx);

  const ownerText = presentation?.owner || OWNER_PLACEHOLDER;
  addEyebrow(pptxSlide, ownerText, { x: px2in(SAFE.left), y, w: contentW, color: tone === "dark" ? colors.sabanaBlue300 : colors.ink500 });
  y += px2in(OWNER_LINE_HEIGHT_PX);

  if (slide.eyebrow) {
    addEyebrow(pptxSlide, slide.eyebrow, { x: px2in(SAFE.left), y, w: contentW, color: tone === "dark" ? colors.sabanaBlue300 : colors.accentMid });
    y += px2in(40);
  }
  addTitle(pptxSlide, slide.title, { x: px2in(SAFE.left), y, w: contentW, h: px2in(titleHeightPx), sizePt: px2pt(titleSizePx), color: textColor });
  y += px2in(titleHeightPx + 24);

  if (slide.subtitle) {
    addBody(pptxSlide, slide.subtitle, {
      x: px2in(SAFE.left), y, w: contentW, h: px2in(subtitleHeightPx), sizePt: 18, weight: "medium",
      color: tone === "dark" ? colors.sabanaBlue300 : colors.ink700,
    });
    y += px2in(subtitleHeightPx);
  }

  const meta = [slide.presenter, slide.date, slide.event].filter(Boolean).join(" · ");
  if (meta) {
    addBody(pptxSlide, meta, {
      x: px2in(SAFE.left), y: Math.max(px2in(CANVAS.height - SAFE.bottom - 40), y + px2in(16)), w: contentW, sizePt: 12,
      color: tone === "dark" ? colors.sabanaBlue300 : colors.ink500,
    });
  }

  return tone;
}
