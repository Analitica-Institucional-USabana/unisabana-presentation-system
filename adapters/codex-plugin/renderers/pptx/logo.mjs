import { join } from "node:path";
import { LOGO_HEIGHT_PX, LOGO_MIN_HEIGHT_PX, LOGO_POSITION, slideFamilyFor, px2in } from "./constants.mjs";
import { widthForHeight } from "./image-size.mjs";

export function addLogo(pptxSlide, repoRoot, slideType, tone) {
  const family = slideFamilyFor(slideType);
  const heightPx = Math.max(LOGO_HEIGHT_PX[family], LOGO_MIN_HEIGHT_PX);
  const file = tone === "dark" ? "logo-horizontal-white.png" : "logo-horizontal-color.png";
  const path = join(repoRoot, "core/brand/assets", file);
  const hIn = px2in(heightPx);
  const wIn = widthForHeight(path, hIn);

  pptxSlide.addImage({ path, x: px2in(LOGO_POSITION.x), y: px2in(LOGO_POSITION.y), w: wIn, h: hIn });
}
