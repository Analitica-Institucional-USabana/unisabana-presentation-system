// Verifica accesibilidad (guidelines/infografias.md §10: "cuerpo mínimo 20px
// en piezas de proyección") sobre el HTML YA RENDERIZADO. Solo escanea
// elementos marcados con data-body-copy="1" (renderers/html/infografia/
// document.mjs: título de módulo, ítems de conclusiones) — las etiquetas de
// ejes/leyendas de los gráficos (renderers/html/charts/) son deliberadamente
// más pequeñas, mismo precedente que TYPE_SCALE_PX.caption/source en el
// renderer de decks (core/brand/rules/typography.json ya permite pies/fuentes
// más chicos que el cuerpo). No es un desborde de canvas fijo (no hay canvas
// fijo en una infografía) — es una guía de legibilidad real.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const BODY_COPY_RE = /data-body-copy="1"[^>]*font-size:(\d+)px/g;

export function checkAccessibilityMinBody(html, spec, { repoRoot }, reportsById) {
  const rules = JSON.parse(readFileSync(join(repoRoot, "core/brand/rules/infografia-canvas.json"), "utf8"));
  const minPx = rules.minBodyPxByMedium[spec.infografia.medium] ?? 16;
  const root = reportsById.get("infografia");

  let worst = Infinity;
  for (const match of html.matchAll(BODY_COPY_RE)) {
    worst = Math.min(worst, Number(match[1]));
  }

  if (worst === Infinity) {
    root.add("warning", "accessibility-min-body: no se encontró texto de cuerpo marcado (data-body-copy) para verificar — revisar manualmente.");
    return;
  }

  if (worst < minPx) {
    root.add(
      "error",
      `infografia-canvas.json#/minBodyPxByMedium/${spec.infografia.medium}=${minPx}px: se detectó texto de cuerpo a ${worst}px — nunca reducir por debajo del mínimo, divide el contenido en más módulos en su lugar.`
    );
  } else {
    root.add("pass", `Cuerpo de texto ≥ mínimo normativo para '${spec.infografia.medium}' (${worst}px ≥ ${minPx}px).`);
  }
}
