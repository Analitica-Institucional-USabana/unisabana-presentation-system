// Logo institucional: posición y tamaño deterministas por familia de slide
// (core/brand/rules/logo.json). El agente NUNCA decide esto — es responsabilidad
// del renderer, no del Deck Spec (separación creatividad/cumplimiento, principio 3.2).

import { LOGO_HEIGHT_PX, LOGO_POSITION, LOGO_MIN_HEIGHT_PX, slideFamilyFor } from "./constants.mjs";
import { brandAssetDataUri } from "./embed.mjs";
import { box } from "./elements.mjs";

export function logoBox(repoRoot, slideType, backgroundTone) {
  const family = slideFamilyFor(slideType);
  const heightPx = Math.max(LOGO_HEIGHT_PX[family], LOGO_MIN_HEIGHT_PX);
  const assetPath = backgroundTone === "dark" ? "assets/logo-horizontal-white.png" : "assets/logo-horizontal-color.png";
  const dataUri = brandAssetDataUri(repoRoot, assetPath);
  return box({
    x: LOGO_POSITION.x,
    y: LOGO_POSITION.y,
    height: heightPx,
    html: `<img src="${dataUri}" alt="Universidad de La Sabana" style="height:${heightPx}px;width:auto;display:block" />`,
  });
}
