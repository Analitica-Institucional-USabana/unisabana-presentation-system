// Motivo de marca recurrente, equivalente pptx de renderers/html/decor.mjs.
// planning/08-visual-quality-and-layout-fixes.md backlog #5.
//
// ponytail: pptxgenjs (ver node_modules/pptxgenjs/types/index.d.ts,
// BackgroundProps/ShapeFillProps) no soporta relleno degradado en shapes ni
// imágenes SVG — solo color plano o una imagen rasterizada. Sin una
// dependencia de rasterizado (no instalada, y no se añade una solo para
// esto), no se puede reproducir el brand-wave.svg real aquí. Se usa un panel
// sólido en el color intermedio de la marca como aproximación de baja
// fidelidad del motivo — mismo lado (derecha), mismo espíritu ("un accent
// consistente"), pero no la curva ni el degradado reales. Subir a paridad
// real si se adopta un rasterizador (p. ej. sharp) para el pipeline.

import { CANVAS, px2in } from "./constants.mjs";

export function NAVY_GRADIENT(colors) {
  return { color: colors.sabanaBlueDeep };
}

export function addWavePanel(pptxSlide, colors) {
  const panelXPx = CANVAS.width * 0.62;
  pptxSlide.addShape("rect", {
    x: px2in(panelXPx),
    y: 0,
    w: px2in(CANVAS.width - panelXPx),
    h: px2in(CANVAS.height),
    fill: { color: colors.sabanaBlueMid, transparency: 55 },
    line: { type: "none" },
  });
}
