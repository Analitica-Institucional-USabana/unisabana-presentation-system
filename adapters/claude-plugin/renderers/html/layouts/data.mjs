import { CANVAS, SAFE, CONTENT_COLUMN_GAP, TYPE_SCALE_PX, FOOTER_ZONE_HEIGHT, centeredContentY } from "../constants.mjs";
import { title, bodyText, statBlock } from "../elements.mjs";
import { estimateBlockHeightPx } from "../text-measure.mjs";

export default function renderData(slide) {
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

  const contentHeight = titleHeight + 60 + statCardHeight;
  const titleY = centeredContentY("content", contentHeight);
  boxes.push(title(slide.title, { x: SAFE.left, y: titleY, width: titleWidth, sizePx: TYPE_SCALE_PX.slideTitle }));

  const statsY = titleY + titleHeight + 60;
  slide.stats.forEach((stat, i) => {
    const x = SAFE.left + i * (statWidth + CONTENT_COLUMN_GAP);
    boxes.push(statBlock(stat, { x, y: statsY, width: statWidth, height: statCardHeight, valueSizePx, card: true }));
  });

  const sourceLine = `Fuente: ${slide.source} · ${slide.period}`;
  boxes.push(
    bodyText(sourceLine, {
      x: SAFE.left,
      y: CANVAS.height - SAFE.bottom - FOOTER_ZONE_HEIGHT - 4,
      sizePx: TYPE_SCALE_PX.source,
      color: "var(--text-muted)",
    })
  );

  return { tone: "light", backgroundCss: "background:var(--bg-page);", boxesHtml: boxes.join("") };
}
