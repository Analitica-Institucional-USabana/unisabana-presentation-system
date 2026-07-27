import { CANVAS, SAFE, TYPE_SCALE_PX, TYPE_SCALE_MIN_PX, centeredContentY } from "../constants.mjs";
import { box, eyebrow, title, bodyText } from "../elements.mjs";
import { brandAssetDataUri } from "../embed.mjs";
import { NAVY_GRADIENT_CSS, waveOverlay } from "../decor.mjs";
import { estimateBlockHeightPx, fitTitleSizePx } from "../text-measure.mjs";

// slides/01-cover.html y slides/08-photo-cover.html (referencia visual, no copiados
// literalmente — ver planning/00-current-state-inventory.md) se consolidan aquí en
// un único layout parametrizado por `background`.
const OWNER_PLACEHOLDER = "Dependencia responsable: pendiente de definir";
const OWNER_LINE_HEIGHT = 32;

export default function renderCover(slide, { repoRoot, presentation }) {
  const tone = slide.background === "light" ? "light" : "dark";
  let boxes = "";
  let backgroundCss;
  if (slide.background === "photo") {
    const dataUri = brandAssetDataUri(repoRoot, slide.photo);
    backgroundCss = `background-image:linear-gradient(180deg, rgba(13,33,87,0.15), rgba(13,33,87,0.8)), url('${dataUri}');background-size:cover;background-position:center;`;
  } else if (slide.background === "navy") {
    backgroundCss = NAVY_GRADIENT_CSS;
    boxes += waveOverlay(repoRoot);
  } else {
    backgroundCss = `background:var(--bg-page);`;
  }

  const textColor = tone === "dark" ? "var(--text-on-dark)" : "var(--text-strong)";
  const contentWidth = CANVAS.width - SAFE.left - SAFE.right - 160;

  // planning/08-visual-quality-and-layout-fixes.md backlog #1 y #4: medir la
  // altura real del título (títulos-conclusión suelen envolver 2-3 líneas) y
  // centrar el bloque eyebrow+título+subtítulo en la banda disponible, en vez
  // de anclarlo siempre a un Y fijo cerca del logo. Un título-conclusión largo
  // a 96px puede envolver 5+ líneas y comerse el slide entero — se reduce
  // hasta 3 líneas sin bajar del piso normativo del clamp (64px).
  const titleSizePx = fitTitleSizePx(slide.title, {
    maxSizePx: TYPE_SCALE_PX.coverTitle,
    minSizePx: TYPE_SCALE_MIN_PX.coverTitle,
    widthPx: contentWidth,
    weight: "black",
  });
  const titleHeight = estimateBlockHeightPx(slide.title, { sizePx: titleSizePx, widthPx: contentWidth, weight: "black" });
  // bodyText() aplica siempre line-height:var(--lh-body) = 1.55 (core/brand/tokens.css) — la medición debe usar el mismo valor.
  const subtitleHeight = slide.subtitle
    ? estimateBlockHeightPx(slide.subtitle, { sizePx: 24, widthPx: contentWidth, weight: "medium", lineHeight: 1.55 })
    : 0;
  // planning/10-numbering-footer-safety-logo-and-multiplatform-branding.md #5:
  // jerarquía de propiedad — línea siempre visible (placeholder si falta),
  // encima del eyebrow, mismo patrón visual (elements.mjs#eyebrow) pero en
  // tono institucional/muted en vez de acento, para diferenciar jerarquía.
  const contentHeight = OWNER_LINE_HEIGHT + (slide.eyebrow ? 40 : 0) + titleHeight + 24 + subtitleHeight;

  let y = centeredContentY("cover", contentHeight);

  const ownerText = presentation?.owner || OWNER_PLACEHOLDER;
  boxes += eyebrow(ownerText, { x: SAFE.left, y, color: tone === "dark" ? "var(--sabana-blue-300)" : "var(--ink-500)" });
  y += OWNER_LINE_HEIGHT;

  if (slide.eyebrow) {
    boxes += eyebrow(slide.eyebrow, { x: SAFE.left, y, color: tone === "dark" ? "var(--sabana-blue-300)" : "var(--accent-mid)" });
    y += 40;
  }
  boxes += title(slide.title, { x: SAFE.left, y, width: contentWidth, sizePx: titleSizePx, color: textColor });
  y += titleHeight + 24;

  if (slide.subtitle) {
    boxes += bodyText(slide.subtitle, {
      x: SAFE.left, y, width: contentWidth, sizePx: 24, weight: "var(--fw-medium)",
      color: tone === "dark" ? "var(--sabana-blue-300)" : "var(--text-body)",
    });
    y += subtitleHeight;
  }

  const meta = [slide.presenter, slide.date, slide.event].filter(Boolean).join(" · ");
  if (meta) {
    boxes += bodyText(meta, {
      x: SAFE.left, y: Math.max(CANVAS.height - SAFE.bottom - 40, y + 16), sizePx: 16,
      color: tone === "dark" ? "var(--sabana-blue-300)" : "var(--text-muted)",
    });
  }

  return { tone, backgroundCss, boxesHtml: boxes };
}
