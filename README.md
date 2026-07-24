# unisabana-presentation-system

Sistema de presentaciones institucional de Universidad de La Sabana: crea, valida, renderiza (HTML autocontenido y PPTX) y revisa presentaciones respetando la marca oficial, mediante dos skills (`unisabana-create`, `unisabana-review`) instalables como plugin en Claude Code y en Codex.

Repositorio institucional: https://github.com/Analitica-Institucional-USabana/unisabana-presentation-system

Ver `planning/README.md` para el análisis y la hoja de ruta completos.

## Instalación

Los adaptadores (`adapters/claude-plugin/`, `adapters/codex-plugin/`) son autocontenidos a propósito: incluyen su propio `core/`, `skills/`, `scripts/`, `renderers/`, `validators/` y `node_modules/` (con `ajv`, `js-yaml`, `pptxgenjs`, que las skills invocan vía Bash). Se comitean tal cual — incluido `node_modules/`, excepcionado en `.gitignore` — porque tanto Claude Code como Codex cachean el plugin instalado a partir de lo que hay en el repo remoto; sin las dependencias vendorizadas ahí, un clon público quedaría sin ellas y las skills fallarían en el primer uso.

### Claude Code

1. Agrega el marketplace institucional de la Jefatura:
   ```
   /plugin marketplace add https://github.com/Analitica-Institucional-USabana/unisabana-presentation-system.git
   ```
2. Instala el plugin:
   ```
   /plugin install unisabana-presentations@unisabana-dev
   ```
3. Confirma que las skills quedaron disponibles pidiéndole a Claude que cree una presentación de prueba (dispara `unisabana-create`).

### Codex

1. Agrega el marketplace institucional:
   ```
   codex plugin marketplace add https://github.com/Analitica-Institucional-USabana/unisabana-presentation-system.git
   ```
2. Instala el plugin:
   ```
   codex plugin add unisabana-presentations
   ```

El esquema de `.codex-plugin/plugin.json` y `.agents/plugins/marketplace.json` se verificó contra la documentación de Codex el 2026-07-23, pero dos valores (`policy.authentication`, `category`) no tienen un enum oficial confirmado — ver `adapters/codex-plugin/README.md`. Confirma ambos, y el formato exacto de URL aceptado por `codex plugin marketplace add`, contra la documentación vigente de Codex antes de depender de esto en un entorno real.

## Desarrollo

Si vas a modificar algo bajo `core/`, `skills/`, `scripts/`, `renderers/` o `validators/`, instala dependencias y regenera los adaptadores antes de comitear — son generados, nunca se editan a mano (`planning/07-decisions-and-open-questions.md` D-13):

```bash
npm install
npm run build:adapters
```

Para probar un checkout local sin publicar nada, usa la misma ruta del repo en vez de la URL de GitHub, tanto en `/plugin marketplace add` como en `codex plugin marketplace add` (ambos aceptan una ruta local absoluta).
