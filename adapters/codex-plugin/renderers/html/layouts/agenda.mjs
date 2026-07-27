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

// planning/10-...md #2: cada fila mide su propio texto (en vez de asumir
// ROW_HEIGHT fijo para cualquier item) — un item largo que envuelve a 2+
// líneas ya no empuja/solapa la fila siguiente, porque box() es
// position:absolute y no reserva espacio dinámico por sí solo.
const ITEM_TEXT_WIDTH = 900 - 52 - 20; // ancho de la fila - min-width del número - gap

function renderList(slide, titleText, backgroundCss) {
  const titleHeight = estimateBlockHeightPx(titleText, { sizePx: TYPE_SCALE_PX.slideTitle, widthPx: 700, weight: "black" });
  const rowHeights = slide.items.map((item) =>
    Math.max(ROW_HEIGHT, estimateBlockHeightPx(item, { sizePx: 22, widthPx: ITEM_TEXT_WIDTH, weight: "medium", lineHeight: 1.3 }) + 24)
  );
  const itemsHeight = rowHeights.reduce((a, b) => a + b, 0);
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
    y += rowHeights[i];
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
  const cardTextWidth = cardWidth - 48; // padding 24px izquierda+derecha (20px 24px)

  // planning/10-...md #2: altura de fila = máximo item medido en esa fila, no
  // GRID_CARD_HEIGHT fijo — un item largo ya no queda recortado por el
  // overflow:hidden de la tarjeta.
  const itemHeights = slide.items.map((item) =>
    Math.max(GRID_CARD_HEIGHT, estimateBlockHeightPx(item, { sizePx: 19, widthPx: cardTextWidth, weight: "semibold", lineHeight: 1.3 }) + 40)
  );
  const rowHeights = [];
  for (let r = 0; r < rows; r++) {
    rowHeights.push(Math.max(...itemHeights.slice(r * cols, r * cols + cols)));
  }
  const gridHeight = rowHeights.reduce((a, b) => a + b, 0) + (rows - 1) * CONTENT_ROW_GAP;

  const contentHeight = titleHeight + 48 + gridHeight;
  let y = centeredContentY("content", contentHeight);
  const boxes = [];
  boxes.push(title(titleText, { x: SAFE.left, y, width: titleWidth, sizePx: TYPE_SCALE_PX.slideTitle }));
  y += titleHeight + 48;

  const rowOffsets = [];
  let acc = y;
  for (let r = 0; r < rows; r++) {
    rowOffsets.push(acc);
    acc += rowHeights[r] + CONTENT_ROW_GAP;
  }

  slide.items.forEach((item, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = SAFE.left + col * (cardWidth + CONTENT_COLUMN_GAP);
    const cardY = rowOffsets[row];
    const cardHeight = rowHeights[row];
    const num = String(i + 1).padStart(2, "0");
    const inner =
      `<div style="${surfaceStyle()}padding:20px 24px;height:100%;box-sizing:border-box;position:relative;overflow:hidden;font-family:var(--font-sans);">` +
      `<span style="position:absolute;top:-8px;right:14px;font-size:80px;font-weight:var(--fw-black);color:var(--accent-100);line-height:1;">${num}</span>` +
      `<span style="position:relative;font-size:19px;font-weight:var(--fw-semibold);color:var(--text-strong);">${escapeHtml(item)}</span>` +
      `</div>`;
    boxes.push(box({ x, y: cardY, width: cardWidth, height: cardHeight, html: inner }));
  });

  return { tone: "light", backgroundCss, boxesHtml: boxes.join("") };
}
