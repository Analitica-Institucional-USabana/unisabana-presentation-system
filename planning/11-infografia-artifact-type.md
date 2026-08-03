# 11 — Nuevo artefacto: Infografía

**Estado:** Aplicado. Origen: el equipo de diseño institucional agregó `claude-design-system/guidelines/infografias.md` — una norma operativa completa para generar infografías ejecutivas (checklist de 8 puntos, detección de multi-marca, estructura obligatoria con KPIs, catálogo de ~10 familias de visualización, reglas editoriales/tipográficas/de accesibilidad). El usuario pidió extender este pipeline para producir también infografías, exportando a PDF en vez de PPTX.

## Por qué es un artefacto hermano, no una extensión del Deck Spec

`core/schemas/deck-spec.schema.json` es intrínsecamente un deck: raíz `{presentation, slides[]}`, una sola paleta institucional/facultad para todo el documento, canvas fijo 1280×720. Una infografía es conceptualmente distinta en tres ejes:

1. **Canvas único vs. secuencia de slides.** Una infografía no tiene "slides" — es una sola pieza cuya altura depende del contenido (vertical u horizontal, no 16:9 fijo).
2. **Multi-marca.** `core/brand/rules/palette.json#/rules/no-mixing` prohíbe mezclar paletas — regla que sigue vigente para infografías — pero `guidelines/infografias.md` §2 exige un protocolo de detección/preguntas cuando aparece una segunda institución, algo sin precedente en el Deck Spec.
3. **Exportación.** PDF (vía navegador headless), no PPTX.

Por eso: `core/schemas/infografia-spec.schema.json` es un archivo nuevo con su propio `$id`/`schemaVersion`, no una rama condicional dentro del schema del deck — mantiene la misma disciplina de SemVer independiente (PATCH/MINOR/MAJOR) que ya usa el Deck Spec, documentada en su propio `$comment`.

## Estructura del schema

Raíz `{schemaVersion, infografia, modules[]}`. La estructura obligatoria de `guidelines/infografias.md` §3 (logo → título/subtítulo → **keyNumbers** → desarrollo → conclusiones opcionales → **fuentes**) se modela así:

- `infografia.title`, `.keyNumbers` (1-6 tarjetas KPI) y `.sources` son campos **requeridos** directamente en el schema — igual que `slideData.source`/`.period` ya son requeridos en el Deck Spec en vez de dejarse a la disciplina del agente. Esto garantiza que nunca falte el encabezado de KPIs ni el pie de fuentes, sin necesidad de una regla de "orden" imposible de expresar limpiamente en JSON Schema.
- `infografia.conclusions` es opcional — la skill debe preguntar explícitamente antes de incluirlo (nunca asumir que se requieren).
- `modules[]` (el "desarrollo") es una unión discriminada por `type` con **granularidad de familia** (10 tipos: `indicators, comparison, trend, distribution, composition, relationship, process, hierarchy, geography, strategy`) y un campo `variant` interno que cubre las ~50 variantes específicas del catálogo — evita una unión con 50 ramas manteniendo cobertura completa.

## Modelo de co-marca (multi-marca acotada)

Decisión explícita del usuario: la skill sigue el protocolo de detección/preguntas de `guidelines/infografias.md` §2 tal cual, pero el **renderizado** solo soporta una "co-marca" acotada (`infografia.coBrand`: logo secundario + un color de acento, siempre subordinados) — nunca dos paletas institucionales completas en pie de igualdad. `core/brand/rules/cobrand.json` fija los límites (tamaño del logo secundario ≤60% del institucional, un solo color de acento, prohibición explícita de una segunda paleta completa); `validators/rules/cobrand-constraints.mjs` verifica que el color de acento de la co-marca no coincida por accidente con el acento institucional activo. Si el usuario necesita más que esto (dos marcas en pie de igualdad real), la skill debe explicar la limitación en vez de forzarlo dentro del esquema.

## Motor de gráficas (catálogo completo, no un MVP recortado)

Decisión explícita del usuario: implementar las 10 familias completas del catálogo desde el inicio, no un subconjunto. `renderers/html/charts/{indicators,comparison,trends,distribution,composition,relationships,processes,hierarchies,geography,strategy}.mjs` generan SVG inline (nunca una librería externa — offline, D-20), reutilizando `chart-kit.mjs` (escalas, paleta de acento de 5 tonos, primitivas de texto/línea/rect) y los primitivos ya existentes (`elements.mjs`, `text-measure.mjs`, `embed.mjs`, `icons.mjs`).

**Simplificación deliberada y documentada — familia `geography`:** no se dibuja un contorno cartográfico real (Colombia/mundo). Un basemap SVG geográficamente preciso requiere un asset vendorizado y verificado por una fuente confiable — generarlo de memoria arriesga errores de forma/adyacencia que desinformarían en una pieza institucional (mismo espíritu que `core/brand/rules/imagery.json`: "nunca fabricar/simular"). Hoy `geography` se representa como lista/intensidad por región (honesto, funcional, no espacial) — ver el comentario en `renderers/html/charts/geography.mjs`. Vendorizar un basemap real es trabajo futuro, no bloqueante para el resto del catálogo.

**Otras simplificaciones documentadas en código** (no fabricación de datos, solo de forma visual): `violin` en `distribution.mjs` usa una silueta romboidal entre cuartiles en vez de una estimación de densidad (KDE) real, ya que no se calcula una densidad — se documenta explícitamente en el código en vez de aparentar precisión que no existe. `sunburst`/`mosaic` en `composition.mjs` degeneran a un anillo simple / una sola fila respectivamente porque `module.items` es una lista plana, no jerárquica (una jerarquía real vive en la familia `hierarchy`).

## Renderizado: flujo de documento, no canvas fijo

A diferencia del deck (`renderers/html/document.mjs`, posicionamiento absoluto sobre 1280×720 con medición de texto vía `text-measure.mjs` para no desbordar), la infografía (`renderers/html/infografia/document.mjs`) usa **flujo normal de documento** (bloques apilados). Como la altura no es fija, no hay riesgo de overflow que medir de antemano — la maquinaria de `estimateBlockHeightPx`/`contentBand` existe específicamente para un canvas fijo y no aplica aquí. Esto simplifica el renderer de infografía frente al de deck, no es una omisión.

`core/brand/rules/infografia-canvas.json` (nuevo, análogo a `density.json` pero para un canvas único) define los perfiles `vertical`/`horizontal` y `minBodyPxByMedium` (guidelines/infografias.md §10: mínimo 20px en piezas de proyección).

## Export a PDF: adopción de Playwright (cierra D-18)

`planning/07-decisions-and-open-questions.md` D-18 ("¿navegador headless como dependencia?") estaba pendiente desde el análisis inicial, con una pregunta abierta a los usuarios finales ("¿aceptable introducir Playwright/Puppeteer dado su tamaño?") ya respondida afirmativamente. Este hito la resuelve en la práctica: `renderers/pdf/render.mjs` usa Playwright (`chromium.launch()` headless) para convertir el HTML autocontenido de la infografía en PDF, con el alto de página igual al alto real del contenido (`document.scrollHeight`) — una infografía es un lienzo único, no páginas A4 múltiples.

**Punto técnico documentado, no trivial:** Playwright instala el binario de Chromium en un caché externo a `node_modules` por defecto (`%USERPROFILE%\AppData\Local\ms-playwright` en Windows) — la copia ciega de `node_modules` en `scripts/build-adapters.mjs` no lo capturaría. Se instaló con `PLAYWRIGHT_BROWSERS_PATH=0` (`npx playwright install chromium`), que fuerza el binario dentro de `node_modules/playwright-core/.local-browsers/`, y `renderers/pdf/render.mjs` fija la misma variable de entorno en tiempo de ejecución (antes de un `import()` dinámico de `playwright`, ya que un `import` estático se resolvería antes de que la asignación corra) para que la resolución de rutas de Playwright busque ahí en vez del caché global. Esto mantiene el requisito offline (D-20): el binario nunca se descarga en tiempo de ejecución, viaja empaquetado con el adaptador igual que `ajv`/`js-yaml`/`pptxgenjs`.

## Skills

`skills/unisabana-infografia/SKILL.md` (nueva) sigue el mismo patrón que `unisabana-create`: rol puramente creativo, único output es el YAML validado, nunca HTML/PDF escrito a mano. `skills/unisabana-review/SKILL.md` se extiende (no se duplica) para auditar ambos artefactos — `scripts/validate-brand.mjs` detecta automáticamente el tipo de spec por la clave raíz del YAML (`presentation` → deck, `infografia` → infografía) y despacha a las reglas correspondientes, así que el comando de auditoría sigue siendo uno solo.

Esto no contradice D-03 ("dos skills, no una por tipo de slide"): esa decisión habla de no fragmentar *dentro* de un tipo de artefacto (por familia de slide); una infografía es un artefacto genuinamente distinto (canvas único vs. deck, selección de visualización vs. selección de familia de slide), así que amerita su propia skill de creación — ver la nota actualizada en `CLAUDE.md`.

## Validadores nuevos

`validators/rules/{module-density,icon-style-consistency,accessibility-min-body,sources-required,cobrand-constraints}.mjs`, orquestados por `validateInfografiaSpecRules`/`validateRenderedInfografiaHtmlRules` en `validators/index.mjs` (mismo patrón de dos capas — Spec antes de renderizar, HTML después — que ya usa el deck). Notas honestas sobre alcance real:

- `icon-style-consistency.mjs`: hoy el set vendorizado de iconos (`core/brand/rules/icons.json`) es 100% *outline* (Lucide) — no existe ningún ícono *solid* que mezclar, así que la regla "nunca mezclar outline/solid" (guidelines §6) queda estructuralmente lista pero no puede activarse de verdad hasta que se vendorice un segundo estilo. Es la misma dependencia ya conocida D-Q6 (icono institucional oficial sin confirmar).
- `sources-required.mjs`: el schema ya exige `infografia.sources.developedBy` como campo requerido, así que esta regla no puede fallar en la práctica sobre un spec válido — su valor real es la advertencia (no error) quando faltan `dataSource`/`period` en piezas con módulos de cifras.

## Pendiente / fuera de alcance de este hito

- Vendorizar un basemap SVG real (Colombia + mundo) para la familia `geography` — requiere una fuente confiable, no generación de memoria.
- Ampliar `core/brand/rules/icons.json` más allá de los 13 iconos actuales para cubrir mejor los KPIs de infografía — bloqueado por la misma D-Q6 que ya bloquea decks.
- Snapshot testing visual (D-17) reutilizando el mismo Playwright ya adoptado aquí — posible ahora que la dependencia existe, no implementado.
