#!/usr/bin/env node
// Empaqueta core/ y skills/ dentro de cada adaptador de plataforma.
// Decisión D-13 (planning/07-decisions-and-open-questions.md): los adaptadores son
// GENERADOS, no se editan a mano. Un cambio en core/ o skills/ se propaga a ambos
// adaptadores volviendo a ejecutar: node scripts/build-adapters.mjs
//
// Motivo (brecha G-02): Claude Code copia el plugin instalado a ~/.claude/plugins/cache
// y Codex tiene un mecanismo de caché análogo — ninguna ruta relativa que salga del
// árbol del plugin sobrevive a esa copia. Por eso core/ y skills/ viajan DENTRO de
// cada adaptador, no se referencian desde fuera.

import { cpSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const adapters = ["adapters/claude-plugin", "adapters/codex-plugin"];

for (const adapter of adapters) {
  const adapterPath = join(repoRoot, adapter);
  for (const dir of ["core", "skills"]) {
    const src = join(repoRoot, dir);
    const dest = join(adapterPath, dir);
    rmSync(dest, { recursive: true, force: true });
    mkdirSync(dest, { recursive: true });
    cpSync(src, dest, { recursive: true });
    console.log(`${adapter}/${dir}/ <- ${dir}/ (copiado)`);
  }
}

console.log("\nBuild de adaptadores completo. Cada adaptador es autocontenido: no depende de rutas fuera de su propio árbol.");
