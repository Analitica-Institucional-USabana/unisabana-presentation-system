import { CANVAS, SAFE, TYPE_SCALE_PX, centeredContentY } from "../constants.mjs";
import { box, title, escapeHtml } from "../elements.mjs";
import { estimateBlockHeightPx } from "../text-measure.mjs";

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
  // y desbordar hacia abajo — no se mide el DOM real (D-18 no adoptada).
  const estimatedTableHeight = ROW_HEIGHT_PX * (1 + slide.rows.length);
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
