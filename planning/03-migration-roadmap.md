# 03 — Estrategia de migración y roadmap

## Principios de migración incremental

- El árbol `claude-design-system/` **se congela** como referencia (Hito 0) y no se borra ni se mueve en ninguna fase temprana.
- Toda extracción hacia `core/` es **copia + transformación**, nunca edición in-place de `claude-design-system/`.
- Cada hito produce algo instalable o verificable — no hay un hito "solo de diseño" después del Hito 0.

### Clasificación de cambios por hito

| Tipo | Significado |
|---|---|
| No destructivo | No borra ni sobrescribe nada existente |
| Reversible | Se puede deshacer sin pérdida (git revert de una carpeta nueva) |
| Automático | Ejecutable por script/CI sin intervención manual |
| Manual | Requiere una decisión o acción humana (ej. aprobación de marca) |
| Alto riesgo | Requiere confirmación explícita antes de ejecutar (ej. tocar licencias, publicar externamente) |

## Hito 0 — Auditoría y congelación

- **Objetivo:** tener un estado de referencia documentado e inmutable.
- **Entradas:** `claude-design-system/` actual.
- **Tareas:** este mismo conjunto de documentos en `planning/` (ya completado); etiquetar el commit actual (`git tag design-system-v0-frozen`, manual, con aprobación del usuario — no ejecutado en esta fase).
- **Entregables:** `planning/*.md` (este conjunto).
- **Criterios de aceptación:** `git status` no muestra cambios en `claude-design-system/`; el tag existe (cuando se autorice).
- **Dependencias:** ninguna. **Riesgo:** ninguno. **Talla:** XS. **Tipo:** no destructivo, reversible, manual (el tag).
- **Fuera de alcance:** cualquier extracción de código.

## Hito 1 — Núcleo canónico de marca

- **Objetivo:** `core/brand/tokens.json` + `core/brand/rules/*.json` + `core/components/` existen y son consumibles sin depender de `claude-design-system/`.
- **Entradas:** `tokens/*.css`, `_adherence.oxlintrc.json` (bloque `x-omelette`), `readme.md`, `components/**/*.jsx`.
- **Tareas:** extraer valores token por token con proveniencia citada (evitar inventar); generar `tokens.css` como proyección de `tokens.json` (no al revés) para no romper los `.jsx` existentes que leen `var(--...)`; crear `core/components/index.ts` real; escribir pruebas de esquema básicas (¿el JSON de reglas es válido?).
- **Entregables:** `core/brand/`, `core/components/`, primer `CHANGELOG.md` de `core/`.
- **Criterios de aceptación:** cada valor en `core/brand/rules/*.json` es trazable a una línea concreta de una fuente ya inventariada en `00-current-state-inventory.md`; los componentes renderizan igual visualmente que antes (comparación manual contra `*.card.html`).
- **Dependencias:** Hito 0. **Riesgo:** bajo (trabajo de extracción, no de invención). **Talla:** M. **Tipo:** no destructivo, automatizable parcialmente, reversible.
- **Fuera de alcance:** cualquier renderer o validador funcional todavía.

## Hito 2 — Agent Skill mínima

- **Objetivo:** `skills/create/SKILL.md` y `skills/review/SKILL.md` existen, son válidos contra el spec abierto (`skills-ref validate`), y cargan `core/brand` bajo demanda.
- **Entradas:** `SKILL.md` actual, Hito 1.
- **Tareas:** dividir el `SKILL.md` actual en dos skills con progressive disclosure real (metadata corta, cuerpo <500 líneas, referencias cargadas bajo demanda); validar campos frontmatter contra el spec agentskills.io (solo `name`+`description` garantizados portables).
- **Entregables:** `skills/create/`, `skills/review/`, cada una con sus `references/`.
- **Criterios de aceptación:** ambas skills pasan `skills-ref validate`; probadas manualmente dentro de Claude Code apuntando localmente a la carpeta (sin plugin todavía).
- **Dependencias:** Hito 1. **Riesgo:** bajo. **Talla:** M. **Tipo:** no destructivo, reversible.
- **Fuera de alcance:** empaquetado como plugin, marketplace.

## Hito 3 — Plugin instalable (Claude Code primero, Codex en paralelo o inmediatamente después)

- **Objetivo:** `adapters/claude-plugin/` instalable localmente vía `/plugin marketplace add <ruta-local>` + `/plugin install`; equivalente para Codex.
- **Entradas:** Hito 2, investigación de `02-target-architecture.md` sobre esquemas de manifiesto.
- **Tareas:** escribir `.claude-plugin/plugin.json` y `.claude-plugin/marketplace.json` (marketplace de desarrollo apuntando al propio repo); repetir para `.codex-plugin/`; verificar que ninguna ruta interna sale del árbol del plugin (usar `${CLAUDE_PLUGIN_ROOT}`/equivalente); smoke test de instalación local.
- **Entregables:** ambos adaptadores, un marketplace de desarrollo.
- **Criterios de aceptación:** instalación local exitosa en ambas plataformas; las skills responden igual que en Hito 2 tras instalarse desde el plugin (no en modo carpeta suelta).
- **Dependencias:** Hito 2. **Riesgo:** medio (primer contacto real con las restricciones de empaquetado). **Talla:** L. **Tipo:** no destructivo, automatizable, reversible (desinstalar).
- **Fuera de alcance:** publicación en un marketplace público/institucional.

## Hito 4 — Deck Spec

- **Objetivo:** `core/schemas/deck-spec.schema.json` definido y versionado; al menos un Deck Spec de ejemplo válido.
- **Entradas:** el ejemplo conceptual del enunciado, `readme.md` §9 (familias de slide requeridas), `_ds_manifest.json` (catálogo de slides existentes como inspiración de tipos).
- **Tareas:** diseñar el esquema con SemVer propio, separado del SemVer del plugin; escribir un validador de esquema mínimo (ajv); documentar la política de evolución sin romper compatibilidad (campos nuevos opcionales, `deprecated` explícito antes de remover).
- **Entregables:** `core/schemas/deck-spec.schema.json` v0.1.0, ejemplos en `tests/schema/`.
- **Criterios de aceptación:** un Deck Spec de ejemplo (portada + agenda + separador + contenido + cifras + cita + comparación + cierre) valida sin errores.
- **Dependencias:** Hito 1 (para poder referenciar enums de paleta/tipo válidos). **Riesgo:** medio (decisiones de esquema son costosas de revertir después de adopción). **Talla:** M. **Tipo:** no destructivo, reversible mientras no haya consumidores externos.
- **Fuera de alcance:** el renderer que consume el spec (Hito 5).

## Hito 5 — Renderer HTML

- **Objetivo:** Deck Spec validado → HTML autocontenido (tokens y activos embebidos, ya "flatten" — sin flex/grid en el resultado final).
- **Entradas:** Hito 4, `slides/*.html` como referencia visual de layout (no como fuente copiable, según lo documentado en `00-current-state-inventory.md`).
- **Tareas:** implementar un layout por cada tipo de slide del esquema; implementar el paso de flatten como transformación mecánica (no instrucción de prosa); embeber fuentes/activos para funcionamiento offline.
- **Entregables:** `renderers/html/`, una presentación de referencia completa generada end-to-end.
- **Criterios de aceptación:** el HTML generado abre correctamente sin conexión a internet; pasa una revisión visual manual contra los ejemplos de `slides/`.
- **Dependencias:** Hito 4. **Riesgo:** medio. **Talla:** L. **Tipo:** no destructivo, reversible.
- **Fuera de alcance:** PPTX, validación automática de marca (aunque el renderer puede ya incorporar validaciones básicas de capa, la validación formal es el Hito 6).

## Hito 6 — Validador institucional

- **Objetivo:** `validators/` ejecuta las reglas de `core/brand/rules/*.json` sobre un Deck Spec y, opcionalmente, sobre el HTML renderizado, produciendo el reporte `SlideValidation` (estructura ya prevista en `readme.md` §14).
- **Entradas:** Hitos 1, 4, 5.
- **Tareas:** validaciones estructurales (Deck Spec vs esquema), validaciones de marca (paleta, tipografía, densidad, logo — incluida la lógica de clear-space y colisión ya descrita en `readme.md`), reporte con niveles `error`/`warning`/`pass` y política de bloqueo de export en `error`.
- **Entregables:** `validators/`, integrado en la skill `review` y como paso previo obligatorio en la skill `create`.
- **Criterios de aceptación:** el validador detecta intencionalmente decks de prueba con violaciones conocidas (paleta mezclada, logo sub-mínimo, atribución IA ausente) — ver golden decks negativos en `05-testing-strategy.md`.
- **Dependencias:** Hito 5. **Riesgo:** medio-alto (es donde se materializa la fidelidad institucional; errores aquí son los más visibles). **Talla:** L. **Tipo:** no destructivo, reversible.
- **Fuera de alcance:** revisión visual con navegador headless (evaluar en este hito si se necesita, pero no comprometerse de antemano — ver decisión D-18 en `07`).

## Hito 7 — Renderer PPTX

- **Objetivo:** Deck Spec → `.pptx` editable, con fidelidad razonable a la plantilla oficial.
- **Entradas:** Hitos 4–6, `uploads/AF-PLANTILLA PPT GENERA-3.pptx` como referencia (no como plantilla programática hasta confirmar licencia de uso, ver `07`).
- **Tareas:** prueba de concepto acotada comparando `pptxgenjs` (Node) vs `python-pptx` (Python) antes de comprometerse a una libería (ver decisión D-07); decidir si se introduce Python solo para este renderer o se fuerza todo a Node.
- **Entregables:** `renderers/pptx/` (o decisión documentada de no seguir esta ruta si la POC no es viable).
- **Criterios de aceptación:** un PPTX generado abre correctamente en PowerPoint real, con texto editable (no solo imágenes rasterizadas).
- **Dependencias:** Hito 6. **Riesgo:** alto (mayor incertidumbre técnica de todo el roadmap). **Talla:** XL. **Tipo:** no destructivo, reversible, con una decisión de alto riesgo embebida (elección de librería/lenguaje).
- **Fuera de alcance:** replicar el 100% de la plantilla maestra pixel-perfect en la primera iteración.

## Hito 8 — Marketplace institucional

- **Objetivo:** un marketplace real (inicialmente privado/interno) donde `/plugin install unisabana-presentations@unisabana` funcione tal como lo describe el objetivo del proyecto.
- **Entradas:** Hitos 3–7 completos y estables.
- **Tareas:** decidir visibilidad del repo (privado primero, ver `06-security-and-governance.md`), versión 1.0.0 con SemVer real, changelog, licencia declarada.
- **Entregables:** repo de marketplace publicado (privado), release 1.0.0 taggeado.
- **Criterios de aceptación:** un tercero (otra persona del equipo) instala el plugin siguiendo solo la documentación, sin ayuda directa.
- **Dependencias:** todos los anteriores. **Riesgo:** alto si se publica antes de resolver G-15/G-16/G-21 (firma, licencia, procedencia de activos). **Talla:** M. **Tipo:** manual, alto riesgo (primera exposición fuera del entorno de desarrollo).
- **Fuera de alcance:** publicación pública/externa a la universidad (requiere aprobación institucional explícita, no técnica).

## Hito 9 — Integraciones externas

- **Objetivo:** evaluar necesidades reales de MCP u otras integraciones (ej. repositorio institucional de activos, sistema de aprobación de marca) solo si aparece un caso concreto.
- **Entradas:** uso real del Hito 8.
- **Tareas:** explícitamente diferido — no se diseña nada aquí hasta que exista una necesidad de integración externa real, según el principio "no proponer MCP sin una integración externa concreta".
- **Riesgo:** bajo (es opcional). **Talla:** variable, no estimable hoy.
- **Fuera de alcance:** todo, hasta que haya una necesidad concreta.

## Hito 10 — Gobernanza y adopción

- **Objetivo:** proceso formal de aprobación de cambios de marca, rotación de "brand owner", proceso de contribución.
- **Entradas:** uso real del sistema por más de un equipo/facultad.
- **Tareas:** ver `06-security-and-governance.md` §Roles y aprobaciones.
- **Riesgo:** organizacional, no técnico. **Talla:** M.

## Orden recomendado y dependencias críticas

```
Hito 0 → Hito 1 → Hito 2 → Hito 3
                       └──→ Hito 4 → Hito 5 → Hito 6 → Hito 7
Hito 3 y Hito 6 completos → Hito 8 → Hito 9 (opcional) → Hito 10
```

Los Hitos 2–3 (skill + plugin instalable) y 4–6 (Deck Spec + renderer + validador) pueden avanzar en paralelo una vez completado el Hito 1, ya que dependen del núcleo canónico pero no entre sí directamente — sin embargo, el Hito 3 (plugin instalable) debería empaquetar ya el resultado del Hito 6 antes de considerarse "listo para marketplace" (Hito 8).
