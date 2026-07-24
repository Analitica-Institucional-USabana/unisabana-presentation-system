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

export function estimateBlockHeightPx(text, { sizePx, widthPx, weight = "black", lineHeight = 1.15 }) {
  const lines = estimateLineCount(text, { sizePx, widthPx, weight }) || 1;
  return Math.round(lines * sizePx * lineHeight);
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
