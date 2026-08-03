// guidelines/infografias.md §3.7: el módulo de fuentes es obligatorio y nunca
// se omite en silencio. core/schemas/infografia-spec.schema.json ya exige
// `infografia.sources.developedBy` como campo requerido — si la Infografía
// Spec pasó la validación estructural, este campo existe. Lo que el schema NO
// puede expresar es la práctica recomendada de citar también la fuente de
// datos cuando la pieza presenta cifras de terceros — eso se queda en warning.

export function checkSourcesRequired(spec, _ctx, reportsById) {
  const root = reportsById.get("infografia");
  const { sources } = spec.infografia;

  root.add("pass", `Atribución presente: "${sources.developedBy}".`);

  const numericModuleTypes = new Set(["indicators", "comparison", "trend", "distribution"]);
  const hasNumericModule = spec.modules.some((m) => numericModuleTypes.has(m.type));
  if (hasNumericModule && !sources.dataSource) {
    root.add(
      "warning",
      "guidelines/infografias.md §3.7: la pieza presenta módulos de cifras (indicators/comparison/trend/distribution) pero infografia.sources.dataSource no está definido — cita explícitamente de dónde salen los datos."
    );
  }
}
