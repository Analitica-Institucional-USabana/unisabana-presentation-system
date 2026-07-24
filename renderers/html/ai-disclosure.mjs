// Pie de atribución IA obligatorio en toda diapositiva (core/brand/rules/ai-disclosure.json).
// Esquina inferior derecha, opuesta al logo institucional (LOGO_POSITION en constants.mjs
// está en la esquina superior izquierda) — nunca colisionan por construcción.

import { CANVAS, AI_DISCLOSURE } from "./constants.mjs";
import { brandAssetDataUri } from "./embed.mjs";
import { box } from "./elements.mjs";

const BOX_WIDTH = 230;
const BOX_HEIGHT = 24;

export function aiDisclosureBox(repoRoot, backgroundTone) {
  const { right, bottom, textPx, logoHeightPx } = AI_DISCLOSURE;
  const dataUri = brandAssetDataUri(repoRoot, "assets/claude-logo.svg");
  const color = backgroundTone === "dark" ? "var(--sabana-blue-300)" : "var(--ink-500)";
  const filter = backgroundTone === "dark" ? "filter:brightness(0) invert(1);" : "";
  return box({
    x: CANVAS.width - right - BOX_WIDTH,
    y: CANVAS.height - bottom - BOX_HEIGHT,
    width: BOX_WIDTH,
    height: BOX_HEIGHT,
    style: `display:flex;align-items:center;justify-content:flex-end;gap:8px;font-family:var(--font-sans);font-size:${textPx}px;color:${color};`,
    html: `<span>Diseñado con Claude Design</span><img src="${dataUri}" alt="Claude" style="height:${logoHeightPx}px;width:auto;${filter}" />`,
  });
}
