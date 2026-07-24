// Constantes de layout resueltas de forma FIJA porque el canvas del renderer
// también es fijo (1280x720) — todo clamp(min, vw|vh, max) del readme.md original
// se resuelve una sola vez aquí, en vez de dejarlo como CSS responsive.
// Fuente: claude-design-system/readme.md, addendum "INSTITUTIONAL PRESENTATION
// IMPLEMENTATION ADDENDUM" §3.3, §5, §8; y core/brand/rules/logo.json.

export const CANVAS = { width: 1280, height: 720 };

// §8 INSTITUTIONAL PRESENTATION GRID
export const SAFE = { left: 72, right: 72, top: 56, bottom: 48 };
export const FOOTER_ZONE_HEIGHT = 36;
export const CONTENT_COLUMN_GAP = 32;
export const CONTENT_ROW_GAP = 24;

// Franja de énfasis (planning/09-visual-richness-and-content-density.md #1):
// altura fija, no medida por texto — el propio schema exige "una cifra o una
// frase corta, no un párrafo", así que una banda de una línea siempre alcanza.
export const BANNER_HEIGHT_PX = 84;
export const BANNER_GAP_PX = 32;

// Barra de progreso (planning/09-visual-richness-and-content-density.md #8).
export const PROGRESS_HEIGHT_PX = 40;
export const PROGRESS_GAP_PX = 24;

function resolveClampVw(minPx, vwPercent, maxPx) {
  const v = (CANVAS.width * vwPercent) / 100;
  return Math.round(Math.min(Math.max(v, minPx), maxPx));
}
function resolveClampVh(minPx, vhPercent, maxPx) {
  const v = (CANVAS.height * vhPercent) / 100;
  return Math.round(Math.min(Math.max(v, minPx), maxPx));
}

// §11 TYPOGRAPHIC ALIGNMENT FOR PRESENTATIONS
export const TYPE_SCALE_PX = {
  coverTitle: resolveClampVw(64, 7.5, 96),
  sectionTitle: resolveClampVw(50, 5.8, 76),
  slideTitle: resolveClampVw(34, 4, 52),
  body: 20,
  caption: 16,
  source: 14,
};

// Piso normativo de cada clamp() de título (primer argumento arriba) — el
// único tamaño al que renderers/html/text-measure.mjs#fitTitleSizePx puede
// reducir un título largo sin violar el clamp de marca.
export const TYPE_SCALE_MIN_PX = { coverTitle: 64, sectionTitle: 50, slideTitle: 34 };

// §3.3 logo sizes por familia de slide, resueltos desde los clamp(*, vh, *) del readme.
// Decisión de implementación (no está fijado por el brand book): las familias que
// el readme no distingue explícitamente (agenda, message, data, comparison, process,
// table, quote) se tratan todas como "content" a efectos de tamaño y posición de logo.
export const LOGO_HEIGHT_PX = {
  cover: resolveClampVh(72, 11, 118),
  separator: resolveClampVh(54, 8, 84),
  content: resolveClampVh(32, 5, 48),
  closing: resolveClampVh(64, 10, 104),
};

// core/brand/rules/logo.json#/sizing/minimumSymbolHeight — nunca por debajo de esto.
export const LOGO_MIN_HEIGHT_PX = 22;

// core/brand/rules/logo.json#/sizing edge offsets — posición fija del logo institucional.
// Decisión de implementación: esquina superior izquierda en TODAS las familias, para
// cumplir literalmente "one consistent corner across the whole deck" (readme.md §5.3)
// sin tener que adivinar la esquina exacta de la plantilla original (que el readme no fija).
export const LOGO_POSITION = { x: 72, y: 56 };

// core/brand/rules/ai-disclosure.json — pie de atribución IA, esquina inferior derecha,
// por diseño en la esquina opuesta al logo institucional (nunca colisionan).
export const AI_DISCLOSURE = {
  right: 32,
  bottom: 24,
  textPx: 14,
  logoHeightPx: 17,
};

export function slideFamilyFor(type) {
  if (type === "cover" || type === "separator" || type === "closing") return type;
  return "content";
}

// Banda vertical disponible para el bloque de contenido de una slide, entre
// la zona protegida del logo (arriba) y la zona protegida del pie de
// atribución IA (abajo). planning/08-visual-quality-and-layout-fixes.md
// backlog #4: los layouts centran su bloque de contenido en esta banda en
// vez de anclarlo siempre a un Y fijo cerca del logo.
export function contentBand(family) {
  return {
    top: SAFE.top + LOGO_HEIGHT_PX[family] + 40,
    bottom: CANVAS.height - SAFE.bottom - FOOTER_ZONE_HEIGHT - 24,
  };
}

// Y inicial que centra un bloque de `contentHeightPx` dentro de la banda de
// `family` — si el contenido es más alto que la banda, se ancla arriba
// (mismo comportamiento que "llenar y desbordar hacia abajo" en vez de negativo).
export function centeredContentY(family, contentHeightPx) {
  const { top, bottom } = contentBand(family);
  return top + Math.max(0, (bottom - top - contentHeightPx) / 2);
}

export function resolveClamp(minPx, percent, maxPx, basis) {
  return basis === "vw" ? resolveClampVw(minPx, percent, maxPx) : resolveClampVh(minPx, percent, maxPx);
}
