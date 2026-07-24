import { CANVAS, SAFE, TYPE_SCALE_PX } from "../constants.mjs";
import { box, title, escapeHtml } from "../elements.mjs";

// Única excepción al "sin flex/grid" del flatten mecánico: una <table> real es
// explícitamente el caso permitido por claude-design-system/CLAUDE.md para
// contenido tabular ("o una tabla real editable celda a celda").
export default function renderTable(slide) {
  const boxes = [];
  const titleY = SAFE.top + 40;
  boxes.push(title(slide.title, { x: SAFE.left, y: titleY, width: CANVAS.width - SAFE.left - SAFE.right, sizePx: TYPE_SCALE_PX.slideTitle }));

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

  const tableY = titleY + Math.round(TYPE_SCALE_PX.slideTitle * 1.15) + 40;
  boxes.push(box({ x: SAFE.left, y: tableY, width: CANVAS.width - SAFE.left - SAFE.right, html: tableHtml }));

  return { tone: "light", backgroundCss: "background:var(--bg-page);", boxesHtml: boxes.join("") };
}
