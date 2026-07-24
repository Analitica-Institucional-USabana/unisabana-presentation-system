// Íconos vendorizados, versión PPTX (mirror de renderers/html/icons.mjs).
// pptxgenjs no rasteriza SVG en Node, así que en vez del SVG crudo inlineado
// se usa un PNG pre-rasterizado una sola vez por slug×tono
// (scripts/vendor-pptx-raster-assets.mjs). Solo 2 tonos porque son los únicos
// dos contextos reales donde aparece un ícono hoy: "light" (blanco — banner
// variante info, insignia de proceso alternado) y "dark" (--sabana-blue —
// banner variante warning/highlight). Si un slug×tono no existe, es un slug
// no vendorizado — mismo criterio de error que la versión HTML.

import { existsSync } from "node:fs";
import { join } from "node:path";

export function iconImagePath(repoRoot, slug, tone = "dark") {
  const path = join(repoRoot, "core/brand/assets/icons", `${slug}-${tone}.png`);
  if (!existsSync(path)) {
    throw new Error(`Ícono PPTX no vendorizado (no se puede insertar): ${slug}-${tone} (${path})`);
  }
  return path;
}

export function addIcon(pptxSlide, repoRoot, slug, tone, { x, y, size }) {
  pptxSlide.addImage({ path: iconImagePath(repoRoot, slug, tone), x, y, w: size, h: size });
}
