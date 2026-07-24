// Reutiliza toda la resolución de layout ya hecha en renderers/html/constants.mjs
// (los mismos clamp() del readme.md, resueltos una sola vez) y solo añade la
// conversión px→pulgadas/puntos que PowerPoint necesita. El canvas 1280×720 a
// 96dpi equivale exactamente a 13.333in × 7.5in (16:9 estándar de PowerPoint) —
// por eso no hace falta rediseñar el layout, solo convertir unidades.

import {
  CANVAS,
  SAFE,
  FOOTER_ZONE_HEIGHT,
  CONTENT_COLUMN_GAP,
  CONTENT_ROW_GAP,
  TYPE_SCALE_PX,
  TYPE_SCALE_MIN_PX,
  LOGO_HEIGHT_PX,
  LOGO_MIN_HEIGHT_PX,
  LOGO_POSITION,
  AI_DISCLOSURE,
  BANNER_HEIGHT_PX,
  BANNER_GAP_PX,
  slideFamilyFor,
  contentBand,
  centeredContentY,
} from "../html/constants.mjs";

export {
  CANVAS,
  SAFE,
  FOOTER_ZONE_HEIGHT,
  CONTENT_COLUMN_GAP,
  CONTENT_ROW_GAP,
  TYPE_SCALE_PX,
  TYPE_SCALE_MIN_PX,
  LOGO_HEIGHT_PX,
  LOGO_MIN_HEIGHT_PX,
  LOGO_POSITION,
  AI_DISCLOSURE,
  BANNER_HEIGHT_PX,
  BANNER_GAP_PX,
  slideFamilyFor,
  contentBand,
};

const DPI = 96;
export const px2in = (px) => px / DPI;
export const px2pt = (px) => px * 0.75; // 1px @96dpi = 0.75pt (1pt = 1/72in)

// Mismo cálculo de banda/centrado que renderers/html/constants.mjs (la
// grilla en px es compartida) — convertido a pulgadas en el punto de uso.
export const centeredContentYIn = (family, contentHeightPx) => px2in(centeredContentY(family, contentHeightPx));

export const PPTX_LAYOUT_NAME = "UNISABANA_16x9";
export const PPTX_LAYOUT = { name: PPTX_LAYOUT_NAME, width: px2in(CANVAS.width), height: px2in(CANVAS.height) };

export const TYPE_SCALE_PT = Object.fromEntries(Object.entries(TYPE_SCALE_PX).map(([k, v]) => [k, px2pt(v)]));

// PowerPoint no tiene una escala de 9 pesos como CSS — solo negrita on/off.
// Limitación documentada (ver Hito 7 en planning/03-migration-roadmap.md).
export function weightToBold(weightName) {
  return ["bold", "extrabold", "black"].includes(weightName);
}
