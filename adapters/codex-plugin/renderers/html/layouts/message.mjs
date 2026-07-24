import { CANVAS, SAFE, BANNER_HEIGHT_PX, BANNER_GAP_PX, centeredContentY } from "../constants.mjs";
import { title, bodyText, banner } from "../elements.mjs";
import { estimateBlockHeightPx } from "../text-measure.mjs";
import { iconMarkup } from "../icons.mjs";

export default function renderMessage(slide, { repoRoot } = {}) {
  const titleHeight = estimateBlockHeightPx(slide.title, { sizePx: 56, widthPx: 1000, weight: "black" });
  // bodyText() aplica siempre line-height:var(--lh-body) = 1.55 (core/brand/tokens.css) — la medición debe usar el mismo valor.
  const supportingHeight = slide.supporting
    ? estimateBlockHeightPx(slide.supporting, { sizePx: 24, widthPx: 900, weight: "regular", lineHeight: 1.55 })
    : 0;
  const bannerBlockHeight = slide.banner ? BANNER_GAP_PX + BANNER_HEIGHT_PX : 0;
  const contentHeight = titleHeight + 24 + supportingHeight + bannerBlockHeight;

  let y = centeredContentY("content", contentHeight);
  const boxes = [];
  boxes.push(title(slide.title, { x: SAFE.left, y, width: 1000, sizePx: 56 }));
  y += titleHeight + 24;
  if (slide.supporting) {
    boxes.push(bodyText(slide.supporting, { x: SAFE.left, y, width: 900, sizePx: 24 }));
    y += supportingHeight + 24;
  }
  if (slide.banner) {
    const bannerWidth = CANVAS.width - SAFE.left - SAFE.right;
    const iconHtml = slide.banner.icon ? iconMarkup(repoRoot, slide.banner.icon, { sizePx: 28 }) : undefined;
    boxes.push(banner({ ...slide.banner, iconHtml }, { x: SAFE.left, y, width: bannerWidth, height: BANNER_HEIGHT_PX }));
  }
  const backgroundCss = slide.background === "tinted" ? "background:var(--surface-tint);" : "background:var(--bg-page);";
  return { tone: "light", backgroundCss, boxesHtml: boxes.join("") };
}
