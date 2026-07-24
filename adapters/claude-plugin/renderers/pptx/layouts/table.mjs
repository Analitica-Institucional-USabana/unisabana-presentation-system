import { CANVAS, SAFE, TYPE_SCALE_PT, px2in } from "../constants.mjs";
import { addTitle } from "../elements.mjs";

// Tabla nativa de PowerPoint (addTable) — celda a celda editable, análogo a la
// <table> real del renderer HTML (la excepción explícita al flatten que permite
// claude-design-system/CLAUDE.md para contenido tabular).
export default function renderTable(pptxSlide, slide, { colors }) {
  pptxSlide.background = { color: colors.paper };
  const titleY = px2in(SAFE.top + 40);
  addTitle(pptxSlide, slide.title, { x: px2in(SAFE.left), y: titleY, w: px2in(CANVAS.width - SAFE.left - SAFE.right), h: 1, sizePt: TYPE_SCALE_PT.slideTitle, color: colors.sabanaBlue });

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
    y: titleY + 1,
    w: px2in(CANVAS.width - SAFE.left - SAFE.right),
    fontFace: "Libre Franklin",
    border: { type: "solid", color: colors.ink200, pt: 0.5 },
  });

  return "light";
}
