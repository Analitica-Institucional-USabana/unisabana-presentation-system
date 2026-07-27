// Identidad de la plataforma generadora (Claude Code vs. Codex), para
// parametrizar el pie de atribución IA por adaptador — resuelve D-Q5
// (planning/07-decisions-and-open-questions.md, core/brand/rules/ai-
// disclosure.json#/openQuestion). planning/10-numbering-footer-safety-logo-
// and-multiplatform-branding.md #7.
//
// Mismo patrón que adapters/*/.{claude,codex}-plugin/plugin.json: un archivo
// platform.json hand-authored por adaptador, fuera de RUNTIME_ITEMS
// (scripts/build-adapters.mjs nunca lo toca). Si no existe ninguno (correr
// desde la raíz del repo en desarrollo, sin identidad de adaptador), se usa
// el valor por defecto de Claude.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DEFAULT_PLATFORM = {
  name: "claude",
  attributionText: "Diseñado con Claude Design",
  logoAsset: "assets/claude-logo.svg",
  // logoAssetDark: variante dedicada para fondo oscuro (ej. el isotipo blanco
  // de OpenAI, junto a logoAsset como su variante negra para fondo claro —
  // mismo patrón que logo.mjs con el logo institucional). Si se omite (caso
  // de Claude), se recurre al filtro CSS histórico (invertir logoAsset a
  // blanco) en vez de exigir una segunda variante — ver ai-disclosure.mjs.
  logoAssetDark: null,
};

const MANIFEST_PATHS = [".claude-plugin/platform.json", ".codex-plugin/platform.json"];

export function resolvePlatform(repoRoot) {
  for (const rel of MANIFEST_PATHS) {
    const path = join(repoRoot, rel);
    if (!existsSync(path)) continue;
    try {
      return { ...DEFAULT_PLATFORM, ...JSON.parse(readFileSync(path, "utf8")) };
    } catch {
      // Manifiesto malformado — se ignora y se sigue probando/usando el default.
    }
  }
  return DEFAULT_PLATFORM;
}
