import { CANVAS, SAFE, CONTENT_COLUMN_GAP, TYPE_SCALE_PX, contentBand } from "../constants.mjs";
import { box, title, surfaceStyle, escapeHtml, statusCard } from "../elements.mjs";
import { estimateBlockHeightPx, estimateStatusCardHeightPx, estimateBulletCardHeightPx } from "../text-measure.mjs";

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
    // planning/09-visual-richness-and-content-density.md #2: una columna con
    // `stats`/`badge` se compone como tarjeta de comparación con estado; el
    // bullet-card plano existente queda intacto para columnas sin esos campos
    // (evita una regresión visual en decks que no usan la primitiva nueva).
    // planning/10-...md #2: la tarjeta nunca es más chica que lo medido — si
    // heading+stats+points necesita más que el resto de banda disponible
    // (colsHeight), la tarjeta crece más allá en vez de dejar que el
    // contenido se desborde en silencio por debajo de su borde visible
    // (error1.png: badges ya no envuelven, pero los bullets sí se salían).
    // Si crece más allá de contentBand().bottom, validators/rules/footer-
    // overflow.mjs (Capa B) lo detecta como error en vez de pasar en silencio.
    const innerWidth = colWidth - 48;
    if (col.stats?.length || col.badge) {
      const cardHeight = Math.max(colsHeight, estimateStatusCardHeightPx(col, innerWidth));
      boxes.push(
        statusCard(
          { heading: col.heading, badge: col.badge, accent: col.accent, stats: col.stats, points: col.points },
          { x, y: colsY, width: colWidth, height: cardHeight }
        )
      );
      return;
    }
    const cardHeight = Math.max(colsHeight, estimateBulletCardHeightPx(col, innerWidth));
    const pointsHtml = col.points
      .map((p) => `<div style="font-size:18px;color:var(--text-body);line-height:var(--lh-body);margin-bottom:10px;">• ${escapeHtml(p)}</div>`)
      .join("");
    const inner = `<div style="${surfaceStyle({ accentEdge: "top" })}padding:24px;height:100%;box-sizing:border-box;font-family:var(--font-sans);"><div style="font-size:22px;font-weight:var(--fw-bold);color:var(--text-strong);margin-bottom:16px;">${escapeHtml(col.heading)}</div>${pointsHtml}</div>`;
    boxes.push(box({ x, y: colsY, width: colWidth, height: cardHeight, html: inner }));
  });

  const backgroundCss = slide.background === "tinted" ? "background:var(--surface-tint);" : "background:var(--bg-page);";
  return { tone: "light", backgroundCss, boxesHtml: boxes.join("") };
}
