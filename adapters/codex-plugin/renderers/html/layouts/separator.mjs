import { SAFE, TYPE_SCALE_PX, TYPE_SCALE_MIN_PX, centeredContentY } from "../constants.mjs";
import { title, bodyText } from "../elements.mjs";
import { NAVY_GRADIENT_CSS, waveOverlay } from "../decor.mjs";
import { estimateBlockHeightPx, fitTitleSizePx } from "../text-measure.mjs";

export default function renderSeparator(slide, { repoRoot }) {
  const titleSizePx = fitTitleSizePx(slide.title, {
    maxSizePx: TYPE_SCALE_PX.sectionTitle,
    minSizePx: TYPE_SCALE_MIN_PX.sectionTitle,
    widthPx: 900,
    weight: "black",
  });
  const titleHeight = estimateBlockHeightPx(slide.title, { sizePx: titleSizePx, widthPx: 900, weight: "black" });
  // bodyText() aplica siempre line-height:var(--lh-body) = 1.55 (core/brand/tokens.css) — la medición debe usar el mismo valor.
  const descriptorHeight = slide.descriptor
    ? estimateBlockHeightPx(slide.descriptor, { sizePx: 20, widthPx: 800, weight: "regular", lineHeight: 1.55 })
    : 0;
  const contentHeight = (slide.sectionNumber != null ? 130 : 0) + titleHeight + 20 + descriptorHeight;

  let y = centeredContentY("separator", contentHeight);
  let boxes = waveOverlay(repoRoot);

  if (slide.sectionNumber != null) {
    boxes += title(String(slide.sectionNumber), { x: SAFE.left, y, sizePx: 96, color: "var(--sabana-blue-300)" });
    y += 130;
  }
  boxes += title(slide.title, { x: SAFE.left, y, width: 900, sizePx: titleSizePx, color: "var(--text-on-dark)" });
  y += titleHeight + 20;

  if (slide.descriptor) {
    boxes += bodyText(slide.descriptor, { x: SAFE.left, y, width: 800, sizePx: 20, color: "var(--sabana-blue-300)" });
  }

  return { tone: "dark", backgroundCss: NAVY_GRADIENT_CSS, boxesHtml: boxes };
}
