import { CANVAS, SAFE, CONTENT_COLUMN_GAP, TYPE_SCALE_PX, FOOTER_ZONE_HEIGHT, BANNER_HEIGHT_PX, BANNER_GAP_PX, PROGRESS_HEIGHT_PX, PROGRESS_GAP_PX, centeredContentY } from "../constants.mjs";
import { title, bodyText, statBlock, banner, progressBar } from "../elements.mjs";
import { estimateBlockHeightPx } from "../text-measure.mjs";
import { iconMarkup } from "../icons.mjs";

export default function renderData(slide, { repoRoot } = {}) {
  const boxes = [];
  const titleWidth = CANVAS.width - SAFE.left - SAFE.right;
  const titleHeight = estimateBlockHeightPx(slide.title, { sizePx: TYPE_SCALE_PX.slideTitle, widthPx: titleWidth, weight: "black" });

  const n = slide.stats.length;
  const availWidth = CANVAS.width - SAFE.left - SAFE.right;
  const statWidth = (availWidth - CONTENT_COLUMN_GAP * (n - 1)) / n;
  const valueSizePx = n <= 2 ? 96 : n <= 4 ? 72 : 56;
  // planning/08-visual-quality-and-layout-fixes.md backlog #1: estimación
  // generosa de la altura real de la tarjeta (valor + delta + label + caption
  // + padding), no una medición exacta (D-18 sigue sin adoptarse).
  const statCardHeight = valueSizePx + 120;
  const bannerBlockHeight = slide.banner ? BANNER_GAP_PX + BANNER_HEIGHT_PX : 0;
  const progressBlockHeight = slide.progress ? PROGRESS_GAP_PX + PROGRESS_HEIGHT_PX : 0;

  const contentHeight = titleHeight + 60 + statCardHeight + bannerBlockHeight + progressBlockHeight;
  const titleY = centeredContentY("content", contentHeight);
  boxes.push(title(slide.title, { x: SAFE.left, y: titleY, width: titleWidth, sizePx: TYPE_SCALE_PX.slideTitle }));

  const statsY = titleY + titleHeight + 60;
  slide.stats.forEach((stat, i) => {
    const x = SAFE.left + i * (statWidth + CONTENT_COLUMN_GAP);
    const accentColor = stat.accent === "alert" ? "var(--fac-juridicas-500)" : undefined;
    boxes.push(statBlock(stat, { x, y: statsY, width: statWidth, height: statCardHeight, valueSizePx, card: true, accentColor, badge: stat.badge }));
  });

  let belowStatsY = statsY + statCardHeight;
  if (slide.banner) {
    const iconHtml = slide.banner.icon ? iconMarkup(repoRoot, slide.banner.icon, { sizePx: 28 }) : undefined;
    belowStatsY += BANNER_GAP_PX;
    boxes.push(banner({ ...slide.banner, iconHtml }, { x: SAFE.left, y: belowStatsY, width: titleWidth, height: BANNER_HEIGHT_PX }));
    belowStatsY += BANNER_HEIGHT_PX;
  }
  if (slide.progress) {
    belowStatsY += PROGRESS_GAP_PX;
    boxes.push(progressBar(slide.progress, { x: SAFE.left, y: belowStatsY, width: titleWidth, height: PROGRESS_HEIGHT_PX }));
  }

  const sourceLine = `Fuente: ${slide.source} · ${slide.period}`;
  boxes.push(
    bodyText(sourceLine, {
      x: SAFE.left,
      y: CANVAS.height - SAFE.bottom - FOOTER_ZONE_HEIGHT - 4,
      sizePx: TYPE_SCALE_PX.source,
      color: "var(--text-muted)",
    })
  );

  const backgroundCss = slide.background === "tinted" ? "background:var(--surface-tint);" : "background:var(--bg-page);";
  return { tone: "light", backgroundCss, boxesHtml: boxes.join("") };
}
