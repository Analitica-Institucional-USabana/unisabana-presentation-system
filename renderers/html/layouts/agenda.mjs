import { CANVAS, SAFE, CONTENT_COLUMN_GAP, CONTENT_ROW_GAP, TYPE_SCALE_PX, centeredContentY } from "../constants.mjs";
import { box, title, surfaceStyle, escapeHtml } from "../elements.mjs";
import { estimateBlockHeightPx } from "../text-measure.mjs";

const ROW_HEIGHT = 64;
const GRID_CARD_HEIGHT = 132;

export default function renderAgenda(slide) {
  const titleText = slide.title || "Agenda";
  const backgroundCss = slide.background === "tinted" ? "background:var(--surface-tint);" : "background:var(--bg-page);";

  if (slide.layout === "grid") {
    return renderGrid(slide, titleText, backgroundCss);
  }
  return renderList(slide, titleText, backgroundCss);
}

function renderList(slide, titleText, backgroundCss) {
  const titleHeight = estimateBlockHeightPx(titleText, { sizePx: TYPE_SCALE_PX.slideTitle, widthPx: 700, weight: "black" });
  const itemsHeight = slide.items.length * ROW_HEIGHT;
  const contentHeight = titleHeight + 48 + itemsHeight;

  let y = centeredContentY("content", contentHeight);
  const boxes = [];
  boxes.push(title(titleText, { x: SAFE.left, y, width: 700, sizePx: TYPE_SCALE_PX.slideTitle }));
  y += titleHeight + 48;

  for (let i = 0; i < slide.items.length; i++) {
    const num = String(i + 1).padStart(2, "0");
    boxes.push(
      box({
        x: SAFE.left,
        y,
        width: 900,
        style: "display:flex;align-items:center;gap:20px;font-family:var(--font-sans);",
        html: `<span style="font-size:28px;font-weight:var(--fw-black);color:var(--accent);min-width:52px;">${num}</span><span style="font-size:22px;font-weight:var(--fw-medium);color:var(--text-strong);">${escapeHtml(slide.items[i])}</span>`,
      })
    );
    y += ROW_HEIGHT;
  }

  return { tone: "light", backgroundCss, boxesHtml: boxes.join("") };
}

// Grid N×M (planning/09-visual-richness-and-content-density.md #3): mismas
// tarjetas de siempre (surfaceStyle) con el número como marca de agua
// tipográfica grande en --accent-100, en vez de lista vertical de una columna.
function renderGrid(slide, titleText, backgroundCss) {
  const titleWidth = CANVAS.width - SAFE.left - SAFE.right;
  const titleHeight = estimateBlockHeightPx(titleText, { sizePx: TYPE_SCALE_PX.slideTitle, widthPx: titleWidth, weight: "black" });

  const n = slide.items.length;
  const cols = n <= 4 ? 2 : 3;
  const rows = Math.ceil(n / cols);
  const cardWidth = (titleWidth - CONTENT_COLUMN_GAP * (cols - 1)) / cols;
  const gridHeight = rows * GRID_CARD_HEIGHT + (rows - 1) * CONTENT_ROW_GAP;

  const contentHeight = titleHeight + 48 + gridHeight;
  let y = centeredContentY("content", contentHeight);
  const boxes = [];
  boxes.push(title(titleText, { x: SAFE.left, y, width: titleWidth, sizePx: TYPE_SCALE_PX.slideTitle }));
  y += titleHeight + 48;

  const gridTop = y;
  slide.items.forEach((item, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = SAFE.left + col * (cardWidth + CONTENT_COLUMN_GAP);
    const cardY = gridTop + row * (GRID_CARD_HEIGHT + CONTENT_ROW_GAP);
    const num = String(i + 1).padStart(2, "0");
    const inner =
      `<div style="${surfaceStyle()}padding:20px 24px;height:100%;box-sizing:border-box;position:relative;overflow:hidden;font-family:var(--font-sans);">` +
      `<span style="position:absolute;top:-8px;right:14px;font-size:80px;font-weight:var(--fw-black);color:var(--accent-100);line-height:1;">${num}</span>` +
      `<span style="position:relative;font-size:19px;font-weight:var(--fw-semibold);color:var(--text-strong);">${escapeHtml(item)}</span>` +
      `</div>`;
    boxes.push(box({ x, y: cardY, width: cardWidth, height: GRID_CARD_HEIGHT, html: inner }));
  });

  return { tone: "light", backgroundCss, boxesHtml: boxes.join("") };
}
