import { CANVAS, SAFE, CONTENT_COLUMN_GAP, TYPE_SCALE_PX, FOOTER_ZONE_HEIGHT, BANNER_HEIGHT_PX, BANNER_GAP_PX, PROGRESS_HEIGHT_PX, PROGRESS_GAP_PX, centeredContentY } from "../constants.mjs";
import { title, bodyText, statBlock, banner, progressBar } from "../elements.mjs";
import { estimateBlockHeightPx } from "../text-measure.mjs";
import { iconMarkup } from "../icons.mjs";

export default function renderData(slide, { repoRoot } = {}) {
  const boxes = [];
  const titleWidth = CANVAS.width - SAFE.left - SAFE.right;
  const titleHeight = estimateBlockHeightPx(slide.title, { sizePx: TYPE_SCALE_PX.slideTitle, widthPx: titleWidth, weight: "black" });

  const n = slide.stats.length;
  const availWidth = CANVAS.width - SAFE.left - SAFE.right;
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
