// Pie de atribución IA obligatorio en toda diapositiva (core/brand/rules/ai-disclosure.json).
// Esquina inferior derecha, opuesta al logo institucional (LOGO_POSITION en constants.mjs
// está en la esquina superior izquierda) — nunca colisionan por construcción.
// Texto/logo se resuelven por plataforma generadora (platform.mjs, D-Q5).

import { CANVAS, AI_DISCLOSURE } from "./constants.mjs";
import { brandAssetDataUri } from "./embed.mjs";
import { box } from "./elements.mjs";
import { resolvePlatform } from "./platform.mjs";

const BOX_WIDTH = 230;
const BOX_HEIGHT = 24;

export function aiDisclosureBox(repoRoot, backgroundTone) {
  const { right, bottom, textPx, logoHeightPx } = AI_DISCLOSURE;
  const platform = resolvePlatform(repoRoot);
  const color = backgroundTone === "dark" ? "var(--sabana-blue-300)" : "var(--ink-500)";

  let logoHtml = "";
  if (platform.logoAsset) {
    const useDarkAsset = backgroundTone === "dark" && platform.logoAssetDark;
    const assetPath = useDarkAsset ? platform.logoAssetDark : platform.logoAsset;
    // Sin variante dedicada para fondo oscuro (caso Claude), se recurre al
    // filtro CSS histórico: invertir el asset único a blanco.
    const filter = !platform.logoAssetDark && backgroundTone === "dark" ? "filter:brightness(0) invert(1);" : "";
    logoHtml = `<img src="${brandAssetDataUri(repoRoot, assetPath)}" alt="${platform.name}" style="height:${logoHeightPx}px;width:auto;${filter}" />`;
  }
  return box({
    x: CANVAS.width - right - BOX_WIDTH,
    y: CANVAS.height - bottom - BOX_HEIGHT,
    width: BOX_WIDTH,
    height: BOX_HEIGHT,
    style: `display:flex;align-items:center;justify-content:flex-end;gap:8px;font-family:var(--font-sans);font-size:${textPx}px;color:${color};`,
    html: `<span>${platform.attributionText}</span>${logoHtml}`,
  });
}
