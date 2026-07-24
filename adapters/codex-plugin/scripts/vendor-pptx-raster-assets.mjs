// Script de un solo uso (no forma parte del pipeline de render): rasteriza a
// PNG los assets vectoriales que PPTX no puede usar directamente en Node
// (pptxgenjs no soporta SVG ni gradientes — ver renderers/pptx/decor.mjs y
// planning/09-visual-richness-and-content-density.md). Se ejecuta una vez
// para producir archivos estáticos versionados junto a los .svg de origen;
// `sharp` es una herramienta de generación, no una dependencia del renderer
// (nunca se importa desde renderers/pptx/, no queda en package.json).
//
// Uso: npm install sharp --no-save && node scripts/vendor-pptx-raster-assets.mjs && npm uninstall sharp

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = join(repoRoot, "core/brand/assets/icons");

const TONES = {
  light: "#FFFFFF", // banner variant "info" (texto blanco) y badge de proceso alternado (siempre blanco)
  dark: "#00205B", // --sabana-blue / --text-strong — banner "warning"/"highlight"
};
const ICON_PX = 256;

async function rasterIcons() {
  const svgFiles = readdirSync(iconsDir).filter((f) => f.endsWith(".svg"));
  for (const file of svgFiles) {
    const slug = file.replace(/\.svg$/, "");
    const raw = readFileSync(join(iconsDir, file), "utf8");
    for (const [tone, hex] of Object.entries(TONES)) {
      const recolored = raw.replace(/stroke="currentColor"/, `stroke="${hex}"`);
      const outPath = join(iconsDir, `${slug}-${tone}.png`);
      await sharp(Buffer.from(recolored)).resize(ICON_PX, ICON_PX).png().toFile(outPath);
      console.log(`icon: ${slug}-${tone}.png`);
    }
  }
}

async function rasterBrandWave() {
  // Opacidad horneada al 50% (mismo valor por defecto que waveOverlay() en
  // renderers/html/decor.mjs, usado sin override en los 4 call sites) — pptxgenjs
  // no soporta transparencia en addImage(), así que debe fijarse en el propio PNG.
  const raw = readFileSync(join(repoRoot, "core/brand/assets/brand-wave.svg"), "utf8");
  const withOpacity = raw.replace("<g>", '<g opacity="0.5">');
  const outPath = join(repoRoot, "core/brand/assets/brand-wave.png");
  await sharp(Buffer.from(withOpacity)).png().toFile(outPath);
  console.log("brand-wave: brand-wave.png (opacity 0.5 horneada)");
}

await rasterIcons();
await rasterBrandWave();
console.log("Listo. Ahora: npm uninstall sharp");
