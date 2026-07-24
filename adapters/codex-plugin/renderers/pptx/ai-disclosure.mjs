import { join } from "node:path";
import { CANVAS, AI_DISCLOSURE, px2in } from "./constants.mjs";
import { widthForHeight } from "./image-size.mjs";

const BOX_WIDTH_PX = 230;

export function addAiDisclosure(pptxSlide, repoRoot, tone) {
  const { right, bottom, textPx, logoHeightPx } = AI_DISCLOSURE;
  const color = tone === "dark" ? "98B1D3" : "717175"; // sabana-blue-300 / ink-500
  const logoHIn = px2in(logoHeightPx);
  const logoPath = join(repoRoot, "core/brand/assets/claude-logo.svg");
  const logoWIn = widthForHeight(logoPath, logoHIn);

  const yIn = px2in(CANVAS.height) - px2in(bottom) - px2in(24);
  const textWIn = px2in(BOX_WIDTH_PX) - logoWIn - px2in(8);

  pptxSlide.addText("Diseñado con Claude Design", {
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

  pptxSlide.addImage({
    path: logoPath,
    x: px2in(CANVAS.width) - px2in(right) - logoWIn,
    y: yIn + (px2in(24) - logoHIn) / 2,
    w: logoWIn,
    h: logoHIn,
  });
}
