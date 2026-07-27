// Verifica la atribución IA obligatoria (core/brand/rules/ai-disclosure.json)
// sobre el HTML YA RENDERIZADO: texto y logo de la plataforma generadora
// presentes en cada slide. El texto/logo esperados se resuelven por
// plataforma (platform.mjs, D-Q5) en vez de asumir siempre Claude — así un
// deck correctamente generado por Codex no falla la validación de marca
// (planning/10-numbering-footer-safety-logo-and-multiplatform-branding.md #7).

import { brandAssetDataUri } from "../../scripts/lib/embed.mjs";
import { resolvePlatform } from "../../renderers/html/platform.mjs";
import { parseSlideSections } from "../parse-sections.mjs";

export function checkAiDisclosure(html, deck, { repoRoot }, reportsById) {
  const platform = resolvePlatform(repoRoot);
  const sections = parseSlideSections(html);

  for (const { id, tone, content } of sections) {
    const r = reportsById.get(id);
    if (!r) continue;

    // El asset esperado depende del tono de la slide cuando hay variantes
    // dedicadas (logoAssetDark) — mismo criterio que renderers/*/ai-disclosure.mjs.
    const assetRelPath = tone === "dark" && platform.logoAssetDark ? platform.logoAssetDark : platform.logoAsset;
    const expectedLogo = assetRelPath ? brandAssetDataUri(repoRoot, assetRelPath) : null;

    const hasText = content.includes(platform.attributionText);
    const hasLogo = expectedLogo ? content.includes(expectedLogo) : true;

    if (!hasText || !hasLogo) {
      r.add(
        "error",
        `ai-disclosure.json: atribución IA incompleta (texto ${hasText ? "presente" : "AUSENTE"}, logo ${hasLogo ? "presente" : "AUSENTE"}) — obligatoria en toda diapositiva.`
      );
    } else {
      r.add("pass", "Atribución IA presente (texto + logo).");
    }
  }
}
