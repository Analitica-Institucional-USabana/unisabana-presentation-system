import { SAFE, centeredContentY } from "../constants.mjs";
import { box, escapeHtml } from "../elements.mjs";
import { NAVY_GRADIENT_CSS, waveOverlay } from "../decor.mjs";
import { estimateBlockHeightPx } from "../text-measure.mjs";

export default function renderQuote(slide, { repoRoot }) {
  const textHeight = estimateBlockHeightPx(slide.text, { sizePx: 40, widthPx: 1000, weight: "medium", lineHeight: 1.35 });
  const attributionHeight = estimateBlockHeightPx(slide.attribution, { sizePx: 20, widthPx: 900, weight: "semibold", lineHeight: 1.4 });
  const contentHeight = textHeight + 30 + attributionHeight;

  let y = centeredContentY("content", contentHeight);
  let boxes = waveOverlay(repoRoot);

  boxes += box({
    x: SAFE.left,
    y,
    width: 1000,
    style: "font-family:var(--font-sans);font-size:40px;font-weight:var(--fw-medium);line-height:var(--lh-snug);color:var(--text-on-dark);",
    html: `“${escapeHtml(slide.text)}”`,
  });
  y += textHeight + 30;

  boxes += box({
    x: SAFE.left,
    y,
    width: 900,
    style: "font-family:var(--font-sans);font-size:20px;font-weight:var(--fw-semibold);line-height:1.4;color:var(--sabana-blue-300);",
    html: `— ${escapeHtml(slide.attribution)}`,
  });

  return { tone: "dark", backgroundCss: NAVY_GRADIENT_CSS, boxesHtml: boxes };
}
