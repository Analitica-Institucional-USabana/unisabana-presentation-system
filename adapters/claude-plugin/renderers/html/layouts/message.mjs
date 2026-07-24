import { SAFE, centeredContentY } from "../constants.mjs";
import { title, bodyText } from "../elements.mjs";
import { estimateBlockHeightPx } from "../text-measure.mjs";

export default function renderMessage(slide) {
  const titleHeight = estimateBlockHeightPx(slide.title, { sizePx: 56, widthPx: 1000, weight: "black" });
  // bodyText() aplica siempre line-height:var(--lh-body) = 1.55 (core/brand/tokens.css) — la medición debe usar el mismo valor.
  const supportingHeight = slide.supporting
    ? estimateBlockHeightPx(slide.supporting, { sizePx: 24, widthPx: 900, weight: "regular", lineHeight: 1.55 })
    : 0;
  const contentHeight = titleHeight + 24 + supportingHeight;

  let y = centeredContentY("content", contentHeight);
  const boxes = [];
  boxes.push(title(slide.title, { x: SAFE.left, y, width: 1000, sizePx: 56 }));
  y += titleHeight + 24;
  if (slide.supporting) {
    boxes.push(bodyText(slide.supporting, { x: SAFE.left, y, width: 900, sizePx: 24 }));
  }
  return { tone: "light", backgroundCss: "background:var(--bg-page);", boxesHtml: boxes.join("") };
}
