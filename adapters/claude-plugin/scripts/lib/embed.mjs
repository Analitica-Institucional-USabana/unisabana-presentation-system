// Utilidad neutra de embebido (base64/data URI). Vive en scripts/lib/, no dentro
// de renderers/html/, para que validators/ pueda usarla sin depender del
// renderer (separación entre lógica de validación y de renderizado, brecha G-08
// en planning/01-gap-analysis.md).

import { readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";

const MIME_BY_EXT = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

const cache = new Map();

export function fileToDataUri(absPath) {
  if (cache.has(absPath)) return cache.get(absPath);
  if (!existsSync(absPath)) {
    throw new Error(`Activo no encontrado (no se puede embeber): ${absPath}`);
  }
  const mime = MIME_BY_EXT[extname(absPath).toLowerCase()];
  if (!mime) throw new Error(`Tipo de activo no soportado para embeber: ${absPath}`);
  const base64 = readFileSync(absPath).toString("base64");
  const uri = `data:${mime};base64,${base64}`;
  cache.set(absPath, uri);
  return uri;
}

// Todas las rutas de activos en core/brand/rules/*.json son relativas a core/brand/.
export function brandAssetDataUri(repoRoot, relativePath) {
  return fileToDataUri(join(repoRoot, "core/brand", relativePath));
}
