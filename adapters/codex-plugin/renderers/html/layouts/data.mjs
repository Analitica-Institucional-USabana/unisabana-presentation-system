import { CANVAS, SAFE, CONTENT_COLUMN_GAP, CONTENT_ROW_GAP, TYPE_SCALE_PX, FOOTER_ZONE_HEIGHT, BANNER_HEIGHT_PX, BANNER_GAP_PX, PROGRESS_HEIGHT_PX, PROGRESS_GAP_PX, contentBand, centeredContentY } from "../constants.mjs";
import { box, title, bodyText, statBlock, banner, progressBar } from "../elements.mjs";
import { estimateBlockHeightPx } from "../text-measure.mjs";
import { iconMarkup } from "../icons.mjs";
import { renderFittedChartBlock, chartWidthPx } from "../chart-block.mjs";

// Un chart y una fila de cifras compiten por la misma banda vertical — antes
// se apilaba "stats grandes" y el chart debajo, y cualquier chart de tamaño
// normal se salía de contentBand() (bug reportado 2026-08-31: "los gráficos
// se salen de la slide"). En vez de eso van lado a lado: una columna angosta
// de cifras + el chart ocupando el resto del ancho, ambos acotados a la
// misma altura disponible — nunca más alto que lo que realmente queda.
//
// El título ya no va arriba a ancho completo — eso le restaba a la fila toda
// su altura antes de que el chart pudiera usarla. Se reubica DENTRO de la
// columna angosta de cifras (planning/09 adenda 2026-08-31, "reubicar el
// título" pedido por el usuario tras ver que el radar/donut seguían viéndose
// chicos) — el chart arranca desde band.top igual que el título y usa la
// banda de contenido completa, no lo que sobra después del título.
const TITLE_IN_COLUMN_SIZE_PX = 26;

function renderDataWithChart(slide, { repoRoot, titleWidth, availWidth }) {
  const boxes = [];
  const bannerBlockHeight = slide.banner ? BANNER_GAP_PX + BANNER_HEIGHT_PX : 0;
  const progressBlockHeight = slide.progress ? PROGRESS_GAP_PX + PROGRESS_HEIGHT_PX : 0;

  const band = contentBand("content");
  const rowTop = band.top;
  // -20 de más: estimateBlockHeightPx es una heurística, no una medida
  // pixel-perfecta del texto ya renderizado (mismo margen que message.mjs).
  const rowHeight = Math.max(80, band.bottom - rowTop - bannerBlockHeight - progressBlockHeight - 20);

  const n = slide.stats.length;
  const statsColWidth = Math.min(280, availWidth * 0.26);
  const chartColWidth = availWidth - statsColWidth - CONTENT_COLUMN_GAP;

  const titleHeight = estimateBlockHeightPx(slide.title, { sizePx: TITLE_IN_COLUMN_SIZE_PX, widthPx: statsColWidth, weight: "black" });
  boxes.push(title(slide.title, { x: SAFE.left, y: rowTop, width: statsColWidth, sizePx: TITLE_IN_COLUMN_SIZE_PX }));

  const statsTop = rowTop + titleHeight + 20;
  const statsAvailHeight = Math.max(60, rowHeight - titleHeight - 20);
  const perStatHeight = (statsAvailHeight - CONTENT_ROW_GAP * (n - 1)) / n;
  const valueSizePx = n <= 2 ? 56 : 40;
  slide.stats.forEach((stat, i) => {
    const y = statsTop + i * (perStatHeight + CONTENT_ROW_GAP);
    const accentColor = stat.accent === "alert" ? "var(--fac-juridicas-500)" : undefined;
    boxes.push(statBlock(stat, { x: SAFE.left, y, width: statsColWidth, height: perStatHeight, valueSizePx, card: true, accentColor, badge: stat.badge }));
  });

  const chartX = SAFE.left + statsColWidth + CONTENT_COLUMN_GAP;
  const chartW = chartWidthPx(slide.chart, chartColWidth, rowHeight);
  const chartResult = renderFittedChartBlock(slide.chart, { widthPx: chartW, repoRoot }, rowHeight);
  boxes.push(
    box({
      x: chartX + (chartColWidth - chartResult.widthPx) / 2,
      y: rowTop,
      width: chartResult.widthPx,
      height: chartResult.heightPx,
      html: chartResult.html,
    })
  );

  let belowRowY = rowTop + rowHeight;
  if (slide.banner) {
    const iconHtml = slide.banner.icon ? iconMarkup(repoRoot, slide.banner.icon, { sizePx: 28 }) : undefined;
    belowRowY += BANNER_GAP_PX;
    boxes.push(banner({ ...slide.banner, iconHtml }, { x: SAFE.left, y: belowRowY, width: titleWidth, height: BANNER_HEIGHT_PX }));
    belowRowY += BANNER_HEIGHT_PX;
  }
  if (slide.progress) {
    belowRowY += PROGRESS_GAP_PX;
    boxes.push(progressBar(slide.progress, { x: SAFE.left, y: belowRowY, width: titleWidth, height: PROGRESS_HEIGHT_PX }));
    belowRowY += PROGRESS_HEIGHT_PX;
  }

  const sourceLine = `Fuente: ${slide.source} · ${slide.period}`;
  const sourceFloorY = CANVAS.height - SAFE.bottom - FOOTER_ZONE_HEIGHT - 4;
  boxes.push(
    bodyText(sourceLine, { x: SAFE.left, y: Math.min(belowRowY + 16, sourceFloorY), sizePx: TYPE_SCALE_PX.source, color: "var(--text-muted)" })
  );

  const backgroundCss = slide.background === "tinted" ? "background:var(--surface-tint);" : "background:var(--bg-page);";
  return { tone: "light", backgroundCss, boxesHtml: boxes.join("") };
}

export default function renderData(slide, { repoRoot } = {}) {
  const titleWidth = CANVAS.width - SAFE.left - SAFE.right;
  const availWidth = CANVAS.width - SAFE.left - SAFE.right;
  if (slide.chart) return renderDataWithChart(slide, { repoRoot, titleWidth, availWidth });

  const boxes = [];
  const titleHeight = estimateBlockHeightPx(slide.title, { sizePx: TYPE_SCALE_PX.slideTitle, widthPx: titleWidth, weight: "black" });

  const n = slide.stats.length;
  const statWidth = (availWidth - CONTENT_COLUMN_GAP * (n - 1)) / n;
  const valueSizePx = n <= 2 ? 96 : n <= 4 ? 72 : 56;
  // planning/10-numbering-footer-safety-logo-and-multiplatform-branding.md #2:
  // altura real por tarjeta = valor/delta + badge (ancho fijo, no envuelve —
  // ver elements.mjs#tag) + label/caption medidos con estimateBlockHeightPx,
  // en vez del heurístico fijo `valueSizePx + 120` (backlog #1 de 08, que no
  // medía label/caption/badge y podía quedarse corto con textos largos).
  const BADGE_ALLOWANCE_PX = 37; // tag(): padding 6px 14px + fs-caption(14px) + margin-bottom 8px
  const CARD_PADDING_PX = 48; // surfaceStyle box-sizing:border-box padding:24px arriba+abajo
  const statCardHeight = Math.max(
    ...slide.stats.map((stat) => {
      let h = valueSizePx;
      if (stat.badge) h += BADGE_ALLOWANCE_PX;
      if (stat.label) h += 4 + estimateBlockHeightPx(stat.label, { sizePx: 24, widthPx: statWidth, weight: "semibold" });
      if (stat.caption) h += 4 + estimateBlockHeightPx(stat.caption, { sizePx: 14, widthPx: statWidth, weight: "regular" });
      return h + CARD_PADDING_PX;
    })
  );
  const bannerBlockHeight = slide.banner ? BANNER_GAP_PX + BANNER_HEIGHT_PX : 0;
  const progressBlockHeight = slide.progress ? PROGRESS_GAP_PX + PROGRESS_HEIGHT_PX : 0;

  const contentHeight = titleHeight + 60 + statCardHeight + bannerBlockHeight + progressBlockHeight;
  const titleY = centeredContentY("content", contentHeight);
  boxes.push(title(slide.title, { x: SAFE.left, y: titleY, width: titleWidth, sizePx: TYPE_SCALE_PX.slideTitle }));

  const statsY = titleY + titleHeight + 60;
  slide.stats.forEach((stat, i) => {
    const x = SAFE.left + i * (statWidth + CONTENT_COLUMN_GAP);
    const accentColor = stat.accent === "alert" ? "var(--fac-juridicas-500)" : undefined;
    boxes.push(statBlock(stat, { x, y: statsY, width: statWidth, height: statCardHeight, valueSizePx, card: true, accentColor, badge: stat.badge }));
  });

  let belowStatsY = statsY + statCardHeight;
  if (slide.banner) {
    const iconHtml = slide.banner.icon ? iconMarkup(repoRoot, slide.banner.icon, { sizePx: 28 }) : undefined;
    belowStatsY += BANNER_GAP_PX;
    boxes.push(banner({ ...slide.banner, iconHtml }, { x: SAFE.left, y: belowStatsY, width: titleWidth, height: BANNER_HEIGHT_PX }));
    belowStatsY += BANNER_HEIGHT_PX;
  }
  if (slide.progress) {
    belowStatsY += PROGRESS_GAP_PX;
    boxes.push(progressBar(slide.progress, { x: SAFE.left, y: belowStatsY, width: titleWidth, height: PROGRESS_HEIGHT_PX }));
    belowStatsY += PROGRESS_HEIGHT_PX;
  }
  // planning/10-...md #2: la línea de fuente fluye después del contenido real
  // (belowStatsY) en vez de anclarse siempre a un Y fijo — el Y fijo anterior
  // pasa a ser el TECHO (nunca más abajo de ahí, para no invadir la banda de
  // atribución IA / numeración); si el contenido real es más alto que el
  // presupuesto, footer-overflow.mjs (Capa B) lo marca como error de validación
  // en vez de dejar que se solape en silencio.
  const sourceLine = `Fuente: ${slide.source} · ${slide.period}`;
  const sourceFloorY = CANVAS.height - SAFE.bottom - FOOTER_ZONE_HEIGHT - 4;
  boxes.push(
    bodyText(sourceLine, {
      x: SAFE.left,
      y: Math.min(belowStatsY + 16, sourceFloorY),
      sizePx: TYPE_SCALE_PX.source,
      color: "var(--text-muted)",
    })
  );

  const backgroundCss = slide.background === "tinted" ? "background:var(--surface-tint);" : "background:var(--bg-page);";
  return { tone: "light", backgroundCss, boxesHtml: boxes.join("") };
}
