// Verifica el logo institucional sobre el HTML YA RENDERIZADO: presencia,
// tamaño mínimo (core/brand/rules/logo.json#/sizing/minimumSymbolHeight) y
// variante correcta según el tono de fondo de cada diapositiva
// (core/brand/rules/logo.json#/contrastAndBackground).

import { brandAssetDataUri } from "../../scripts/lib/embed.mjs";
import { parseSlideSections } from "../parse-sections.mjs";

const HEIGHT_RE = /alt="Universidad de La Sabana" style="height:(\d+)px/;

export function checkLogo(html, deck, { repoRoot }, reportsById) {
  const colorLogo = brandAssetDataUri(repoRoot, "assets/logo-horizontal-color.png");
  const whiteLogo = brandAssetDataUri(repoRoot, "assets/logo-horizontal-white.png");
  const sections = parseSlideSections(html);

  for (const { id, tone, content } of sections) {
    const r = reportsById.get(id);
    if (!r) continue;

    const heightMatch = content.match(HEIGHT_RE);
    if (!heightMatch) {
      r.add("error", "logo.json: logo institucional no encontrado en la diapositiva renderizada.");
      continue;
    }
    const height = Number(heightMatch[1]);
    if (height < 22) {
      r.add("error", `logo.json#/sizing/minimumSymbolHeight.screenPx=22: altura detectada ${height}px.`);
    } else {
      r.add("pass", `Logo institucional ≥ mínimo normativo (${height}px).`);
    }

    const expected = tone === "dark" ? whiteLogo : colorLogo;
    const expectedLabel = tone === "dark" ? "blanco/negativo" : "positivo/color";
    if (!content.includes(expected)) {
      r.add(
        "error",
        `logo.json#/contrastAndBackground: se esperaba la variante ${expectedLabel} para fondo ${tone === "dark" ? "oscuro" : "claro"}.`
      );
    } else {
      r.add("pass", `Variante de logo correcta para el fondo (${expectedLabel}).`);
    }
  }
}
