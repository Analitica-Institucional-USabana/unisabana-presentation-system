// Numeración de slide ("N / total") — esquina inferior izquierda, opuesta al
// pie de atribución IA (AI_DISCLOSURE, esquina inferior derecha) — nunca
// colisionan por construcción. planning/10-numbering-footer-safety-logo-and-
// multiplatform-branding.md #1: cuenta TODO el deck, portada y cierre incluidos.

import { CANVAS, PAGE_NUMBER } from "./constants.mjs";
import { box } from "./elements.mjs";

const BOX_WIDTH = 80;
const BOX_HEIGHT = 24;

export function pageNumberBox(index, total, backgroundTone) {
  const { left, bottom, textPx } = PAGE_NUMBER;
  const color = backgroundTone === "dark" ? "var(--sabana-blue-300)" : "var(--ink-500)";
  return box({
    x: left,
    y: CANVAS.height - bottom - BOX_HEIGHT,
    width: BOX_WIDTH,
    height: BOX_HEIGHT,
    style: `display:flex;align-items:center;font-family:var(--font-sans);font-size:${textPx}px;color:${color};`,
    html: `<span>${index} / ${total}</span>`,
  });
}
