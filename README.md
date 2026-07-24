# unisabana-presentation-system

Sistema de presentaciones institucional de Universidad de La Sabana: crea, valida, renderiza (HTML autocontenido y PPTX) y revisa presentaciones respetando la marca oficial, mediante dos skills (`unisabana-create`, `unisabana-review`) instalables como plugin en Claude Code y en Codex.

Ver `planning/README.md` para el análisis y la hoja de ruta completos.

## Instalación

Si acabas de clonar el repo o modificaste algo bajo `core/`, `skills/`, `scripts/`, `renderers/` o `validators/`, instala dependencias y regenera los adaptadores primero — son generados, nunca se editan a mano (`planning/07-decisions-and-open-questions.md` D-13):

```bash
npm install
npm run build:adapters
```

Por ahora la instalación es solo como **marketplace de desarrollo local** apuntando a este mismo repo — no hay marketplace público todavía (`planning/04-mvp-definition.md`).

### Claude Code

El repo ya trae el marketplace de desarrollo en `.claude-plugin/marketplace.json`, apuntando a `adapters/claude-plugin`.

1. Agrega el marketplace local (usa la ruta a este repo):
   ```
   /plugin marketplace add /ruta/a/unisabana-presentation-system
   ```
2. Instala el plugin:
   ```
   /plugin install unisabana-presentations@unisabana-dev
   ```
3. Confirma que las skills quedaron disponibles pidiéndole a Claude que cree una presentación de prueba (dispara `unisabana-create`).

### Codex

El repo trae el marketplace de desarrollo equivalente en `.agents/plugins/marketplace.json`, apuntando a `adapters/codex-plugin`.

1. Agrega el marketplace local:
   ```
   codex plugin marketplace add /ruta/a/unisabana-presentation-system
   ```
2. Instala el plugin:
   ```
   codex plugin add unisabana-presentations
   ```

El esquema de `.codex-plugin/plugin.json` y `.agents/plugins/marketplace.json` se verificó contra la documentación de Codex el 2026-07-23, pero dos valores (`policy.authentication`, `category`) no tienen un enum oficial confirmado — ver `adapters/codex-plugin/README.md`. Confirma ambos contra la documentación vigente de Codex antes de instalar en un entorno real.

### Nota común

Ambos adaptadores son autocontenidos: incluyen su propio `core/`, `skills/`, `scripts/`, `renderers/`, `validators/` y `node_modules/`, sin depender de rutas fuera de su propio árbol — necesario porque ambas plataformas cachean el plugin ya instalado y una ruta relativa que saliera del árbol del plugin no sobreviviría a esa copia.
