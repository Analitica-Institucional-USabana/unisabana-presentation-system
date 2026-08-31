import { CANVAS, SAFE, CONTENT_COLUMN_GAP, CONTENT_ROW_GAP, TYPE_SCALE_PX, FOOTER_ZONE_HEIGHT, BANNER_HEIGHT_PX, BANNER_GAP_PX, PROGRESS_HEIGHT_PX, PROGRESS_GAP_PX, contentBand, centeredContentYIn, px2in, px2pt } from "../constants.mjs";
import { addTitle, addBody, addStatBlock, addBanner, addProgressBar } from "../elements.mjs";
import { estimateBlockHeightPx } from "../../html/text-measure.mjs";
import { chartWidthPx } from "../../html/chart-block.mjs";
import { addChartBlock } from "../chart-block.mjs";

// Mismo rediseño que renderers/html/layouts/data.mjs#renderDataWithChart:
// título reubicado dentro de la columna angosta de cifras (en vez de ancho
// completo arriba de la fila) + chart al lado, ambos compartiendo la banda
// de contenido completa — antes se apilaba "stats grandes" y el chart
// debajo, y cualquier chart de tamaño normal se salía de contentBand() (bug
// 2026-08-31); después el título arriba de todo seguía robándole altura al
// chart aunque las cifras ya no lo hicieran (2026-08-31, segunda ronda). A
// diferencia del HTML, el chart nativo de pptxgenjs se estira a `h` sin
// truco de escala — el "cap" es directamente el alto que se le da.
const TITLE_IN_COLUMN_SIZE_PX = 26;

function renderDataWithChart(pptxSlide, slide, { colors, repoRoot, titleWidthPx, availWidthPx }) {
  pptxSlide.background = { color: slide.background === "tinted" ? colors.surfaceTint : colors.paper };
  const bannerBlockHeightPx = slide.banner ? BANNER_GAP_PX + BANNER_HEIGHT_PX : 0;
  const progressBlockHeightPx = slide.progress ? PROGRESS_GAP_PX + PROGRESS_HEIGHT_PX : 0;

  const band = contentBand("content");
  const rowTopPx = band.top;
  // -20: mismo margen que el renderer HTML (ver renderers/html/layouts/data.mjs).
  const rowHeightPx = Math.max(80, band.bottom - rowTopPx - bannerBlockHeightPx - progressBlockHeightPx - 20);

  const n = slide.stats.length;
  const statsColWidthPx = Math.min(280, availWidthPx * 0.26);
  const chartColWidthPx = availWidthPx - statsColWidthPx - CONTENT_COLUMN_GAP;

  const titleHeightPx = estimateBlockHeightPx(slide.title, { sizePx: TITLE_IN_COLUMN_SIZE_PX, widthPx: statsColWidthPx, weight: "black" });
  addTitle(pptxSlide, slide.title, { x: px2in(SAFE.left), y: px2in(rowTopPx), w: px2in(statsColWidthPx), h: px2in(titleHeightPx), sizePt: px2pt(TITLE_IN_COLUMN_SIZE_PX), color: colors.sabanaBlue });

  const statsTopPx = rowTopPx + titleHeightPx + 20;
  const statsAvailHeightPx = Math.max(60, rowHeightPx - titleHeightPx - 20);
  const perStatHeightPx = (statsAvailHeightPx - CONTENT_ROW_GAP * (n - 1)) / n;
  const valueSizePt = n <= 2 ? 44 : 30;
  slide.stats.forEach((stat, i) => {
    const y = px2in(statsTopPx + i * (perStatHeightPx + CONTENT_ROW_GAP));
    const accentColor = stat.accent === "alert" ? colors.juridicas500 : undefined;
    addStatBlock(pptxSlide, stat, { x: px2in(SAFE.left), y, w: px2in(statsColWidthPx), valueSizePt, colors, accentColor, badge: stat.badge });
  });

  const chartXPx = SAFE.left + statsColWidthPx + CONTENT_COLUMN_GAP;
  const chartWPx = chartWidthPx(slide.chart, chartColWidthPx, rowHeightPx);
  addChartBlock(pptxSlide, slide.chart, {
    x: px2in(chartXPx) + (px2in(chartColWidthPx) - px2in(chartWPx)) / 2,
    y: px2in(rowTopPx),
    w: px2in(chartWPx),
    h: px2in(rowHeightPx),
    colors,
  });

  let belowRowY = px2in(rowTopPx + rowHeightPx);
  if (slide.banner) {
    belowRowY += px2in(BANNER_GAP_PX);
    addBanner(pptxSlide, slide.banner, { x: px2in(SAFE.left), y: belowRowY, w: px2in(titleWidthPx), h: px2in(BANNER_HEIGHT_PX), colors, repoRoot });
    belowRowY += px2in(BANNER_HEIGHT_PX);
  }
  if (slide.progress) {
    belowRowY += px2in(PROGRESS_GAP_PX);
    addProgressBar(pptxSlide, slide.progress, { x: px2in(SAFE.left), y: belowRowY, w: px2in(titleWidthPx), colors });
    belowRowY += px2in(PROGRESS_HEIGHT_PX);
  }

  const sourceFloorIn = px2in(CANVAS.height - SAFE.bottom - FOOTER_ZONE_HEIGHT - 20);
  addBody(pptxSlide, `Fuente: ${slide.source} · ${slide.period}`, {
    x: px2in(SAFE.left),
    y: Math.min(belowRowY + px2in(16), sourceFloorIn),
    w: px2in(titleWidthPx),
    sizePt: 11,
    color: colors.ink500,
  });

  return "light";
}

export default function renderData(pptxSlide, slide, { colors, repoRoot }) {
  const titleWidthPx = CANVAS.width - SAFE.left - SAFE.right;
  const availWidthPx = CANVAS.width - SAFE.left - SAFE.right;
  if (slide.chart) return renderDataWithChart(pptxSlide, slide, { colors, repoRoot, titleWidthPx, availWidthPx });

  pptxSlide.background = { color: slide.background === "tinted" ? colors.surfaceTint : colors.paper };
  const titleHeightPx = estimateBlockHeightPx(slide.title, { sizePx: TYPE_SCALE_PX.slideTitle, widthPx: titleWidthPx, weight: "black" });

  const n = slide.stats.length;
  const valueSizePt = n <= 2 ? 60 : n <= 4 ? 44 : 34;
  const valueSizePx = valueSizePt / 0.75;
  const statWidthPx = (titleWidthPx - CONTENT_COLUMN_GAP * (n - 1)) / n;
  // planning/10-...md #2: altura reservada por stat = valor + badge (ancho fijo,
  // no envuelve) + label/caption medidos con estimateBlockHeightPx, en vez del
  // heurístico fijo `valueSizePt/0.75 + 120` que no medía label/caption/badge.
  const BADGE_ALLOWANCE_PX = 37;
  const statRowHeightPx = Math.max(
    ...slide.stats.map((stat) => {
      let h = valueSizePx;
      if (stat.badge) h += BADGE_ALLOWANCE_PX;
      if (stat.label) h += 4 + estimateBlockHeightPx(stat.label, { sizePx: 24, widthPx: statWidthPx, weight: "semibold" });
      if (stat.caption) h += 4 + estimateBlockHeightPx(stat.caption, { sizePx: 14, widthPx: statWidthPx, weight: "regular" });
      return h + 24;
    })
  );
  const bannerBlockHeightPx = slide.banner ? BANNER_GAP_PX + BANNER_HEIGHT_PX : 0;
  const progressBlockHeightPx = slide.progress ? PROGRESS_GAP_PX + PROGRESS_HEIGHT_PX : 0;

  const contentHeightPx = titleHeightPx + 60 + statRowHeightPx + bannerBlockHeightPx + progressBlockHeightPx;
  const titleY = centeredContentYIn("content", contentHeightPx);
  addTitle(pptxSlide, slide.title, { x: px2in(SAFE.left), y: titleY, w: px2in(titleWidthPx), h: px2in(titleHeightPx), sizePt: px2pt(TYPE_SCALE_PX.slideTitle), color: colors.sabanaBlue });

  const statsY = titleY + px2in(titleHeightPx + 60);
  const availW = px2in(titleWidthPx);
  const gap = px2in(CONTENT_COLUMN_GAP);
  const statW = (availW - gap * (n - 1)) / n;

  slide.stats.forEach((stat, i) => {
    const x = px2in(SAFE.left) + i * (statW + gap);
    const accentColor = stat.accent === "alert" ? colors.juridicas500 : undefined;
    addStatBlock(pptxSlide, stat, { x, y: statsY, w: statW, valueSizePt, colors, accentColor, badge: stat.badge });
  });

  let belowStatsY = statsY + px2in(statRowHeightPx);
  if (slide.banner) {
    belowStatsY += px2in(BANNER_GAP_PX);
    addBanner(pptxSlide, slide.banner, { x: px2in(SAFE.left), y: belowStatsY, w: availW, h: px2in(BANNER_HEIGHT_PX), colors, repoRoot });
    belowStatsY += px2in(BANNER_HEIGHT_PX);
  }
  if (slide.progress) {
    belowStatsY += px2in(PROGRESS_GAP_PX);
    addProgressBar(pptxSlide, slide.progress, { x: px2in(SAFE.left), y: belowStatsY, w: availW, colors });
    belowStatsY += px2in(PROGRESS_HEIGHT_PX);
  }
  // planning/10-...md #2: fluye después del contenido real (belowStatsY) en vez
  // de un Y fijo; el Y fijo anterior pasa a ser el techo (nunca más abajo).
  const sourceFloorIn = px2in(CANVAS.height - SAFE.bottom - FOOTER_ZONE_HEIGHT - 20);
  addBody(pptxSlide, `Fuente: ${slide.source} · ${slide.period}`, {
    x: px2in(SAFE.left),
    y: Math.min(belowStatsY + px2in(16), sourceFloorIn),
    w: availW,
    sizePt: 11,
    color: colors.ink500,
  });

  return "light";
}
