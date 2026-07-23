# Adaptador Codex (generado — no editar a mano)

`core/` y `skills/` en este directorio son copias generadas por `scripts/build-adapters.mjs` desde la raíz del repo. Para cambiar algo, edita la fuente en `core/`/`skills/` y vuelve a ejecutar `node scripts/build-adapters.mjs` — no edites las copias de aquí directamente.

## Nota de incertidumbre sobre el esquema (transparencia, no inventar)

El esquema de `.codex-plugin/plugin.json` y de `.agents/plugins/marketplace.json` (en la raíz del repo) se verificó contra `developers.openai.com/codex/plugins/build` el 2026-07-23 — campos confirmados: `name`, `version`, `description`, `skills`, `author`, `interface.displayName/shortDescription/category`, y en el marketplace `source.local.path`, `policy.installation`, `policy.authentication`, `category`.

Dos valores se eligieron sin poder confirmar el listado exhaustivo de opciones válidas contra la documentación:

- `policy.authentication: "ON_INSTALL"` — el plugin no requiere ninguna autenticación real; se eligió este valor por ser el más neutro de los dos documentados (`ON_INSTALL` / `ON_FIRST_USE`), pero su semántica exacta para un plugin sin flujo de auth no se confirmó.
- `category: "productivity"` — no se encontró un enum oficial completo de categorías válidas; se usó un valor plausible.

**Antes de ejecutar `codex plugin marketplace add` / `codex plugin add` contra este repo en un entorno real, confirma ambos valores contra la documentación vigente de Codex** (puede haber cambiado desde julio de 2026). Ver también `planning/07-decisions-and-open-questions.md`.
