// Carga y valida un Deck Spec YAML contra core/schemas/deck-spec.schema.json.
// Usado tanto por scripts/validate-deck-spec.mjs (CLI de validación) como por
// renderers/html/render.mjs (decisión D-15: no duplicar la lógica de validación
// entre el CLI y el renderer/skill).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import yaml from "js-yaml";
import Ajv2020 from "ajv/dist/2020.js";

const repoRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

let cachedValidator = null;
function getValidator() {
  if (cachedValidator) return cachedValidator;
  const schema = JSON.parse(
    readFileSync(join(repoRoot, "core/schemas/deck-spec.schema.json"), "utf8")
  );
  const ajv = new Ajv2020({ allErrors: true, strict: false, discriminator: true });
  cachedValidator = ajv.compile(schema);
  return cachedValidator;
}

export function loadAndValidateDeckSpec(yamlPath) {
  const deck = yaml.load(readFileSync(yamlPath, "utf8"));
  const validate = getValidator();
  const valid = validate(deck);
  return {
    deck,
    valid,
    errors: valid
      ? []
      : validate.errors.map(
          (e) => `${e.instancePath || "(raíz)"} ${e.message} ${JSON.stringify(e.params)}`
        ),
  };
}

export { repoRoot };
