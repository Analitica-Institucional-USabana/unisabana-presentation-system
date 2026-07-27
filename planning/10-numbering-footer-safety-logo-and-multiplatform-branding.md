# 10 — Plan de corrección: numeración, integridad del pie de página, logo consistente, jerarquía de propiedad y atribución multiplataforma

> Para una sesión de Claude Code nueva, sin memoria de la conversación donde se construyó esto. Contexto necesario: los Hitos 0–7 de `03-migration-roadmap.md` están completos, y los backlogs de `08-visual-quality-and-layout-fixes.md` y `09-visual-richness-and-content-density.md` **ya fueron aplicados** — no repitas ese trabajo. Este documento es la siguiente capa: 7 pedidos concretos del usuario tras usar el sistema en un caso real (`error1.png`, deck con tarjetas "Facultad de Ingeniería" / "Facultad de Medicina"), más un pedido de fondo (que las diapositivas dejen de sentirse planas) que resulta ser el mismo problema ya diagnosticado (y nunca ejecutado) en `09` punto 6.

## Resumen de los 7 pedidos

| # | Pedido del usuario | Sección |
|---|---|---|
| 1 | Numerar cada slide (1..n) y mostrarlo en algún lado | [§1](#1-numeración-de-slides-1n) |
| 2 | El pie de página nunca debe quedar sobrepuesto al contenido | [§2](#2-el-pie-de-página-nunca-se-sobrepone-al-contenido) |
| 3 | El texto dentro de los badges/pills redondeados queda apretado | [§3](#3-padding-de-los-badgespills-tipo-botón) |
| 4 | El logo institucional debe verse igual de grande en todas las slides, no solo portada/cierre | [§4](#4-tamaño-de-logo-consistente-en-todas-las-slides) |
| 5 | La portada debe indicar jerárquicamente a qué dependencia pertenece el deck | [§5](#5-jerarquía-de-propiedad-en-la-portada) |
| 6 | Todo esto debe aplicar igual en el plugin de Claude Code y en el de Codex | [§6](#6-multiplataforma-claude-code-y-codex) |
| 7 | El pie de atribución de Codex dice "Claude Design" — debe decir "Codex" + logo de OpenAI | [§7](#7-atribución-diseñado-con-claude-design-incorrecta-en-codex) |
| — | (pedido de fondo) evitar diapositivas que se vean "como solo números" | [§8](#8-se-ven-como-solo-números--enriquecer-contenido-plano) |

Evidencia visual: `error1.png` (adjuntado por el usuario) — tarjetas de `comparison`/`statusCard` con badge de esquina ("Líder en crecimiento", "Publicaciones bajo la meta") envolviendo a 2 líneas dentro de una píldora visiblemente estrecha (marcado en rojo por el usuario). Esa captura ilustra directamente el pedido 3; los pedidos 1, 2, 4, 5 y 7 no están en la captura pero se verificaron contra el código fuente (ver cada sección).

---

## 1. Numeración de slides (1..n)

**Estado actual:** no existe en absoluto. `core/schemas/deck-spec.schema.json` no tiene ningún campo de número de página, y ningún `renderers/*/layouts/*.mjs` ni `renderers/*/document.mjs` dibuja un índice de slide.

**Dónde encaja sin chocar con nada:** las 4 esquinas del canvas (1280×720) ya tienen dueño parcial —
- superior-izquierda: logo institucional (`LOGO_POSITION = {x:72, y:56}`, `renderers/html/constants.mjs:67`)
- inferior-derecha: atribución IA (`AI_DISCLOSURE = {right:32, bottom:24}`, `renderers/html/constants.mjs:71-76`)

Las esquinas superior-derecha e inferior-izquierda están libres. Inferior-izquierda es la elección natural: cae dentro de la misma franja horizontal que ya reserva `FOOTER_ZONE_HEIGHT` (`constants.mjs:11`, usada en `contentBand()` líneas 88-93), así que "N / total" queda visualmente emparejado con la atribución IA sin definir una nueva banda protegida.

**Propuesta:**
- Nuevo módulo `renderers/html/page-number.mjs` (mismo patrón que `logo.mjs`/`ai-disclosure.mjs`): recibe `(index, total, backgroundTone)`, devuelve un `box()` tipo `"3 / 12"`, color tone-aware igual que `aiDisclosureBox` (`var(--sabana-blue-300)` en fondo oscuro, `var(--ink-500)` en claro).
- Equivalente en `renderers/pptx/page-number.mjs` con `pptxSlide.addText`.
- `document.mjs` de cada renderer ya itera `deck.slides` para llamar a cada layout — pasar `index`/`slide.length` ahí mismo, sin tocar el schema (el número se deriva de la posición en el arreglo, no es un dato de contenido).
- No requiere cambio de schema ni de `unisabana-create` — es puramente de renderizado.

**Decisión abierta (usuario/marca):** ¿la portada y el cierre cuentan en la numeración 1..n, o solo las slides de contenido (convención común en decks ejecutivos)? El pedido literal del usuario ("cada slide se enumere de 1 a n") sugiere contar todo; se implementa así por defecto y se deja como parámetro trivial de cambiar si la respuesta es otra.

**Talla:** S.

---

## 2. El pie de página nunca se sobrepone al contenido

**Causa raíz encontrada (no es la misma de `08`, aunque es el mismo patrón sistémico):** `contentBand()` (`renderers/html/constants.mjs:88-93`) reserva una banda vertical entre el logo y el pie, y `centeredContentY()` (líneas 95-101) centra el bloque de contenido ahí — pero el propio comentario del código lo dice explícitamente: *"si el contenido es más alto que la banda, se ancla arriba (mismo comportamiento que 'llenar y desbordar hacia abajo')"*. Es decir: **el sistema no tiene ningún mecanismo que impida el desborde hacia el pie de página cuando el contenido real es más alto que lo estimado — solo evita valores negativos.**

Y la estimación de altura sí puede quedarse corta. Ejemplo concreto en `renderers/html/layouts/data.mjs:18`:
```js
const statCardHeight = valueSizePx + 120;
```
Esto es un número fijo que **no mide** el texto real de `label`, `caption`, `delta` ni `badge` de cada stat (a diferencia de los títulos, que sí usan `text-measure.mjs` desde el fix de `08`). Si un `caption` o un `badge` es largo y envuelve a 2-3 líneas, la tarjeta real mide más que `statCardHeight` y el contenido siguiente (la línea `Fuente: ...` en `data.mjs:45-53`, posicionada deliberadamente en la banda de pie) puede quedar tapado o el `statBlock` puede invadir la zona de atribución IA. El mismo patrón de altura-fija-sin-medir hay que auditarlo en `statusCard`/`comparison.mjs`, `process.mjs` (línea de tiempo), `table.mjs` (filas) y `agenda.mjs` (grid) — en ambos renderers.

**Propuesta (dos capas, no una sola):**
1. **Medir mejor lo que se pueda medir barato:** extender el uso de `estimateBlockHeightPx` (`text-measure.mjs`) a `caption`/`label`/`badge`/listas de `points` dentro de `statBlock`/`statusCard`, igual que ya se hace para títulos — mismo enfoque que la Opción A de `08`.
2. **Red de seguridad dura para lo que no se puede medir barato (ej. número variable de filas de tabla, pasos de proceso):** si la altura de contenido calculada excede `contentBand(family).bottom`, no dejar que se desborde en silencio — reducir tamaños secundarios (igual que `fitTitleSizePx` ya hace con títulos) o, como mínimo, que `scripts/validate-brand.mjs` (o una regla nueva en `validators/rules/`) detecte el caso y falle la validación de marca en vez de dejar pasar un deck que técnicamente es válido mas visualmente roto — el mismo tipo de chequeo determinista que ya hace `validators/rules/ai-disclosure.mjs`.

**Talla:** M (toca varios `layouts/*.mjs` en ambos renderers, más posible regla nueva de validación).

---

## 3. Padding de los badges/pills tipo botón

Es el problema visible en `error1.png`. Hay dos implementaciones independientes y **ambas son sospechosas por razones distintas**:

- **HTML** — `tag()` (`renderers/html/elements.mjs:91-100`): `padding:4px 12px`, `display:inline-flex`. El padding en sí no es el problema — el badge vive dentro de una fila flex `justify-content:space-between` junto al heading (`statusCard`, `elements.mjs` ~144-148) sin `flex-shrink:0` ni `white-space:nowrap`, así que si el heading es largo, el badge se comprime y el texto envuelve.
- **PPTX** — `addBadge()` (`renderers/pptx/elements.mjs:37-42`): ancho **fijo** (`w: Math.min(w, 1.6)` en `statBlock`, `w: 1.4` en `statusCard`, línea 100), `fontSize:9`, `h:0.26` pulgadas (~19px). pptxgenjs no autoajusta el ancho de una forma al texto — con textos como "Líder en crecimiento" o "Publicaciones bajo la meta" a 9pt dentro de 1.4-1.6in, el envoltorio a 2 líneas dentro de una caja de 19px de alto es prácticamente garantizado. Esto coincide exactamente con lo que muestra `error1.png`.

**Propuesta:**
- HTML: agregar `white-space:nowrap;flex-shrink:0;` al badge dentro de `tag()` o en su punto de uso en `statusCard`/`statBlock`, y subir el padding un poco (`6px 14px`) para que "respire" como pide el usuario.
- PPTX: calcular el ancho del badge a partir del largo real del texto (aproximación de ancho de carácter, mismo tipo de heurística que la Opción A de `08` para títulos) en vez de un ancho fijo, y subir `h` a ~0.3in con más padding interno.

**Talla:** S.

---

## 4. Tamaño de logo consistente en todas las slides

**Causa raíz:** es intencional, no un bug — y ya estaba señalado como decisión pendiente sin resolver en `08` punto 2. `LOGO_HEIGHT_PX` (`renderers/html/constants.mjs:53-58`):
```js
cover: 72–118px   separator: 54–84px   content: 32–48px   closing: 64–104px
```
`content` (que cubre `agenda, message, data, comparison, process, table, quote` — ver `slideFamilyFor`, línea 78-81) es deliberadamente el más chico, siguiendo literalmente `claude-design-system/readme.md` ("never enlarge the logo merely to fill empty space", "use the smallest presentation-recommended size"). `08` dejó esto pendiente de una decisión del "dueño de marca" (`06-security-and-governance.md`). **El usuario, en este pedido, está actuando como ese dueño de marca y da la instrucción explícita de anular esa regla del readme**: quiere el logo igual de grande en todas las slides que en portada/cierre.

**Propuesta:**
- Unificar `LOGO_HEIGHT_PX.content` (y evaluar `separator`) al mismo rango que `cover`/`closing`, o a un valor único consistente — a decidir el número exacto durante implementación (ver "decisión abierta" abajo).
- `contentBand()` (líneas 88-93) ya deriva el techo del bloque de contenido a partir de `LOGO_HEIGHT_PX[family]`, así que el resto de cada layout se reacomoda automáticamente al agrandar el logo — no hay que tocar los layouts individualmente para esto.
- **Mantener sincronizado `core/brand/rules/logo.json`** con el nuevo valor — `08` punto 7 ya advierte explícitamente sobre la brecha G-04 (dos fuentes de verdad de logo desalineándose entre validador y renderer).
- Repetir en `renderers/pptx/constants.mjs` (mismo `LOGO_HEIGHT_PX` importado en `logo.mjs`/`ai-disclosure.mjs` de PPTX).

**Decisión abierta:** ¿logo de contenido = mismo tamaño exacto que portada (72-118px), o un valor intermedio consistente para las 4 familias? El pedido dice "que queden grandes como en las de inicio y fin" — se puede implementar como un solo tamaño para las 4 familias, simplificando además `LOGO_HEIGHT_PX` a un valor único.

**Talla:** S-M.

---

## 5. Jerarquía de propiedad en la portada

**Estado actual:** `slideCover` (`core/schemas/deck-spec.schema.json:133-159`) tiene `title`, `subtitle`, `eyebrow`, `background`, `photo`, `presenter`, `date`, `event` — ningún campo de dependencia/unidad responsable. `renderers/html/layouts/cover.mjs:63-69` ya arma una línea de metadatos (`presenter · date · event`) — es el patrón a reutilizar, no inventar uno nuevo.

**Propuesta:**
- Nuevo campo opcional `presentation.owner` (string) en `core/schemas/deck-spec.schema.json` — vive en `presentation`, no en `slideCover`, porque la dependencia dueña es del deck completo, no solo de la portada (bump MINOR del schema, aditivo, según su propia política de SemVer en el `$comment` del archivo).
- `cover.mjs` (HTML y PPTX) renderiza `presentation.owner` como una línea jerárquica (ej. sobre el `eyebrow`, en mayúsculas pequeñas, tono institucional) — igual patrón visual que ya usa `eyebrow()`.
- **Cambio de comportamiento en la skill**, no solo de renderer: `skills/unisabana-create/SKILL.md` (+ referencias) debe preguntar explícitamente al usuario la dependencia/unidad dueña del deck antes de generar la portada si no vino en la solicitud original — nunca asumirla. Si el usuario no la da ni al preguntársela, usar el placeholder literal que el propio usuario pidió: **"Dependencia responsable: pendiente de definir"**, de forma que quede visible como pendiente y no desaparezca en silencio.
- Como `skills/` está en `RUNTIME_ITEMS` de `scripts/build-adapters.mjs:25`, este cambio de comportamiento aplica igual a Claude Code y a Codex sin trabajo adicional (ver §6).

**Talla:** S.

---

## 6. Multiplataforma (Claude Code y Codex)

Ya es cierto por construcción para los pedidos 1 a 5: `scripts/build-adapters.mjs` copia `core/, skills/, scripts/, renderers/, validators/` (lista `RUNTIME_ITEMS`, línea 25) **idénticos, byte a byte**, a `adapters/claude-plugin/` y `adapters/codex-plugin/` — es la razón de ser de la decisión D-13. Cualquier fix de renderer/schema/skill de este documento se propaga solo con `npm run build:adapters`, no hay que tocar nada dos veces.

La **única** excepción real es el pedido 7 — porque ahí lo que hay que cambiar es precisamente algo que hoy es *idéntico* entre plataformas y necesita dejar de serlo.

---

## 7. Atribución "Diseñado con Claude Design" incorrecta en Codex

**Causa raíz:** `renderers/html/ai-disclosure.mjs:23` y `renderers/pptx/ai-disclosure.mjs:17` tienen el texto `"Diseñado con Claude Design"` y el asset `assets/claude-logo.svg` (línea 14 / línea 11) escritos literalmente en el código — y ese código, como todo lo demás, se copia idéntico a ambos adaptadores. **No existe hoy ninguna señal en el sistema que distinga "esto lo está generando Claude Code" de "esto lo está generando Codex"** — por eso Codex también dice "Claude Design": es literalmente el mismo archivo.

Esto no es un descubrimiento nuevo: `core/brand/rules/ai-disclosure.json:4` ya lo documenta como **D-Q5** en `planning/07-decisions-and-open-questions.md` — *"el sistema objetivo puede generarse también desde Codex u otros agentes... la decisión de generalizar el texto o parametrizarlo por plataforma generadora queda pendiente de validación institucional"*. El pedido de hoy **resuelve D-Q5**: el usuario, como dueño del sistema, pide explícitamente parametrizar por plataforma.

**Mecanismo propuesto (reutiliza un patrón que el repo ya tiene, no inventa uno nuevo):** `adapters/claude-plugin/plugin.json` y su equivalente en `codex-plugin` ya son archivos **específicos de cada adaptador, escritos a mano, y deliberadamente fuera de `RUNTIME_ITEMS`** (por eso `build-adapters.mjs` nunca los toca). Seguir el mismo patrón:
- Crear `adapters/claude-plugin/platform.json` y `adapters/codex-plugin/platform.json`, cada uno con algo como:
  ```json
  { "name": "codex", "attributionText": "Elaborado con Codex", "logoAsset": "assets/openai-logo.svg" }
  ```
- `renderers/*/ai-disclosure.mjs` ya reciben `repoRoot` como parámetro — y `repoRoot`, una vez instalado el plugin, apunta a la raíz del propio adaptador (es la premisa completa de D-13: todo viaja dentro del árbol del adaptador). Leer `platform.json` desde `repoRoot` con `try/catch` y hacer fallback a los valores actuales de Claude si el archivo no existe (cubre correr desde la raíz del repo en desarrollo, que no tiene identidad de adaptador).
- **Actualizar `validators/rules/ai-disclosure.mjs:8,15`**, que hoy también tiene el string y el logo de Claude hardcodeados — si no se actualiza, un deck generado por Codex con el texto correcto empezaría a *fallar* la validación de marca en vez de pasarla.

**Pendiente, no resuelto por este documento (requiere al usuario):**
- **Asset del logo de OpenAI**: no existe hoy en `core/brand/assets/`. Vendorizarlo offline (mismo criterio D-20 que ya se aplicó a `claude-logo.svg` y a los íconos Lucide de `09`) requiere que el usuario provea el archivo o autorice explícitamente su descarga/uso — es una cuestión de procedencia/marca registrada, no solo técnica (mismo tipo de precaución que `core/brand/rules/icons.json#/_provenance` ya documenta para Lucide, ver `06-security-and-governance.md`). No usar un logo de OpenAI "aproximado" o generado — o es el asset oficial, o se deja el texto solo hasta tenerlo.
- Confirmar el texto exacto: el usuario ya propuso **"Elaborado con Codex"** — usarlo tal cual salvo objeción.

**Talla:** M (dos renderers + validador + 2 archivos nuevos de adaptador + asset pendiente de conseguir).

---

## 8. "Se ven como solo números" — enriquecer contenido plano

Este pedido de fondo **ya está diagnosticado y sin ejecutar** en `09-visual-richness-and-content-density.md`. Cita textual del punto 6 de su plan de trabajo priorizado (línea 77):

> "Actualizar `skills/unisabana-create/references/slide-families.md` y `content-voice.md` para que la skill sepa cuándo usar cada primitiva nueva ... sin esto, las primitivas existen en el renderer pero la skill nunca las produce."

Es decir: las 8 primitivas ricas (banner, tarjeta con estado/badge, grid de agenda, timeline Gantt, proceso alternado con íconos, fondo tintado, `ProgressBar`, íconos) **ya están implementadas en ambos renderers** (`09`, sección "Estado", línea 62-64) — el problema no es capacidad del renderer, es que `unisabana-create` no siempre elige usarlas al redactar el Deck Spec, y por defecto puede producir un `data` con `stats` simples sin `banner`/`badge`/`progress`, que es exactamente el efecto "solo números" que describe el usuario.

**Propuesta:**
- Reforzar `skills/unisabana-create/references/slide-families.md` / `content-voice.md`: convertir el uso de al menos un elemento no textual (banner, badge, ícono, progress, tinte) en la norma para slides de tipo `data`/`message`/`table`/`process`, y la ausencia total en la excepción justificada (contenido genuinamente mínimo).
- Opcional (S/XS, evaluar si vale la pena): una regla suave en `validators/` que `unisabana-review` pueda señalar — "slide de contenido sin ningún elemento visual no textual" — como sugerencia, no como fallo bloqueante (para no chocar con `density.json#/visualLanguageLimits`, que limita el exceso en la otra dirección).

**Talla:** S (docs de skill) + XS opcional (validator no bloqueante).

---

## Plan de trabajo priorizado

1. **[S, sin dependencias] Numeración de slides** — nuevo `page-number.mjs` en ambos renderers.
2. **[S] Padding de badges/pills** — arreglo puntual en `elements.mjs` (HTML) y `addBadge` (PPTX). Hacerlo antes del punto 3 porque comparten componente (`statusCard`/`statBlock`).
3. **[M] Auditoría y fix de desborde hacia el pie de página** — extender medición de texto a captions/badges/bullets + red de seguridad dura, en los 10 `layouts/*.mjs` de ambos renderers.
4. **[S-M, requiere decisión de tamaño] Logo consistente** — unificar `LOGO_HEIGHT_PX`, sincronizar `core/brand/rules/logo.json`.
5. **[S] Jerarquía de propiedad en portada** — campo `presentation.owner` en el schema, render en `cover.mjs` (ambos), instrucción nueva en `unisabana-create` para preguntar/usar placeholder.
6. **[S] Guía de enriquecimiento** — actualizar `slide-families.md`/`content-voice.md` para que las primitivas de `09` se usen por defecto.
7. **[M, bloqueado en parte por el usuario] Atribución multiplataforma** — `platform.json` por adaptador, actualizar ambos `ai-disclosure.mjs` y `validators/rules/ai-disclosure.mjs`; **pendiente conseguir el asset oficial del logo de OpenAI antes de poder cerrar este punto**.
8. **Regenerar `tests/schema/example-deck.yaml`** (o extenderlo) ejercitando `presentation.owner`, numeración, y al menos un caso de contenido "denso" a propósito para verificar que ya no se desborda hacia el pie.
9. **`npm run build:adapters`** y confirmar que `adapters/codex-plugin` produce "Elaborado con Codex" + logo OpenAI y `adapters/claude-plugin` sigue produciendo "Diseñado con Claude Design" sin cambios.
10. **Correr `validate-deck-spec.mjs` y `validate-brand.mjs`** (con el `.html` generado, para activar los checks de logo/atribución) sobre ambos renders, en ambos adaptadores.

## Cómo verificar cuando esté resuelto

- Renderizar `tests/schema/example-deck.yaml` (HTML y PPTX) y confirmar visualmente: numeración visible y correcta en las 13 slides, ningún elemento invade la banda del pie de página incluso en las slides más densas (`table{density:"high"}`, `data` con `banner`+`progress` simultáneos), badges de una sola línea sin envolver, logo del mismo tamaño perceptible en las 10 familias, línea de dependencia visible en portada (o el placeholder si no se proveyó).
- Generar el mismo deck desde ambos adaptadores instalados y comparar el pie de atribución lado a lado.
- Enviar ambos renders al usuario para revisión visual directa — igual que en `08` y `09`, ninguna validación automática reemplaza que el usuario lo vea.
- `validate-brand.mjs` en verde en ambos adaptadores, sin que el cambio de texto de Codex rompa su propio chequeo.

## Decisiones abiertas para el usuario / dueño de marca

- ¿Portada y cierre cuentan en la numeración 1..n, o solo las slides de contenido?
- Tamaño final único (o rango) para el logo en las 4 familias — hoy `content`=32-48px vs `cover`=72-118px; ¿se igualan del todo o se deja un valor intermedio consistente?
- Asset oficial del logo de OpenAI para el pie de atribución de Codex — **falta que el usuario lo provea o autorice su vendorización**; sin esto el punto 7 no se puede cerrar por completo (se puede avanzar el texto "Elaborado con Codex" sin el logo como paso intermedio, si se prefiere no bloquear todo el punto).
- Confirmar el texto exacto de atribución de Codex ("Elaborado con Codex" ya propuesto por el usuario).
