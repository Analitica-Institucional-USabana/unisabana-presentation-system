// Verifica la atribución IA obligatoria (core/brand/rules/ai-disclosure.json)
// sobre el HTML YA RENDERIZADO: texto y logo de Claude presentes en cada slide.

import { brandAssetDataUri } from "../../scripts/lib/embed.mjs";
import { parseSlideSections } from "../parse-sections.mjs";

export function checkAiDisclosure(html, deck, { repoRoot }, reportsById) {
  const claudeLogo = brandAssetDataUri(repoRoot, "assets/claude-logo.svg");
  const sections = parseSlideSections(html);

  for (const { id, content } of sections) {
    const r = reportsById.get(id);
    if (!r) continue;

    const hasText = content.includes("Diseñado con Claude Design");
    const hasLogo = content.includes(claudeLogo);

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
