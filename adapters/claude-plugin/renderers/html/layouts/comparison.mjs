import { CANVAS, SAFE, CONTENT_COLUMN_GAP, TYPE_SCALE_PX, contentBand } from "../constants.mjs";
import { box, title, surfaceStyle, escapeHtml } from "../elements.mjs";
import { estimateBlockHeightPx } from "../text-measure.mjs";

export default function renderComparison(slide) {
  const boxes = [];
  const band = contentBand("content");
  const titleWidth = CANVAS.width - SAFE.left - SAFE.right;
  const titleHeight = estimateBlockHeightPx(slide.title, { sizePx: TYPE_SCALE_PX.slideTitle, widthPx: titleWidth, weight: "black" });

  const titleY = band.top;
  boxes.push(title(slide.title, { x: SAFE.left, y: titleY, width: titleWidth, sizePx: TYPE_SCALE_PX.slideTitle }));

  const colsY = titleY + titleHeight + 48;
  const colsHeight = band.bottom - colsY;
  const n = slide.columns.length;
  const availWidth = CANVAS.width - SAFE.left - SAFE.right;
  const colWidth = (availWidth - CONTENT_COLUMN_GAP * (n - 1)) / n;

  slide.columns.forEach((col, i) => {
    const x = SAFE.left + i * (colWidth + CONTENT_COLUMN_GAP);
    const pointsHtml = col.points
      .map((p) => `<div style="font-size:18px;color:var(--text-body);line-height:var(--lh-body);margin-bottom:10px;">• ${escapeHtml(p)}</div>`)
      .join("");
    const inner = `<div style="${surfaceStyle({ accentEdge: "top" })}padding:24px;height:100%;box-sizing:border-box;font-family:var(--font-sans);"><div style="font-size:22px;font-weight:var(--fw-bold);color:var(--text-strong);margin-bottom:16px;">${escapeHtml(col.heading)}</div>${pointsHtml}</div>`;
    boxes.push(box({ x, y: colsY, width: colWidth, height: colsHeight, html: inner }));
  });

  return { tone: "light", backgroundCss: "background:var(--bg-page);", boxesHtml: boxes.join("") };
}
