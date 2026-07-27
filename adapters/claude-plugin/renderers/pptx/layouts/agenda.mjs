import { CANVAS, SAFE, CONTENT_COLUMN_GAP, CONTENT_ROW_GAP, TYPE_SCALE_PX, centeredContentYIn, px2in, px2pt } from "../constants.mjs";
import { addTitle } from "../elements.mjs";
import { estimateBlockHeightPx } from "../../html/text-measure.mjs";

const ROW_HEIGHT_PX = 64;
const GRID_CARD_HEIGHT_PX = 132;

export default function renderAgenda(pptxSlide, slide, { colors }) {
  pptxSlide.background = { color: slide.background === "tinted" ? colors.surfaceTint : colors.paper };
  const titleText = slide.title || "Agenda";

  if (slide.layout === "grid") {
    renderGrid(pptxSlide, slide, titleText, colors);
  } else {
    renderList(pptxSlide, slide, titleText, colors);
  }
  return "light";
}

function renderList(pptxSlide, slide, titleText, colors) {
  const titleHeightPx = estimateBlockHeightPx(titleText, { sizePx: TYPE_SCALE_PX.slideTitle, widthPx: 700, weight: "black" });
  // planning/10-...md #2: altura de fila medida (mirror de renderers/html/layouts/agenda.mjs).
  const itemTextWidthPx = 8 * 96 - 70; // w:8in @96dpi menos el prefijo numerado
  const rowHeightsPx = slide.items.map((item) =>
    Math.max(ROW_HEIGHT_PX, estimateBlockHeightPx(item, { sizePx: 15 / 0.75, widthPx: itemTextWidthPx, weight: "bold", lineHeight: 1.3 }) + 20)
  );
  const itemsHeightPx = rowHeightsPx.reduce((a, b) => a + b, 0);
  const contentHeightPx = titleHeightPx + 48 + itemsHeightPx;

  let y = centeredContentYIn("content", contentHeightPx);
  addTitle(pptxSlide, titleText, { x: px2in(SAFE.left), y, w: 6, h: px2in(titleHeightPx), sizePt: px2pt(TYPE_SCALE_PX.slideTitle), color: colors.sabanaBlue });
  y += px2in(titleHeightPx + 48);

  slide.items.forEach((item, i) => {
    const num = String(i + 1).padStart(2, "0");
    pptxSlide.addText(
      [
        { text: `${num}  `, options: { fontSize: 18, bold: true, color: colors.accent } },
        { text: item, options: { fontSize: 15, bold: true, color: colors.sabanaBlue } },
      ],
      { x: px2in(SAFE.left), y, w: 8, h: px2in(rowHeightsPx[i]), fontFace: "Libre Franklin" }
    );
    y += px2in(rowHeightsPx[i]);
  });
}

// Grid N×M (planning/09-visual-richness-and-content-density.md #3): mismo
// número como marca de agua grande en accent100, mirror del renderer HTML.
function renderGrid(pptxSlide, slide, titleText, colors) {
  const titleWidthPx = CANVAS.width - SAFE.left - SAFE.right;
  const titleHeightPx = estimateBlockHeightPx(titleText, { sizePx: TYPE_SCALE_PX.slideTitle, widthPx: titleWidthPx, weight: "black" });

  const n = slide.items.length;
  const cols = n <= 4 ? 2 : 3;
  const rows = Math.ceil(n / cols);
  const cardWidthPx = (titleWidthPx - CONTENT_COLUMN_GAP * (cols - 1)) / cols;
  const cardTextWidthPx = cardWidthPx - 0.44 * 96; // w: cardWidthIn - 0.44 (ver addText item más abajo)

  // planning/10-...md #2: altura de fila medida (mirror de renderers/html/layouts/agenda.mjs).
  const itemHeightsPx = slide.items.map((item) =>
    Math.max(GRID_CARD_HEIGHT_PX, estimateBlockHeightPx(item, { sizePx: 14 / 0.75, widthPx: cardTextWidthPx, weight: "bold", lineHeight: 1.3 }) + 40)
  );
  const rowHeightsPx = [];
  for (let r = 0; r < rows; r++) {
    rowHeightsPx.push(Math.max(...itemHeightsPx.slice(r * cols, r * cols + cols)));
  }
  const gridHeightPx = rowHeightsPx.reduce((a, b) => a + b, 0) + (rows - 1) * CONTENT_ROW_GAP;

  const contentHeightPx = titleHeightPx + 48 + gridHeightPx;
  let y = centeredContentYIn("content", contentHeightPx);
  addTitle(pptxSlide, titleText, { x: px2in(SAFE.left), y, w: px2in(titleWidthPx), h: px2in(titleHeightPx), sizePt: px2pt(TYPE_SCALE_PX.slideTitle), color: colors.sabanaBlue });
  y += px2in(titleHeightPx + 48);

  const cardWidthIn = px2in(cardWidthPx);
  const gapIn = px2in(CONTENT_COLUMN_GAP);
  const rowGapIn = px2in(CONTENT_ROW_GAP);

  const rowOffsetsIn = [];
  let accIn = y;
  for (let r = 0; r < rows; r++) {
    rowOffsetsIn.push(accIn);
    accIn += px2in(rowHeightsPx[r]) + rowGapIn;
  }

  slide.items.forEach((item, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = px2in(SAFE.left) + col * (cardWidthIn + gapIn);
    const cardY = rowOffsetsIn[row];
    const cardHeightIn = px2in(rowHeightsPx[row]);
    const num = String(i + 1).padStart(2, "0");

    pptxSlide.addShape("rect", { x, y: cardY, w: cardWidthIn, h: cardHeightIn, fill: { color: colors.paper }, line: { color: colors.ink200, width: 0.75 } });
    pptxSlide.addText(num, {
      x: x + cardWidthIn - 1.3,
      y: cardY - 0.06,
      w: 1.3,
      h: cardHeightIn * 0.75,
      fontFace: "Libre Franklin",
      fontSize: 54,
      bold: true,
      color: colors.accent100,
      align: "right",
      valign: "top",
    });
    pptxSlide.addText(item, {
      x: x + 0.22,
      y: cardY + 0.18,
      w: cardWidthIn - 0.44,
      h: cardHeightIn - 0.36,
      fontFace: "Libre Franklin",
      fontSize: 14,
      bold: true,
      color: colors.sabanaBlue,
      valign: "top",
    });
  });
}
