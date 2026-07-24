#!/usr/bin/env node
// Empaqueta todo lo que el plugin necesita EN TIEMPO DE EJECUCIÓN dentro de cada
// adaptador de plataforma. Decisión D-13 (planning/07-decisions-and-open-questions.md):
// los adaptadores son GENERADOS, no se editan a mano. Un cambio en core/, skills/,
// scripts/, renderers/ o validators/ se propaga a ambos adaptadores volviendo a
// ejecutar: node scripts/build-adapters.mjs
//
// Motivo (brecha G-02): Claude Code copia el plugin instalado a ~/.claude/plugins/cache
// y Codex tiene un mecanismo de caché análogo — ninguna ruta relativa que salga del
// árbol del plugin sobrevive a esa copia. Por eso TODO lo que las skills invocan vía
// Bash (scripts/validate-*.mjs, renderers/html, renderers/pptx, validators/) viaja
// DENTRO de cada adaptador, incluido node_modules (ajv, js-yaml, pptxgenjs) — sin eso,
// los comandos que las skills ejecutan fallarían tras una instalación real.
//
// tests/ y planning/ NO se incluyen: son material de desarrollo/documentación, no
// algo que el plugin necesite para funcionar (principio 3.5, instalación autocontenida).

import { cpSync, rmSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const adapters = ["adapters/claude-plugin", "adapters/codex-plugin"];
const RUNTIME_ITEMS = ["core", "skills", "scripts", "renderers", "validators", "node_modules", "package.json", "package-lock.json"];

for (const adapter of adapters) {
  const adapterPath = join(repoRoot, adapter);
  for (const item of RUNTIME_ITEMS) {
    const src = join(repoRoot, item);
    const dest = join(adapterPath, item);
    rmSync(dest, { recursive: true, force: true });
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(src, dest, { recursive: true });
    console.log(`${adapter}/${item} <- ${item} (copiado)`);
  }
}

console.log("\nBuild de adaptadores completo. Cada adaptador es autocontenido: no depende de rutas fuera de su propio árbol.");
