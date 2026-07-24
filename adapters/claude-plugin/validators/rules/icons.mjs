// Regla determinista: todo slug de ícono referenciado en un banner debe estar
// en la whitelist de core/brand/rules/icons.json. Mismo principio que
// imagery.mjs — nunca se permite un ícono fuera de la lista aprobada.

import { readFileSync } from "node:fs";
import { join } from "node:path";

function checkSlug(slug, source, approved, r) {
  if (!approved.has(slug)) {
    r.add(
      "error",
      `icons.json#/approvedIcons: '${slug}' (${source}) no está en el subconjunto vendorizado de íconos aprobado. Nunca se usa un ícono fuera de esta lista.`
    );
  } else {
    r.add("pass", `Ícono aprobado (${source}): ${slug}`);
  }
}

export function checkIcons(deck, { repoRoot }, reportsById) {
  const icons = JSON.parse(readFileSync(join(repoRoot, "core/brand/rules/icons.json"), "utf8"));
  const approved = new Set(icons.approvedIcons.map((i) => i.slug));

  for (const slide of deck.slides) {
    const r = reportsById.get(slide.id);
    if (slide.banner?.icon) checkSlug(slide.banner.icon, "banner", approved, r);
    if (slide.type === "process") {
      for (const step of slide.steps ?? []) {
        if (step.icon) checkSlug(step.icon, `paso '${step.label}'`, approved, r);
      }
    }
  }
}
