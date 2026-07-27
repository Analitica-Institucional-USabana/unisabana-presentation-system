// Estima cuántas líneas ocupará un texto de longitud variable antes de
// renderizarlo, para poder posicionar lo que viene después sin superponerse.
// Opción A de planning/08-visual-quality-and-layout-fixes.md: heurística de
// ancho de carácter (sin navegador headless, decisión D-18 de
// planning/07-decisions-and-open-questions.md sigue sin adoptarse). Compartido
// entre renderers/html y renderers/pptx porque ambos parten de la misma
// grilla en px (1280x720) antes de convertir a pulgadas/puntos.

// ponytail: factor calibrado a ojo contra títulos de content-voice.md (3-15
// palabras) en Libre Franklin; no es medición real de glifo. Si algún título
// real sigue desbordando, subir el factor del peso correspondiente.
const AVG_CHAR_WIDTH_FACTOR = { regular: 0.5, medium: 0.52, semibold: 0.54, bold: 0.57, black: 0.6 };

export function estimateLineCount(text, { sizePx, widthPx, weight = "black" }) {
  const str = String(text ?? "").trim();
  if (!str || !widthPx) return str ? 1 : 0;

  const factor = AVG_CHAR_WIDTH_FACTOR[weight] ?? AVG_CHAR_WIDTH_FACTOR.regular;
  const charWidth = sizePx * factor;
  const spaceWidth = charWidth * 0.6;

  let lines = 1;
  let lineWidth = 0;
  for (const word of str.split(/\s+/)) {
    const wordWidth = word.length * charWidth;
    const candidateWidth = lineWidth === 0 ? wordWidth : lineWidth + spaceWidth + wordWidth;
    if (candidateWidth > widthPx && lineWidth > 0) {
      lines += 1;
      lineWidth = wordWidth;
    } else {
      lineWidth = candidateWidth;
    }
  }
  return lines;
}

// Ancho estimado de un texto de una sola línea (sin envolver) — misma
// heurística de ancho de carácter que estimateLineCount, factorizada aparte
// para casos donde lo que hace falta es dimensionar un contenedor al texto
// (ej. badges/pills) en vez de contar líneas dentro de un ancho fijo.
export function estimateTextWidthPx(text, { sizePx, weight = "black" }) {
  const str = String(text ?? "").trim();
  if (!str) return 0;

  const factor = AVG_CHAR_WIDTH_FACTOR[weight] ?? AVG_CHAR_WIDTH_FACTOR.regular;
  const charWidth = sizePx * factor;
  const spaceWidth = charWidth * 0.6;

  const words = str.split(/\s+/);
  const wordsWidth = words.reduce((sum, word) => sum + word.length * charWidth, 0);
  const spacesWidth = Math.max(0, words.length - 1) * spaceWidth;
  return wordsWidth + spacesWidth;
}

export function estimateBlockHeightPx(text, { sizePx, widthPx, weight = "black", lineHeight = 1.15 }) {
  const lines = estimateLineCount(text, { sizePx, widthPx, weight }) || 1;
  return Math.round(lines * sizePx * lineHeight);
}

// Altura real necesaria por una tarjeta de comparación con estado (heading +
// badge + stats + points, elements.mjs#statusCard / addStatusCard) — antes
// comparison.mjs le daba siempre toda la altura de banda disponible sin medir
// si heading+stats+points realmente caben, así que una columna con stats Y
// points (redundantes o no) podía desbordar el bullet-list por debajo del
// borde visible de la tarjeta en silencio (planning/10-numbering-footer-
// safety-logo-and-multiplatform-branding.md #2, reportado por el usuario tras
// el fix de badges — ver error1.png: el badge ya no envuelve, pero los
// puntos seguían saliéndose de la tarjeta). Los pesos/tamaños/márgenes
// replican exactamente los usados en elements.mjs#statusCard.
export function estimateStatusCardHeightPx({ stats = [], points = [] }, innerWidthPx) {
  let h = 22 + 16; // heading row (una línea, generosa) + margin-bottom
  if (stats.length) {
    const statWidthPx = innerWidthPx / stats.length - 12;
    const labelH = Math.max(
      0,
      ...stats.map((s) => (s.label ? estimateBlockHeightPx(s.label, { sizePx: 24, widthPx: statWidthPx, weight: "semibold" }) : 0))
    );
    h += 44 + 4 + labelH + 16; // valor + gap + label + margen del bloque de stats
  }
  if (points.length) {
    h += points.reduce((sum, p) => sum + estimateBlockHeightPx(p, { sizePx: 16, widthPx: innerWidthPx, weight: "regular", lineHeight: 1.55 }) + 8, 0);
  }
  return h + 48; // padding 24px arriba+abajo (surfaceStyle box-sizing:border-box)
}

// Mismo problema, para la tarjeta de bullets plana (sin stats/badge) que usa
// comparison.mjs cuando una columna no trae `stats`/`badge`.
export function estimateBulletCardHeightPx({ points = [] }, innerWidthPx) {
  let h = 22 + 16; // heading + margin-bottom
  h += points.reduce((sum, p) => sum + estimateBlockHeightPx(p, { sizePx: 18, widthPx: innerWidthPx, weight: "regular", lineHeight: 1.55 }) + 10, 0);
  return h + 48;
}

// Reduce el tamaño de un título hasta que quepa en maxLines o hasta tocar el
// mínimo normativo del propio clamp() de marca (core/brand/rules no permite
// bajar de ese piso) — evita que un título-conclusión largo (content-voice.md)
// se coma la mitad del canvas en el tamaño máximo del clamp.
export function fitTitleSizePx(text, { maxSizePx, minSizePx, widthPx, weight = "black", maxLines = 3, stepPx = 4 }) {
  let sizePx = maxSizePx;
  while (sizePx > minSizePx && estimateLineCount(text, { sizePx, widthPx, weight }) > maxLines) {
    sizePx -= stepPx;
  }
  return Math.max(sizePx, minSizePx);
}
