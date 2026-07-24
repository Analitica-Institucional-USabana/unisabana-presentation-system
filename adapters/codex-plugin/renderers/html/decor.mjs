// Motivo de marca recurrente (claude-design-system/readme.md: "gradient
// corner wave... recurring graphic motif for covers/separators") que
// planning/08-visual-quality-and-layout-fixes.md backlog #5 señala como
// omitido por el renderer. Se aplica solo a los 4 tipos de slide navy plana
// que el propio readme.md marca como candidatos (cover{navy}, separator,
// quote, closing) — nunca sobre fotografía (competiría con la imagen) ni
// sobre fondos claros, y como único elemento decorativo de la slide
// (core/brand/rules/density.json#/visualLanguageLimits: máx. 2, no debe
// competir con el título, no debe combinarse con más patrones).

import { CANVAS } from "./constants.mjs";
import { box } from "./elements.mjs";
import { brandAssetDataUri } from "./embed.mjs";

// Aproxima core/brand/assets/brand-wave.svg (#00387E -> #0D2157) con los
// tokens ya usados en el resto del sistema para fondos navy.
export const NAVY_GRADIENT_CSS = "background:linear-gradient(135deg, var(--sabana-blue-mid) 0%, var(--sabana-blue-deep) 70%);";

export function waveOverlay(repoRoot, { opacity = 0.5 } = {}) {
  const dataUri = brandAssetDataUri(repoRoot, "assets/brand-wave.svg");
  return box({
    x: 0,
    y: 0,
    width: CANVAS.width,
    height: CANVAS.height,
    style: `background-image:url('${dataUri}');background-size:cover;background-position:right center;opacity:${opacity};pointer-events:none;`,
  });
}
