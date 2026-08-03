// core/brand/rules/cobrand.json: límites de la co-marca acotada. El tamaño
// relativo del logo secundario (maxHeightRelativeToPrimary) lo impone el
// propio renderer de forma fija (renderers/html/infografia/document.mjs,
// 60% del logo institucional) y por tanto no puede violarse desde la spec —
// lo único verificable aquí es que el color de acento de la co-marca no
// coincida por accidente con el acento institucional/de facultad ya activo
// (señal de que el usuario pegó el color equivocado, o de que en realidad no
// hace falta coBrand porque el color "distintivo" ya es el mismo).

import { readFileSync } from "node:fs";
import { join } from "node:path";

function activeAccentHex(tokens, palette) {
  if (palette === "institutional") return tokens.color.institutional["sabana-blue"].value;
  const weight = tokens.color.facultyAccentMapping[palette]?.accent;
  return weight ? tokens.color.faculties[palette]?.[weight] : null;
}

export function checkCobrandConstraints(spec, { repoRoot }, reportsById) {
  const root = reportsById.get("infografia");
  const { coBrand, palette } = spec.infografia;
  if (!coBrand) return;

  const tokens = JSON.parse(readFileSync(join(repoRoot, "core/brand/tokens.json"), "utf8"));
  const activeHex = activeAccentHex(tokens, palette);

  if (activeHex && coBrand.accentColor.toLowerCase() === activeHex.toLowerCase()) {
    root.add(
      "warning",
      `cobrand.json: el color de acento de la co-marca (${coBrand.accentColor}) es idéntico al acento institucional activo (${activeHex}) — confirma que sea realmente el color oficial de ${coBrand.institutionName} y no un valor copiado por error.`
    );
  } else {
    root.add("pass", `Color de acento de co-marca (${coBrand.accentColor}) distinto del acento institucional activo.`);
  }

  if (coBrand.priority === "equal") {
    root.add(
      "warning",
      "cobrand.json#/priority: prioridad visual 'equal' solicitada explícitamente — confirma que el usuario realmente pidió esto (guidelines/infografias.md §2, pregunta 6), ya que el logo de La Sabana nunca se retira ni se reduce por debajo de su mínimo aun así."
    );
  }
}
