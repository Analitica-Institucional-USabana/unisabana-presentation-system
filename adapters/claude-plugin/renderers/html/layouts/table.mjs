import { CANVAS, SAFE, TYPE_SCALE_PX, centeredContentY } from "../constants.mjs";
import { box, title, escapeHtml } from "../elements.mjs";
import { estimateBlockHeightPx, estimateLineCount } from "../text-measure.mjs";

const ROW_HEIGHT_PX = 42;

// Única excepción al "sin flex/grid" del flatten mecánico: una <table> real es
// explícitamente el caso permitido por claude-design-system/CLAUDE.md para
// contenido tabular ("o una tabla real editable celda a celda").
export default function renderTable(slide) {
  const boxes = [];
  const titleWidth = CANVAS.width - SAFE.left - SAFE.right;
  const titleHeight = estimateBlockHeightPx(slide.title, { sizePx: TYPE_SCALE_PX.slideTitle, widthPx: titleWidth, weight: "black" });

  // Altura estimada de la tabla renderizada (encabezado + filas), suficiente
  // para decidir si el título+tabla caben centrados o deben anclarse arriba
  // y desbordar hacia abajo — no se mide el DOM real (D-18 no adoptada). La
  // <table> real se autodimensiona en el navegador (celda a celda, sin
  // clipping), así que esta estimación no puede impedir un desborde real
  // hacia el pie — eso lo cubre validators/rules/footer-overflow.mjs (Capa B,
  // planning/10-...md #2). Aun así, medir la celda más ancha de cada fila da
  // una estimación de altura razonable para centrar el bloque título+tabla.
  const colWidthPx = (CANVAS.width - SAFE.left - SAFE.right) / slide.columns.length;
  const estimatedTableHeight = slide.rows.reduce((sum, row) => {
    const maxLines = Math.max(1, ...row.map((cell) => estimateLineCount(String(cell), { sizePx: 16, widthPx: colWidthPx - 32, weight: "regular" })));
    return sum + Math.max(ROW_HEIGHT_PX, Math.round(maxLines * 16 * 1.3) + 20);
  }, ROW_HEIGHT_PX);
  const contentHeight = titleHeight + 40 + estimatedTableHeight;

  const titleY = centeredContentY("content", contentHeight);
  boxes.push(title(slide.title, { x: SAFE.left, y: titleY, width: titleWidth, sizePx: TYPE_SCALE_PX.slideTitle }));

  const highlighted = new Set((slide.highlightCells || []).map(([r, c]) => `${r}:${c}`));
  const headerCells = slide.columns
    .map(
      (c) =>
        `<th style="text-align:left;padding:10px 16px;font-size:16px;font-weight:var(--fw-bold);color:var(--paper);background:var(--accent);">${escapeHtml(c)}</th>`
    )
    .join("");

  const bodyRows = slide.rows
    .map((row, r) => {
      const cells = row
        .map((cell, c) => {
          const isHighlighted = highlighted.has(`${r}:${c}`);
          const bg = isHighlighted ? "background:var(--accent-100);" : "";
          const weight = isHighlighted ? "font-weight:var(--fw-bold);" : "";
          return `<td style="padding:10px 16px;font-size:16px;color:var(--text-body);border-bottom:1px solid var(--border-subtle);${bg}${weight}">${escapeHtml(cell)}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  const tableHtml = `<table style="border-collapse:collapse;width:100%;font-family:var(--font-sans);"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;

  const tableY = titleY + titleHeight + 40;
  boxes.push(box({ x: SAFE.left, y: tableY, width: CANVAS.width - SAFE.left - SAFE.right, html: tableHtml }));

  const backgroundCss = slide.background === "tinted" ? "background:var(--surface-tint);" : "background:var(--bg-page);";
  return { tone: "light", backgroundCss, boxesHtml: boxes.join("") };
}
