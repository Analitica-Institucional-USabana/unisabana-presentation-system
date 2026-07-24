// Íconos vendorizados (core/brand/rules/icons.json). A diferencia de fotos/logo
// (embed.mjs, data URI vía <img>), un ícono necesita heredar color CSS
// (stroke="currentColor") para pintarse en el acento institucional o en
// --ink-500 según el contexto — un data URI cargado en <img> es un contexto de
// recursos aislado y no hereda `color`. Por eso el SVG se inlinea como texto
// crudo dentro del propio HTML en vez de embeberse como imagen.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const cache = new Map();

function rawIconSvg(repoRoot, slug) {
  if (cache.has(slug)) return cache.get(slug);
  const path = join(repoRoot, "core/brand/assets/icons", `${slug}.svg`);
  let svg;
  try {
    svg = readFileSync(path, "utf8");
  } catch {
    throw new Error(`Ícono no vendorizado (no se puede inlinear): ${slug} (${path})`);
  }
  svg = svg
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\swidth="\d+"/, ' width="100%"')
    .replace(/\sheight="\d+"/, ' height="100%"')
    .trim();
  cache.set(slug, svg);
  return svg;
}

// slug debe ser aprobado por core/brand/rules/icons.json — ese chequeo vive en
// validators/rules/icons.mjs, no aquí (el renderer confía en que ya se validó).
export function iconMarkup(repoRoot, slug, { sizePx = 20, color = "currentColor" } = {}) {
  const svg = rawIconSvg(repoRoot, slug);
  return `<span style="display:inline-block;width:${sizePx}px;height:${sizePx}px;color:${color};line-height:0">${svg}</span>`;
}
