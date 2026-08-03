// Extiende validators/rules/icons.mjs (deck) a los campos con ícono propios
// de la Infografía Spec (infografia.keyNumbers[].icon, modules[].steps[].icon
// en módulos 'process') — mismo whitelist (core/brand/rules/icons.json),
// mismo criterio (error, no advertencia).
//
// Además implementa guidelines/infografias.md §6 ("nunca mezclar outline y
// solid en la misma pieza"): core/brand/rules/icons.json no tiene todavía un
// campo `style` por ícono porque el set vendorizado de hoy es 100% outline
// (Lucide por defecto) — no existe ningún ícono 'solid' que mezclar. Este
// chequeo asume 'outline' por defecto para cada slug y queda listo para
// activarse de verdad en cuanto icons.json incorpore un campo `style` real
// (p. ej. si se vendoriza un set 'solid' además del actual) — no se fabrica
// un valor de estilo que la fuente de datos no tiene.

import { readFileSync } from "node:fs";
import { join } from "node:path";

function checkSlug(slug, source, approved, r) {
  if (!approved.has(slug)) {
    r.add(
      "error",
      `icons.json#/approvedIcons: '${slug}' (${source}) no está en el subconjunto vendorizado de íconos aprobado. Nunca se usa un ícono fuera de esta lista.`
    );
    return null;
  }
  r.add("pass", `Ícono aprobado (${source}): ${slug}`);
  return approved.get(slug);
}

export function checkIconStyleConsistency(spec, { repoRoot }, reportsById) {
  const icons = JSON.parse(readFileSync(join(repoRoot, "core/brand/rules/icons.json"), "utf8"));
  const approved = new Map(icons.approvedIcons.map((i) => [i.slug, i.style || "outline"]));

  const usedStyles = new Set();
  const rootReport = reportsById.get("infografia");

  for (const item of spec.infografia.keyNumbers) {
    const r = rootReport;
    const style = checkSlug(item.icon, `keyNumbers · ${item.descriptor}`, approved, r);
    if (style) usedStyles.add(style);
  }

  for (const module of spec.modules) {
    if (module.type !== "process") continue;
    const r = reportsById.get(module.id);
    if (!r) continue;
    for (const step of module.steps) {
      if (!step.icon) continue;
      const style = checkSlug(step.icon, `paso '${step.label}'`, approved, r);
      if (style) usedStyles.add(style);
    }
  }

  if (usedStyles.size > 1) {
    rootReport.add(
      "error",
      `guidelines/infografias.md §6: se detectaron íconos de más de un estilo (${[...usedStyles].join(", ")}) en la misma pieza — usa outline o solid, nunca ambos.`
    );
  }
}
