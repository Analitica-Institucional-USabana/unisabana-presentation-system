import { join } from "node:path";
import { CANVAS, SAFE, TYPE_SCALE_PT, px2in } from "../constants.mjs";
import { addTitle, addBody, addEyebrow } from "../elements.mjs";

export default function renderCover(pptxSlide, slide, { repoRoot, colors }) {
  const tone = slide.background === "light" ? "light" : "dark";

  if (slide.background === "photo") {
    pptxSlide.addImage({ path: join(repoRoot, "core/brand", slide.photo), x: 0, y: 0, w: px2in(CANVAS.width), h: px2in(CANVAS.height) });
    pptxSlide.addShape("rect", {
      x: 0, y: 0, w: px2in(CANVAS.width), h: px2in(CANVAS.height),
      fill: { color: colors.sabanaBlueDeep, transparency: 35 },
      line: { type: "none" },
    });
  } else if (slide.background === "navy") {
    pptxSlide.background = { color: colors.sabanaBlueDeep };
  } else {
    pptxSlide.background = { color: colors.paper };
  }

  const textColor = tone === "dark" ? "FFFFFF" : colors.sabanaBlue;
  const contentW = px2in(CANVAS.width - SAFE.left - SAFE.right - 160);
  let y = px2in(220);

  if (slide.eyebrow) {
    addEyebrow(pptxSlide, slide.eyebrow, { x: px2in(SAFE.left), y, w: contentW, color: tone === "dark" ? colors.sabanaBlue300 : colors.accentMid });
    y += px2in(40);
  }
  addTitle(pptxSlide, slide.title, { x: px2in(SAFE.left), y, w: contentW, h: 1.6, sizePt: TYPE_SCALE_PT.coverTitle, color: textColor });
  y += px2in(Math.round(TYPE_SCALE_PT.coverTitle * 1.4 * (96 / 72)));

  if (slide.subtitle) {
    addBody(pptxSlide, slide.subtitle, { x: px2in(SAFE.left), y, w: contentW, sizePt: 18, weight: "medium", color: tone === "dark" ? colors.sabanaBlue300 : colors.ink700 });
  }

  const meta = [slide.presenter, slide.date, slide.event].filter(Boolean).join(" · ");
  if (meta) {
    addBody(pptxSlide, meta, {
      x: px2in(SAFE.left), y: px2in(CANVAS.height - SAFE.bottom - 40), w: contentW, sizePt: 12,
      color: tone === "dark" ? colors.sabanaBlue300 : colors.ink500,
    });
  }

  return tone;
}
