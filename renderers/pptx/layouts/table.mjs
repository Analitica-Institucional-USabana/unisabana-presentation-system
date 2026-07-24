import { CANVAS, SAFE, TYPE_SCALE_PX, centeredContentYIn, px2in, px2pt } from "../constants.mjs";
import { addTitle } from "../elements.mjs";
import { estimateBlockHeightPx } from "../../html/text-measure.mjs";

const ROW_HEIGHT_PX = 42;

// Tabla nativa de PowerPoint (addTable) — celda a celda editable, análogo a la
// <table> real del renderer HTML (la excepción explícita al flatten que permite
// claude-design-system/CLAUDE.md para contenido tabular).
export default function renderTable(pptxSlide, slide, { colors }) {
  pptxSlide.background = { color: slide.background === "tinted" ? colors.surfaceTint : colors.paper };

  const titleWidthPx = CANVAS.width - SAFE.left - SAFE.right;
  const titleHeightPx = estimateBlockHeightPx(slide.title, { sizePx: TYPE_SCALE_PX.slideTitle, widthPx: titleWidthPx, weight: "black" });
  const estimatedTableHeightPx = ROW_HEIGHT_PX * (1 + slide.rows.length);
  const contentHeightPx = titleHeightPx + 40 + estimatedTableHeightPx;

  const titleY = centeredContentYIn("content", contentHeightPx);
  addTitle(pptxSlide, slide.title, { x: px2in(SAFE.left), y: titleY, w: px2in(titleWidthPx), h: px2in(titleHeightPx), sizePt: px2pt(TYPE_SCALE_PX.slideTitle), color: colors.sabanaBlue });

  const highlighted = new Set((slide.highlightCells || []).map(([r, c]) => `${r}:${c}`));
  const headerRow = slide.columns.map((c) => ({
    text: c,
    options: { bold: true, fill: { color: colors.accent }, color: "FFFFFF", fontSize: 12 },
  }));
  const bodyRows = slide.rows.map((row, r) =>
    row.map((cell, c) => ({
      text: cell,
      options: highlighted.has(`${r}:${c}`)
        ? { bold: true, fill: { color: colors.accent100 }, fontSize: 12, color: colors.ink700 }
        : { fontSize: 12, color: colors.ink700 },
    }))
  );

  pptxSlide.addTable([headerRow, ...bodyRows], {
    x: px2in(SAFE.left),
    y: titleY + px2in(titleHeightPx + 40),
    w: px2in(CANVAS.width - SAFE.left - SAFE.right),
    fontFace: "Libre Franklin",
    border: { type: "solid", color: colors.ink200, pt: 0.5 },
  });

  return "light";
}
