// Motivo de marca recurrente, equivalente pptx de renderers/html/decor.mjs.
// planning/08-visual-quality-and-layout-fixes.md backlog #5,
// planning/09-visual-richness-and-content-density.md.
//
// pptxgenjs (ver node_modules/pptxgenjs/types/index.d.ts) no soporta relleno
// degradado en shapes ni SVG en addImage() bajo Node. En vez de rasterizar el
// gradiente en tiempo de render (dependencia nueva solo para esto), el
// degradado navy se aproxima con bandas verticales interpoladas (vector puro,
// sin dependencias) y el motivo brand-wave.svg se usa como PNG pre-rasterizado
// una sola vez (scripts/vendor-pptx-raster-assets.mjs, `sharp` como
// herramienta de generación — nunca una dependencia del renderer).

import { join } from "node:path";
import { CANVAS, px2in } from "./constants.mjs";

const GRADIENT_BANDS = 24;

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}
function lerp(a, b, t) {
  return { r: Math.round(a.r + (b.r - a.r) * t), g: Math.round(a.g + (b.g - a.g) * t), b: Math.round(a.b + (b.b - a.b) * t) };
}
function rgbToHex({ r, g, b }) {
  return [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
}

// Aproxima linear-gradient(135deg, --sabana-blue-mid, --sabana-blue-deep) del
// renderer HTML. Simplificación deliberada: bandas verticales (180deg) en vez
// de diagonal (135deg) — mismo par de colores, misma dirección general
// (claro arriba/izq → oscuro abajo/der), perceptualmente muy cercana a
// distancia de presentación; subir a diagonal real solo si un usuario nota
// la diferencia en una revisión visual.
export function addNavyGradientBackground(pptxSlide, colors) {
  const from = hexToRgb(colors.sabanaBlueMid);
  const to = hexToRgb(colors.sabanaBlueDeep);
  const bandWIn = px2in(CANVAS.width) / GRADIENT_BANDS;
  for (let i = 0; i < GRADIENT_BANDS; i++) {
    const t = i / (GRADIENT_BANDS - 1);
    pptxSlide.addShape("rect", {
      x: i * bandWIn,
      y: 0,
      w: bandWIn + 0.01, // +0.01: evita línea de costura visible entre bandas
      h: px2in(CANVAS.height),
      fill: { color: rgbToHex(lerp(from, to, t)) },
      line: { type: "none" },
    });
  }
}

// brand-wave.png tiene el mismo ratio 16:9 que el canvas (1920×1080 vs
// 1280×720) — un addImage a pantalla completa no necesita crop, igual que
// background-size:cover en HTML cuando los ratios ya coinciden. Opacidad
// horneada al 50% en el propio PNG (pptxgenjs no soporta transparencia en
// addImage, ver scripts/vendor-pptx-raster-assets.mjs).
export function addBrandWaveImage(pptxSlide, repoRoot) {
  pptxSlide.addImage({
    path: join(repoRoot, "core/brand/assets/brand-wave.png"),
    x: 0,
    y: 0,
    w: px2in(CANVAS.width),
    h: px2in(CANVAS.height),
  });
}
