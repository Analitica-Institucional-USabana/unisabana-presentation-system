# 02 — Arquitectura objetivo

## Diagrama textual de capas

```
┌─────────────────────────────────────────────────────────────────┐
│ 0. FUENTES ORIGINALES (congeladas, solo lectura, no distribuidas)│
│    _legacy/claude-design-system/  (el árbol actual, intacto)     │
└───────────────────────────────┬─────────────────────────────────┘
                                │ extracción manual, una vez, con proveniencia citada
┌───────────────────────────────▼─────────────────────────────────┐
│ 1. NÚCLEO CANÓNICO DE MARCA — core/                              │
│    core/brand/tokens.json         (fuente única; CSS es proyección)│
│    core/brand/rules/*.json        (logo, paleta, densidad, imagery)│
│    core/brand/assets/             (solo activos aprobados, planos) │
│    core/components/                (React real, .jsx + .d.ts)     │
└───────────────────────────────┬─────────────────────────────────┘
                                 │ consumido por
        ┌────────────────────────┼────────────────────────┐
┌───────▼───────┐        ┌───────▼────────┐       ┌────────▼───────┐
│ 2. SKILLS      │        │ 3. ESQUEMAS    │       │ 4. VALIDADORES │
│ skills/create/ │◄──────►│ core/schemas/  │◄─────►│ validators/    │
│ skills/review/ │        │ deck-spec      │       │ (deterministas)│
│ (SKILL.md      │        │ .schema.json   │       └────────┬───────┘
│  portable)     │        └───────┬────────┘                │
└───────┬───────┘                 │                          │
        │ produce/consume         │ valida                   │
        ▼                         ▼                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. DECK SPEC (instancia YAML validada contra el JSON Schema)      │
└───────────────────────────────┬─────────────────────────────────┘
                                │ renderiza
┌───────────────────────────────▼─────────────────────────────────┐
│ 6. RENDERERS                                                      │
│    renderers/html/   (MVP — HTML autocontenido)                   │
│    renderers/pptx/   (fase posterior)                             │
└───────────────────────────────┬─────────────────────────────────┘
                                │ empaquetado por
┌───────────────────────────────▼─────────────────────────────────┐
│ 7. ADAPTADORES DE PLATAFORMA                                       │
│    adapters/claude-plugin/  → .claude-plugin/plugin.json + marketplace.json │
│    adapters/codex-plugin/   → .codex-plugin/plugin.json + marketplace.json  │
└───────────────────────────────┬─────────────────────────────────┘
                                │ publicado en
┌───────────────────────────────▼─────────────────────────────────┐
│ 8. MARKETPLACE (repo git, inicialmente privado/interno)           │
└─────────────────────────────────────────────────────────────────┘
```

Capas transversales (no forman una línea recta, se conectan a varias capas anteriores): **CLI** (`cli/` — invoca validadores/renderers localmente, útil para CI y para desarrollo sin un agente), **Pruebas y evals** (`tests/`, ver `05-testing-strategy.md`), **Build y releases** (`build/` o scripts npm, ver `03-migration-roadmap.md`).

## Árbol de directorios propuesto

```
unisabana-presentation-system/
├── claude-design-system/          # SIN CAMBIOS — fuente original de Claude Design
├── planning/                      # este conjunto de documentos
├── _legacy/                       # (fase futura) copia congelada/tag de referencia si se decide mover
├── core/
│   ├── brand/
│   │   ├── tokens.json            # fuente única de tokens (color, tipografía, spacing, radii, shadows, canvas)
│   │   ├── tokens.css             # generado a partir de tokens.json (compatibilidad con components/)
│   │   ├── rules/
│   │   │   ├── logo.json          # tamaños, clear space, whitelist de assets, autoridad de marca
│   │   │   ├── palette.json       # institucional + 13 facultades, reglas de no-mezcla
│   │   │   ├── typography.json    # familia única, escala, pesos permitidos
│   │   │   ├── density.json       # límites de contenido por tipo de slide
│   │   │   ├── imagery.json       # whitelist de imágenes aprobadas, prohibición de generación sintética
│   │   │   └── ai-disclosure.json # regla de atribución IA (posición, tamaño, separación)
│   │   └── assets/                # solo activos aprobados, planos (subset curado de assets/, sin uploads/, sin assets/campus/)
│   ├── components/                # core/components/{brand,core,data}/*.jsx + .d.ts + index.ts real
│   └── schemas/
│       ├── deck-spec.schema.json
│       └── component-props.schema.json
├── skills/
│   ├── create/SKILL.md            # + references/ cargadas bajo demanda
│   └── review/SKILL.md
├── validators/                    # paquete Node/TS: valida Deck Spec + reglas de marca (estructural + determinista)
├── renderers/
│   └── html/                      # MVP: Deck Spec validado → HTML autocontenido
├── cli/                           # wrapper delgado: `unisabana validate|render <deck.yaml>`
├── adapters/
│   ├── claude-plugin/.claude-plugin/{plugin.json,marketplace.json}
│   └── codex-plugin/.codex-plugin/{plugin.json,marketplace.json} (+ marketplace.json)
├── tests/
│   ├── schema/ marca/ visual/ evals/ golden-decks/
└── docs/                          # documentación para humanos (marca, integradores, contribuidores)
```

No se crea nada de esto en esta fase — es la arquitectura objetivo documentada para las fases de implementación (Hitos 1+).

## Flujo de información (creación)

1. Usuario (en Claude Code o Codex) invoca la skill `create` con una petición en lenguaje natural + parámetros (audiencia, facultad/paleta, densidad).
2. La skill lee `core/brand/rules/*.json` bajo demanda (progressive disclosure) y produce un **Deck Spec** (YAML) — aquí el agente ejerce creatividad: narrativa, selección de layout, jerarquía.
3. `validators/` valida el Deck Spec contra `core/schemas/deck-spec.schema.json` (estructural) y contra `core/brand/rules/*.json` (cumplimiento) — aquí no hay creatividad, solo determinismo.
4. Si pasa, `renderers/html/` produce el HTML autocontenido (tokens y activos embebidos, layout ya "flatten" con `position:absolute` como paso mecánico del renderer, no como instrucción de prosa).
5. Se emite también el reporte de validación (estructura `SlideValidation` ya prevista en `readme.md` §14).

## Flujo de información (revisión)

1. Usuario invoca la skill `review` sobre una presentación existente (HTML, o eventualmente PPTX).
2. La skill/validador intenta reconstruir o recibir un Deck Spec equivalente (para HTML propio del sistema, esto es directo; para PPTX/HTML de terceros, se documenta como capacidad limitada/futura, no se promete en el MVP).
3. Se ejecutan las mismas reglas deterministas de `core/brand/rules/*.json` contra el artefacto, produciendo el mismo reporte `SlideValidation`.

## Separación entre creatividad y cumplimiento (cómo se materializa)

- El agente (skill `create`) **nunca** escribe HTML final directamente ni decide valores de marca "a mano" — solo produce un Deck Spec, que es datos, no presentación.
- `validators/` y `renderers/` son código determinista (TypeScript), sin llamadas a modelo, ejecutable en CI sin un agente.
- Esto es exactamente el principio 3.3 del enunciado (representación intermedia) resolviendo el 3.2 (separación creatividad/cumplimiento): la creatividad vive en la producción del Deck Spec; el cumplimiento vive en su validación y renderizado.

## Decisiones tecnológicas (resumen — detalle completo con alternativas en `07-decisions-and-open-questions.md`)

- **TypeScript/Node.js como núcleo principal.** Los componentes ya son React/JSX; el ecosistema de JSON Schema (ajv), YAML (yaml/js-yaml), y generación HTML es maduro en Node; tanto Claude Code como Codex invocan scripts vía Bash sin fricción adicional para Node. Python queda reservado, no se adopta ahora, para no fragmentar el toolchain del MVP.
- **YAML como formato de autoría del Deck Spec, JSON Schema como contrato de validación.** YAML es más legible para el propio agente y para revisión humana (coincide con el ejemplo del enunciado); se parsea a JSON y se valida con JSON Schema — no se inventa un lenguaje propio.
- **HTML autocontenido como primer renderer.** El design system ya es nativo en HTML/CSS; es el camino de menor fricción y el que permite reutilizar `components/**/*.jsx` casi sin cambios. PPTX y otros formatos se difieren a fases posteriores (Hito 7) y se deciden con una prueba de concepto acotada, no de antemano.
- **Un `core/` compartido, dos adaptadores de plataforma (no un plugin único multi-formato).** Confirmado por investigación: Claude Code y Codex usan esquemas de plugin/marketplace incompatibles entre sí; el nivel realmente portable es la skill (`SKILL.md` + carpeta de recursos), que sí puede copiarse sin cambios a `.claude/skills/` y a `.agents/skills/`.
- **Sin MCP en el MVP.** Toda la validación/renderizado es local y determinista; MCP se reserva para una integración externa concreta y futura (p. ej. un repositorio institucional de activos vivo o un servicio de aprobación de marca), no como capacidad especulativa.

## Estrategia multiplataforma

| Capa                                                             | Claude Code                                                                                                            | Codex                                                                                                        | Portabilidad                                                                                                                                      |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core/brand`, `core/schemas`, `core/components`            | consumido igual                                                                                                        | consumido igual                                                                                              | 100% — es solo datos/código, sin dependencia de plataforma                                                                                      |
| `skills/create/SKILL.md`, `skills/review/SKILL.md`           | `.claude/skills/<name>/` o dentro de un plugin                                                                       | `.agents/skills/<name>/` o dentro de un plugin Codex                                                       | Alta — mismo formato (`name`+`description`+carga progresiva), validable con `skills-ref validate` del repo oficial agentskills/agentskills |
| `validators/`, `renderers/html/`                             | invocados vía Bash desde la skill                                                                                     | invocados vía Bash desde la skill                                                                           | Alta — son scripts Node puros, sin API específica de plataforma                                                                                 |
| Empaquetado (`plugin.json`/manifest, comandos de instalación) | `.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json`, `/plugin marketplace add`, `/plugin install` | `.codex-plugin/plugin.json` + `marketplace.json`, `codex plugin marketplace add`, `codex plugin add` | Ninguna — esquemas y comandos distintos, requiere un adaptador por plataforma                                                                    |
| Hooks / MCP                                                      | soportado, no usado en MVP                                                                                             | mecanismo propio, no usado en MVP                                                                            | N/A para el MVP                                                                                                                                   |

## Separación core vs. adaptadores (por qué importa)

Si las reglas de marca o el Deck Spec cambiaran, el cambio ocurre **una sola vez** en `core/`. Cada adaptador de plataforma solo necesita volver a empaquetar (copiar `core/`, `skills/`, `validators/`, `renderers/` dentro de su propio árbol de plugin) — nunca reescribir reglas. Esto cumple directamente el principio 3.1 (fuente única de verdad) y evita la brecha G-07 identificada en el análisis de brechas.
