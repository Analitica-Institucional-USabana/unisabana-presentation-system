# 01 — Análisis de brechas

Cada brecha: descripción · impacto · prioridad (P0–P2) · dependencias · riesgo · propuesta · fase recomendada (referencia a hitos de `03-migration-roadmap.md`).

## Distribución

**G-01 — No existe manifiesto de plugin ni de marketplace.**
Hoy el sistema solo existe como carpeta dentro del entorno de autoría de Claude Design; no hay `.claude-plugin/plugin.json` ni `.claude-plugin/marketplace.json`, ni sus equivalentes de Codex (`.codex-plugin/plugin.json`, `marketplace.json`).
Impacto: no instalable por `/plugin install` en ninguna plataforma. Prioridad: P0. Dependencias: núcleo canónico extraído (G-05). Riesgo: bajo (es aditivo). Propuesta: crear adaptadores separados `adapters/claude-plugin/` y `adapters/codex-plugin/` que empaqueten el mismo `core/` y las mismas skills. Fase: Hito 3.

**G-02 — Rutas relativas del bundle actual no sobreviven a un install real.**
`claude-design-system/` usa rutas relativas (`../styles.css`, `assets/...`) asumiendo que todo el árbol viaja junto dentro del entorno de Claude Design. Claude Code copia el plugin a `~/.claude/plugins/cache` (rutas fuera del árbol del plugin se rompen); Codex tiene un mecanismo de caché análogo.
Impacto: cualquier referencia a `../uploads/` o a algo fuera del paquete final falla tras instalación. Prioridad: P0. Riesgo: medio si no se detecta antes de publicar. Propuesta: todo lo que el paquete necesite en tiempo de ejecución debe vivir dentro de su propio árbol y usar `${CLAUDE_PLUGIN_ROOT}` / el equivalente de Codex, nunca rutas que salgan del plugin. Fase: Hito 3.

## Manifiestos y esquemas

**G-03 — No existe un Deck Spec (representación intermedia).**
Hoy un agente va directo de instrucción en lenguaje natural a HTML, sin una capa declarativa validable en medio.
Impacto: imposibilita separar "qué decidió el agente" de "qué permite la marca"; imposibilita validar antes de renderizar; bloquea múltiples renderers (HTML, PPTX) desde una única fuente. Prioridad: P0. Dependencias: ninguna. Riesgo: bajo si se versiona desde el inicio con SemVer del esquema. Propuesta: JSON Schema + formato de autoría YAML (ver 02 y 07, decisión D-04). Fase: Hito 4.

**G-04 — Reglas de marca dispersas y solo parcialmente machine-readable.**
Las reglas viven repartidas en `readme.md` (prosa + bloques `ts`/`css` embebidos), `_adherence.oxlintrc.json` (bloque `x-omelette`, JSON real pero acoplado a oxlint/JSX), y ejemplos visuales en `guidelines/`.
Impacto: un validador no tiene hoy una única fuente que consultar; cualquier cambio de marca requiere editar prosa y código en paralelo, con riesgo de divergencia. Prioridad: P0. Dependencias: 00-inventory ya identificó qué extraer. Riesgo: bajo, es trabajo de extracción, no de invención (no se debe inventar ninguna regla no presente en las fuentes). Propuesta: consolidar en `core/brand/rules/*.json` (paletas, tipografía, logo, densidad, iconografía) con proveniencia citada a la línea de `readme.md` o al bloque `x-omelette` de origen. Fase: Hito 1.

## Skills

**G-05 — Un solo skill mezcla "ser experto en la marca" con "crear" y no separa "revisar".**
`SKILL.md` actual apunta a todo el árbol y asume que el propio agente decide cuándo aplicar reglas de cumplimiento vs. libertad creativa.
Impacto: no hay forma de invocar solo "revisar cumplimiento de un deck existente" sin volver a cargar todo el contexto de autoría; viola el principio 3.2 (separación creatividad/cumplimiento) del objetivo del proyecto. Prioridad: P0. Riesgo: bajo. Propuesta: dos skills (`create`, `review`) que comparten el mismo `core/brand/` vía referencia dentro del mismo paquete (no símlinks externos). Fase: Hito 2.

**G-06 — El SKILL.md actual no está optimizado para "progressive disclosure".**
Apunta el agente a leer `readme.md` completo (más de 1100 líneas) más `styles.css` + todas las subcarpetas, en vez de cargar bajo demanda solo lo que aplica al slide/tarea actual.
Impacto: consumo de contexto innecesario, más difícil de razonar para el agente en tareas puntuales. Prioridad: P1. Propuesta: dividir en `SKILL.md` corto (triggers + resumen no-negociables) + archivos de referencia cargados bajo demanda (`references/logo.md`, `references/palette.md`, etc.), replicando el patrón ya usado por otras skills en este mismo entorno (`dataviz`, por ejemplo). Fase: Hito 2.

## Arquitectura

**G-07 — No hay separación entre "fuente de verdad" y "artefacto de autoría de Claude Design".**
Hoy todo vive en una sola carpeta plana donde conviven tokens reales, componentes React reales, y tooling interno regenerable (`_ds_bundle.js`, `support.js`, `*.dc.html`).
Impacto: alto riesgo de que una futura automatización trate `_ds_bundle.js` o `*.dc.html` como si fueran la fuente, introduciendo inconsistencias. Prioridad: P0. Propuesta: la carpeta actual se congela como `_legacy/claude-design-system/` (solo lectura, referencia de desarrollo), y el núcleo canónico se reconstruye en `core/` a partir de ella. Fase: Hito 0–1.

**G-08 — No hay separación entre lógica de validación y lógica de renderizado.**
No existe hoy ningún validador ni renderer independiente; todo el "cumplimiento" depende de que un agente lea y aplique la prosa correctamente cada vez.
Impacto: cumplimiento no determinista, no repetible, no testeable automáticamente. Prioridad: P0. Propuesta: `validators/` (determinista, JSON Schema + reglas de marca) y `renderers/html/` (determinista, produce HTML autocontenido a partir de un Deck Spec ya validado) como paquetes separados. Fase: Hitos 5–6.

## Tokens

**G-09 — Tokens solo existen como CSS; no hay representación neutra de lenguaje.**
Un futuro renderer PPTX (python-pptx / pptxgenjs) no puede leer `var(--sabana-blue)` directamente.
Impacto: bloquea renderers no-CSS. Prioridad: P1 (no bloquea el MVP HTML). Propuesta: generar `core/brand/tokens.json` como fuente única, y CSS variables como una *proyección* generada de ese JSON (no al revés), preservando compatibilidad con los componentes React existentes. Fase: Hito 1, ampliado en Hito 7.

## Componentes

**G-10 — Componentes React no tienen build/paquete propio, dependen de `_ds_bundle.js`.**
No hay `package.json`, `index.js` ni bundler configurado en `components/`; solo existe el bundle generado por Claude Design.
Impacto: no se pueden usar los componentes fuera del entorno de Claude Design sin reconstruir el empaquetado. Prioridad: P1. Propuesta: crear un paquete mínimo en `core/components/` con un `index.ts` real (el propio `_adherence.oxlintrc.json` ya espera esta convención — "forces DS imports through `index.js`"). Fase: Hito 1.

## Renderizado

**G-11 — No existe renderer HTML autocontenido.**
`slides/*.html` referencian `styles.css` externamente y no están flatten (ver contradicción documentada en 00). No sirven como salida final de un pipeline automatizado.
Impacto: bloquea la salida "HTML autocontenido" pedida como parte del MVP. Prioridad: P0. Propuesta: renderer que tome Deck Spec → HTML con CSS y activos embebidos (inline/base64 o data URI) y aplique el flatten (`position:absolute`) como paso mecánico, no como instrucción de prosa. Fase: Hito 5.

**G-12 — No existe estrategia para PPTX editable.**
Ningún archivo actual genera `.pptx`; el único PPTX es el material fuente en `uploads/` (aportado por el cliente, no generado por el sistema).
Impacto: bloquea entregables editables por perfiles no técnicos en PowerPoint. Prioridad: P2 (explícitamente diferido). Propuesta: evaluar `pptxgenjs` (Node, coherente con el resto del stack) vs `python-pptx` (más maduro para fidelidad de plantilla) recién en el Hito 7, con una prueba de concepto acotada antes de comprometerse. Fase: Hito 7.

## Validación

**G-13 — No hay validador de cumplimiento de marca ejecutable.**
Las 14 páginas de `guidelines/` son documentación visual, no un motor de reglas. El único artefacto machine-readable real (`x-omelette` en `_adherence.oxlintrc.json`) valida JSX en tiempo de autoría, no decks generados.
Impacto: bloquea la capacidad #4 del objetivo general ("revisar presentaciones existentes y detectar incumplimientos"). Prioridad: P0. Propuesta: validador independiente que consuma `core/brand/rules/*.json` + el Deck Spec (estructural) y opcionalmente el HTML renderizado (overlap de logo, contraste, overflow). Fase: Hito 6.

## Pruebas

**G-14 — No existe ninguna prueba automatizada hoy** (ni de esquema, ni de marca, ni visual, ni de instalación).
Impacto: cualquier cambio futuro no tiene red de seguridad. Prioridad: P1. Propuesta: ver `05-testing-strategy.md` completo. Fase: introducida progresivamente desde el Hito 1 (pruebas de esquema) hasta el Hito 6 (pruebas de marca).

## Seguridad

**G-15 — Ninguna plataforma (Claude Code, Codex) ofrece firma/checksum de plugins hoy** (verificado contra documentación oficial).
Impacto: riesgo de cadena de suministro si el marketplace se vuelve público sin control adicional. Prioridad: P1. Propuesta: mitigar con pinning por SHA de git, marketplace privado/interno durante las fases iniciales, y revisión manual de cambios antes de cada release. Fase: Hito 8 (antes de cualquier publicación externa). Detalle completo en `06-security-and-governance.md`.

**G-16 — Procedencia/licencia de activos no completamente verificada.**
`logo-horizontal-mono.svg` no tiene contraparte en `uploads/`; el PPTX maestro y el PDF de marca en `uploads/` no tienen licencia explícita documentada para redistribución fuera del entorno de autoría.
Impacto: riesgo legal/institucional si se publica un paquete que incluya o derive de material no autorizado para redistribución. Prioridad: P0 antes de cualquier publicación pública. Propuesta: preguntar al equipo de marca (ver `07-decisions-and-open-questions.md`) antes de decidir qué activos viajan dentro del plugin distribuible. Fase: Hito 0 (pregunta bloqueante para publicación, no para desarrollo interno).

## Documentación

**G-17 — No existe documentación separada para: usuarios finales, integradores de plataforma, y equipo de marca.**
Hoy todo está mezclado en `readme.md` + `CLAUDE.md` + `SKILL.md`, dirigido implícitamente a "el agente".
Impacto: fricción de adopción y gobernanza. Prioridad: P2. Propuesta: cada adaptador de plataforma y cada capa (`core/`, `skills/`, `validators/`) documenta su propio README; el README raíz del repo explica el mapa completo. Fase: transversal, reforzado en Hito 8 (marketplace).

## Versionado / CI/CD

**G-18 — No hay versionado semántico ni changelog para las reglas de marca ni para el Deck Spec.**
Impacto: actualizaciones de la marca (ej. nueva paleta de facultad, nuevo logo) no tienen forma de propagarse de manera controlada ni de saber qué versión de un plugin instalado usa qué versión de las reglas. Prioridad: P1. Propuesta: SemVer independiente para `core/brand` (marca) y para el esquema del Deck Spec, con changelog explícito; el `plugin.json`/`.codex-plugin/plugin.json` referencian ambas versiones. Fase: Hito 1 en adelante, formalizado en Hito 3.

**G-19 — No hay pipeline de CI/CD.**
Impacto: nada valida automáticamente que un cambio no rompa el Deck Spec, los tokens o el paquete instalable. Prioridad: P1. Propuesta: CI mínimo desde el Hito 1 (lint + validación de esquema); expandir a smoke test de instalación de plugin en Hito 3. Fase: incremental.

## Gobernanza

**G-20 — No hay proceso de aprobación institucional para cambios de marca.**
Hoy cualquier cambio a `readme.md` o a los tokens sería, de facto, un cambio de marca sin revisión formal.
Impacto: riesgo de que el sistema derive de la marca oficial sin que el equipo de comunicaciones/marca lo autorice. Prioridad: P1. Propuesta: `core/brand/` requiere aprobación de un "brand owner" designado antes de cada release (ver `06-security-and-governance.md`, roles). Fase: Hito 8 en adelante, recomendable antes si hay adopción real.

## Licenciamiento

**G-21 — No hay licencia declarada para el repositorio ni para los activos.**
Impacto: ambigüedad legal para terceros que quieran instalar o contribuir. Prioridad: P2 (bloqueante solo si se publica fuera de la universidad). Propuesta: definir licencia de código (ej. MIT/Apache-2.0 para `core/`, `skills/`, `renderers/`) separada de los términos de uso de los activos de marca (que NO deberían licenciarse como código abierto). Fase: Hito 8.

## Compatibilidad multiplataforma

**G-22 — El SKILL.md actual usa convenciones específicas de Claude ("Agent Skills compatible") sin verificar contra el spec abierto agentskills.io.**
Impacto: riesgo de que campos o supuestos no portables (p. ej. dependencia implícita del entorno de autoría de Claude Design) impidan reuso directo en Codex. Prioridad: P1. Propuesta: validar cada skill futura contra `skills-ref validate` del repo oficial `agentskills/agentskills` antes de considerarla portable. Fase: Hito 2.

---

## Matriz de trazabilidad (regla → archivo actual → forma futura → consumidores → validación)

| Regla institucional | Fuente actual | Forma futura | Consumidores | Validación |
|---|---|---|---|---|
| Paleta institucional + 13 paletas de facultad, nunca mezclar | `tokens/colors.css`, `readme.md` §Colour | `core/brand/tokens.json` + `core/brand/rules/palette.json` | skill create, skill review, renderer HTML, futuro renderer PPTX | Determinista |
| Área de protección y tamaño mínimo del logo (22px/8mm) | `readme.md` §LOGO GOVERNANCE (addendum) | `core/brand/rules/logo.json` (`officialClearSpaceRatio`, tamaños mínimos/recomendados/máximos) | skill create (posicionamiento), validator, renderer HTML | Determinista (bloquea export si falta metadata, tal como especifica el propio readme.md) |
| Whitelist de activos de logo aprobados, nunca redibujar | `readme.md` §OFFICIAL ASSET POLICY | `core/brand/rules/logo-assets.json` (whitelist de rutas) | skill create, validator | Determinista |
| Tipografía única (Libre Franklin), jerarquía por peso/tamaño/tracking | `tokens/typography.css`, `readme.md` §Typography | `core/brand/tokens.json` (sección type) | Todos | Determinista (font-family permitida) |
| Densidad y límites de contenido por slide (`maxPrimaryIdeas`, etc.) | `readme.md` §10 PRESENTATION DENSITY | `core/brand/rules/density.json` | skill create (auto-split), validator | Semi-determinista (conteo de bloques es determinista; "un mensaje principal" requiere juicio del agente) |
| Atribución IA obligatoria ("Diseñado con Claude Design") | `CLAUDE.md`, `readme.md` §PIE DE ATRIBUCIÓN | `core/brand/rules/ai-disclosure.json` (posición, tamaño, separación mínima del logo institucional) | skill create, validator, renderer | Determinista — **pero requiere decisión de producto**: ¿la atribución debe decir "Claude Design" también cuando el deck se genera con Codex? (ver 07, pregunta abierta) |
| Familias de slide aprobadas (cover, agenda, separador, contenido, cifras, cita, comparación, cierre, dashboard) | `readme.md` §9 REQUIRED SLIDE FAMILIES, `slides/*.html` como referencia visual | `core/schemas/deck-spec.schema.json` (enum de `slide.type`) + `renderers/html/layouts/*` | skill create, validator, renderer | Estructural (tipo válido) + visual (fidelidad de layout) |
| Nunca fabricar personas/campus sintéticos | `readme.md` §Imagery vibe, `assets/campus/README.md` | `core/brand/rules/imagery.json` (whitelist de rutas de imagen permitidas; prohibición explícita de generación) | skill create, validator | Solo parcialmente determinista — el validador puede exigir que toda imagen provenga de la whitelist, pero no puede "ver" si un agente generó una imagen fuera del sistema |
| Prop/enum válidos por componente (`Button.variant`, `Logo.variant`, `Tag.tone`) | `_adherence.oxlintrc.json` bloque `x-omelette` | `core/schemas/component-props.schema.json` | renderer HTML, validator | Determinista |

Esta matriz se amplía en fases posteriores conforme se detecten más reglas durante la extracción real (Hito 1).
