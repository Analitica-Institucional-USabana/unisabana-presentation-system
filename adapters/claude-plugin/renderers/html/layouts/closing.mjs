import { SAFE, centeredContentY } from "../constants.mjs";
import { title, bodyText } from "../elements.mjs";
import { NAVY_GRADIENT_CSS, waveOverlay } from "../decor.mjs";
import { estimateBlockHeightPx } from "../text-measure.mjs";

export default function renderClosing(slide, { repoRoot }) {
  const titleHeight = estimateBlockHeightPx(slide.title, { sizePx: 52, widthPx: 1000, weight: "black" });
  // bodyText() aplica siempre line-height:var(--lh-body) = 1.55 (core/brand/tokens.css) — la medición debe usar el mismo valor.
  const contactHeight = slide.contact
    ? estimateBlockHeightPx(slide.contact, { sizePx: 20, widthPx: 800, weight: "regular", lineHeight: 1.55 })
    : 0;
  const contentHeight = titleHeight + 40 + contactHeight;

  let y = centeredContentY("closing", contentHeight);
  let boxes = waveOverlay(repoRoot);

  boxes += title(slide.title, { x: SAFE.left, y, width: 1000, sizePx: 52, color: "var(--text-on-dark)" });
  y += titleHeight + 40;

  if (slide.contact) {
    boxes += bodyText(slide.contact, { x: SAFE.left, y, width: 800, sizePx: 20, color: "var(--sabana-blue-300)" });
  }

  return { tone: "dark", backgroundCss: NAVY_GRADIENT_CSS, boxesHtml: boxes };
}
