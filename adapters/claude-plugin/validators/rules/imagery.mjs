// Regla determinista: toda foto referenciada en un slide cover{background:photo}
// debe estar en la whitelist de core/brand/rules/imagery.json. Nunca se infiere
// ni se permite una ruta fuera de esa lista (principio 3.6, preservación institucional).

import { readFileSync } from "node:fs";
import { join } from "node:path";

export function checkImagery(deck, { repoRoot }, reportsById) {
  const imagery = JSON.parse(readFileSync(join(repoRoot, "core/brand/rules/imagery.json"), "utf8"));
  const approved = new Set(imagery.approvedCampusPhotography.map((a) => a.path));

  for (const slide of deck.slides) {
    if (slide.type !== "cover" || slide.background !== "photo") continue;
    const r = reportsById.get(slide.id);
    if (!approved.has(slide.photo)) {
      r.add(
        "error",
        `imagery.json#/approvedCampusPhotography: '${slide.photo}' no está en la whitelist de fotografía de campus aprobada. Nunca se usa ni se genera una imagen fuera de esta lista.`
      );
    } else {
      r.add("pass", `Imagen de campus aprobada: ${slide.photo}`);
    }
  }
}
