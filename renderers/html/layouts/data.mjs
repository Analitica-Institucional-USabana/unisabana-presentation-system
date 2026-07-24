import { CANVAS, SAFE, CONTENT_COLUMN_GAP, TYPE_SCALE_PX, FOOTER_ZONE_HEIGHT } from "../constants.mjs";
import { title, bodyText, statBlock } from "../elements.mjs";

export default function renderData(slide) {
  const boxes = [];
  const titleY = SAFE.top + 40;
  boxes.push(title(slide.title, { x: SAFE.left, y: titleY, width: CANVAS.width - SAFE.left - SAFE.right, sizePx: TYPE_SCALE_PX.slideTitle }));

  const statsY = titleY + Math.round(TYPE_SCALE_PX.slideTitle * 1.15) + 60;
  const n = slide.stats.length;
  const availWidth = CANVAS.width - SAFE.left - SAFE.right;
  const statWidth = (availWidth - CONTENT_COLUMN_GAP * (n - 1)) / n;
  const valueSizePx = n <= 2 ? 96 : n <= 4 ? 72 : 56;

  slide.stats.forEach((stat, i) => {
    const x = SAFE.left + i * (statWidth + CONTENT_COLUMN_GAP);
    boxes.push(statBlock(stat, { x, y: statsY, width: statWidth, valueSizePx }));
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
