import { join } from "node:path";
import { CANVAS, AI_DISCLOSURE, px2in } from "./constants.mjs";
import { widthForHeight } from "./image-size.mjs";
import { resolvePlatform } from "../html/platform.mjs";

const BOX_WIDTH_PX = 230;

export function addAiDisclosure(pptxSlide, repoRoot, tone, colors) {
  const { right, bottom, textPx, logoHeightPx } = AI_DISCLOSURE;
  const platform = resolvePlatform(repoRoot);
  const color = colors ? (tone === "dark" ? colors.sabanaBlue300 : colors.ink500) : tone === "dark" ? "98B1D3" : "717175";

  const yIn = px2in(CANVAS.height) - px2in(bottom) - px2in(24);

  // pptxgenjs no soporta filtros CSS — si hay una variante dedicada para
  // fondo oscuro (ej. isotipo blanco de OpenAI junto a su variante negra),
  // se elige el asset correcto por tono en vez de intentar invertir uno solo.
  let logoWIn = 0;
  if (platform.logoAsset) {
    const useDarkAsset = tone === "dark" && platform.logoAssetDark;
    const assetRelPath = useDarkAsset ? platform.logoAssetDark : platform.logoAsset;
    const logoHIn = px2in(logoHeightPx);
    const logoPath = join(repoRoot, "core/brand", assetRelPath);
    logoWIn = widthForHeight(logoPath, logoHIn);
    pptxSlide.addImage({
      path: logoPath,
      x: px2in(CANVAS.width) - px2in(right) - logoWIn,
      y: yIn + (px2in(24) - logoHIn) / 2,
      w: logoWIn,
      h: logoHIn,
    });
  }

  const textWIn = px2in(BOX_WIDTH_PX) - logoWIn - (platform.logoAsset ? px2in(8) : 0);
  pptxSlide.addText(platform.attributionText, {
    x: px2in(CANVAS.width) - px2in(right) - px2in(BOX_WIDTH_PX),
    y: yIn,
    w: textWIn,
    h: px2in(24),
    fontFace: "Libre Franklin",
    fontSize: textPx * 0.75,
    color,
    align: "right",
    valign: "middle",
  });
}
