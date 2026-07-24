# 09 — Plan de enriquecimiento visual: componentes ricos y densidad de contenido

> Para una sesión de Claude Code nueva, sin memoria de la conversación donde se construyó esto. Contexto necesario: los Hitos 0–7 de `03-migration-roadmap.md` están completos, y el backlog de `08-visual-quality-and-layout-fixes.md` (bug de superposición de títulos, centrado vertical, motivo de marca `brand-wave.svg`, gradientes navy) **ya fue aplicado** — no repitas ese trabajo, este documento es la siguiente capa. El ciclo crear→validar→renderizar→revisar funciona de punta a punta y el resultado ya no se superpone ni queda apelotonado arriba. El problema que este documento ataca es distinto: el usuario comparó una presentación real generada por este sistema contra una presentación de referencia hecha con el mismo `claude-design-system/` original (Claude Design, sin pasar por nuestro pipeline de Deck Spec) y encontró que la nuestra se ve **pobre/plana en comparación**: "más estilos gráficos, más rellenitas, el logo más grande, las presentaciones más llenitas (de contenido, no de texto), efectos visuales, diagramas, líneas de tiempo".

## Evidencia

Referencia: `ejemplo-presentacion.pdf` (12 páginas, en la raíz del repo — pídele al usuario que lo suba de nuevo si ya no está ahí, es un adjunto de conversación, no está commiteado). Es un deck real hecho por otra persona directamente en Claude Design con `claude-design-system/`, **no generado por `unisabana-create`** — por eso no está limitado por lo que nuestro Deck Spec sabe expresar hoy. Úsalo como la barra visual objetivo, no como algo a copiar literalmente (contenido y marca son de un caso de uso distinto).

Patrones que aparecen ahí y que **nuestro renderer no sabe producir hoy** (referencia de página del PDF entre paréntesis):

1. **Chips/pills de audiencia en la portada** (p.1): fila de badges tipo píldora bajo el título (uno relleno = activo, el resto solo contorno) listando destinatarios/stakeholders.
2. **Banner/callout de ancho completo** (p.4, p.5, p.9, p.7, p.8): una franja de color sólido o tintado que atraviesa el slide con una cifra o frase destacada — aparece en varias formas: banner navy con texto en blanco ("−17,0% ... explica la mayor parte de la caída"), banner ámbar/crema de advertencia con ícono de alerta y label "NOTA", banner navy de apertura tipo "PUNTO DE PARTIDA". Es el mismo patrón de fondo (una "franja de énfasis"), no tres cosas distintas.
3. **Tarjetas de comparación con estado/alerta** (p.5): dos tarjetas lado a lado, borde de acento a la izquierda (azul = normal, rojo = alerta), badge en la esquina superior derecha ("30% del ranking" / "Alerta principal · 15%"), dos cifras grandes dentro de cada tarjeta, línea divisoria, texto secundario debajo. Reutiliza el rojo de `fac-juridicas` (`#CE2929`/`#A30C0C`), ya aprobado en la paleta — no inventa un color nuevo.
4. **Grid 2×2 (o N×M) de tarjetas numeradas** (p.9): igual que nuestra `agenda`, pero en cuadrícula en vez de lista vertical de una columna, con el número en azul claro grande como marca de agua tipográfica.
5. **Timeline tipo Gantt** (p.6): carriles horizontales con barras de distintas tonalidades sobre un eje con marcas de fecha, leyenda de color arriba, marcador "estamos acá" (pin + línea punteada + burbuja), y una segunda fila de hitos puntuales (dots + fecha) bajo el eje. No existe absolutamente nada parecido en `renderers/*/layouts/process.mjs` (que solo hace círculos numerados conectados por una línea).
6. **Proceso con tarjetas alternadas + iconos** (p.7): variante más rica del `process` actual — cada paso tiene una tarjeta (arriba o abajo, alternando en zigzag) con un ícono en una insignia cuadrada redondeada de color, eyebrow "HITO N", título y descripción; incluye el mismo marcador "estamos acá".
7. **Comparación de dos columnas con mini-listas numeradas + tags de rol** (p.8): variante de `comparison` con pasos numerados dentro de cada columna (no bullets) y una etiqueta secundaria en mayúsculas al final de cada línea (ej. "DDE").
8. **Fondos tintados de página completa** (p.9): body del slide con un tinte lavanda/azul muy claro en vez de blanco puro — no es `light`/`navy`/`photo`, es un cuarto tono "tintado" para dar variedad sin salir de la paleta institucional.
9. **Íconos en general** (p.7, p.11, p.12): insignias cuadradas redondeadas con un ícono lineal monocromo dentro (acento institucional o `--ink-500`), usados como viñeta de cada bloque. `claude-design-system/readme.md` §ICONOGRAPHY ya documenta esto — ver "Pregunta bloqueante" abajo.
10. **Tarjetas plantilla con zona de relleno punteada** (p.12) y **tarjeta de icebreaker/ejercicio** (p.11) — patrones de taller/facilitación, probablemente fuera de alcance para decks institucionales estándar pero confirman que el sistema de tarjetas es compositivo (título + ícono + cuerpo + contenedor con estilos variables), no una lista cerrada de layouts.

## Diagnóstico — por qué la diferencia no es "más texto", es vocabulario visual

`core/schemas/deck-spec.schema.json` modela 10 **familias de slide planas**: cada tipo tiene un puñado de campos fijos (`title`, `stats`, `columns`, `steps`...) y el renderer dibuja **un bloque por campo**, uno debajo del otro. La presentación de referencia no usa más tipos de slide — usa las mismas ideas (cifras, comparación, proceso, agenda) pero **compone cada una con primitivas visuales reutilizables** (banner de énfasis, tarjeta con estado/alerta, grid, timeline, insignia con ícono) que hoy no existen ni en el schema ni en `renderers/`. Por eso "llenar más" no es agrandar fuentes ni añadir más líneas de texto (eso ya está limitado a propósito por `core/brand/rules/density.json`) — es dar a la skill `unisabana-create` y al renderer un catálogo de **bloques de contenido no textual** (cifra destacada, ícono, línea de tiempo, tarjeta con color de estado) para que la misma cantidad de información ocupe el espacio con más variedad visual.

Esto también explica el logo "chico": una vez resuelto el punto 4 de `08-visual-quality-and-layout-fixes.md` (aprovechamiento de espacio), la comparación contra este PDF sugiere que el problema real es que **la composición alrededor del logo está vacía**, no el tamaño en px del logo (que ya sigue el clamp normativo). Antes de tocar `LOGO_HEIGHT_PX`, agregar estas primitivas y volver a comparar.

## Qué ya existe y se puede reutilizar (no reinventar)

- **Colores:** `fac-juridicas` (rojo, ya usado para deltas negativos en `elements.mjs`) sirve para el estado "alerta" de tarjetas de comparación. `cta` (dorado/tostado) o `sabana-cream` sirven para banners tipo advertencia/nota. No se necesita ningún color nuevo — `core/brand/rules/palette.json` ya prohíbe inventar/mezclar paletas.
- **`surfaceStyle()`** (`renderers/html/elements.mjs`) ya da el tratamiento de tarjeta (fondo, radio, sombra, borde de acento superior/izquierdo) — es la base de la tarjeta con estado (punto 3) y del grid (punto 4), solo falta parametrizar el color del borde y agregar un badge opcional.
- **`core/components/data/ProgressBar.jsx`** ya existe en el núcleo de componentes pero **ningún layout lo usa todavía** — es candidato directo para dashboards/indicadores de avance dentro de una timeline o de un `data` slide.
- **`core/brand/rules/density.json#/visualLanguageLimits`** ya pone el guardarraíl (máx. 2 elementos decorativos por slide, no repetir un mismo elemento en exceso, sombras con moderación) — cualquier primitiva nueva se diseña para respetar esto, no para competir con él. No es necesario relajar este límite: un banner + una tarjeta con ícono ya comunican "rico" sin saturar.
- El motivo `brand-wave.svg` y el gradiente navy (de `08-visual-quality-and-layout-fixes.md`) ya cubren parte de la queja de "sin efectos visuales" para las 4 familias oscuras — este documento cubre el resto (familias claras: agenda, data, comparison, process, table).

## Pregunta bloqueante — iconografía

`claude-design-system/readme.md` §ICONOGRAPHY (línea ~78) ya documenta que el PPTX fuente **no trae ningún set de íconos empaquetado** y que el propio sistema sustituye con **Lucide** (`lucide.dev`, cargado por CDN) como aproximación, marcado explícitamente como "swap for an official La Sabana icon library if one is provided". Esto choca con dos reglas ya vigentes de este proyecto:

- **D-20** (`planning/07-decisions-and-open-questions.md`): el renderer debe funcionar 100% offline — no se puede cargar Lucide desde CDN en el HTML autocontenido.
- **D-Q6** (mismo documento): pregunta abierta al equipo de marca sobre si existe un set gráfico institucional oficial o si se mantiene la sustitución por Lucide — **no confirmada todavía**.

**No implementes íconos libremente sin resolver esto primero.** Camino recomendado: vendorizar un subconjunto pequeño y curado de SVGs de Lucide (los ~15-20 que cubran los casos reales: reloj, ubicación/pin, alerta/triángulo, check, flecha, calendario, usuarios, gorro de graduación, maletín, documento, engranaje) dentro de `core/brand/assets/icons/`, igual que ya se hace con las fotos de campus — embebidos como data URI, sin red — y dejar explícito en el `_provenance` del archivo que es una sustitución no aprobada por marca, igual que ya hace el propio `readme.md`. Confirmar con el "brand owner" (ver `06-security-and-governance.md`, hoy es el propio usuario del proyecto) antes de darlo por definitivo.

## Backlog de componentes nuevos (schema + validators + ambos renderers)

Cada uno requiere: 1) campo(s) nuevo(s) opcionales en `core/schemas/deck-spec.schema.json` (nunca romper los decks existentes — todo aditivo, ver política de SemVer del propio esquema en su `$comment`), 2) implementación en `renderers/html/` y su equivalente en `renderers/pptx/`, 3) si aplica, una regla de validación nueva en `validators/rules/` (p. ej. que el color de estado de una tarjeta solo pueda ser uno de los aprobados).

| # | Primitiva | Dónde aplica (tipos de slide existentes) | Talla estimada |
|---|---|---|---|
| 1 | Banner de énfasis de ancho completo (variantes: info/navy, advertencia/ámbar, destacado/tinte claro) | Cualquier slide como bloque opcional adicional — empezar por `data`, `message`, `process` | S |
| 2 | Tarjeta de comparación con estado (borde de color + badge esquina + dos cifras) | `comparison`, `data` | M |
| 3 | Grid N×M de tarjetas numeradas (alternativa a lista vertical) | `agenda` (nuevo modo `layout: grid`) | S |
| 4 | Timeline tipo Gantt (carriles + eje de fechas + marcador "hoy") | Tipo de slide nuevo, `timeline`, o extensión de `process` | L |
| 5 | Proceso alternado con tarjetas + ícono por paso | Extensión de `process` (nuevo modo `layout: alternating`) | M |
| 6 | Fondo tintado de página completa (cuarto tono, no `light`/`navy`/`photo`) | Cualquier slide claro, como opción de `background`/`tone` a nivel de slide | XS |
| 7 | Sistema de íconos vendorizado (ver pregunta bloqueante arriba) | Prerrequisito de 2, 5 y de cualquier insignia con ícono | M (bloqueado por decisión de marca) |
| 8 | Exponer `ProgressBar` existente en al menos un layout (`data` o `process`) | `data`, `process` | S |

No se propone un tipo `dashboard` separado (ya existe como `table{density:"high"}` desde el Hito 4) — las primitivas 1-3 y 8 alcanzan para enriquecer `data`/`table` sin una nueva familia.

## Plan de trabajo priorizado (para quien retome esto)

1. **[Base, desbloquea el resto] Resolver la pregunta de íconos** (vendorizar subconjunto Lucide + confirmación de marca) — sin esto, 2 y 5 quedan sin insignia con ícono (pueden salir sin ícono como versión reducida, pero pierden fidelidad frente al PDF).
2. **[Barato, alto impacto percibido] Banner de énfasis** — es el patrón que más se repite en el PDF (aparece en 5 de 12 slides) y es el más simple de construir sobre `surfaceStyle()`.
3. **[Alto impacto, respeta density.json] Tarjeta de comparación con estado** — mejora directa de `comparison.mjs`/`data.mjs` reusando el rojo de `fac-juridicas` ya aprobado.
4. **[Impacto visual alto, más grande] Timeline tipo Gantt** — la primitiva más costosa (talla L) pero la que más "llena" un slide de contenido no textual; considerar si vale la pena antes o después de validar con el usuario que las primitivas 1-3 ya acercan lo suficiente al objetivo.
5. **[Pulido] Grid de agenda, fondo tintado, proceso alternado, `ProgressBar`** — en el orden que convenga una vez validadas 2-4 con una comparación visual real contra el PDF.
6. **Actualizar `skills/unisabana-create/references/slide-families.md` y `content-voice.md`** para que la skill sepa cuándo usar cada primitiva nueva (igual que ya se hizo con el default de foto de portada en `08-visual-quality-and-layout-fixes.md`) — sin esto, las primitivas existen en el renderer pero la skill nunca las produce.
7. **Repetir cada primitiva en `renderers/pptx/`** — mismo principio que el punto 6 de `08-visual-quality-and-layout-fixes.md`: no dejar HTML rico y PPTX plano.
8. **Regenerar `tests/schema/example-deck.yaml`** (o crear un segundo deck de ejemplo) usando las primitivas nuevas, y correr `scripts/validate-brand.mjs` — cualquier primitiva que introduzca color debe validar contra `core/brand/rules/palette.json`, no solo verse bien.

## Cómo verificar cuando esté resuelto

- Volver a `ejemplo-presentacion.pdf` slide por slide y confirmar que el sistema puede reproducir el *patrón* de cada página listada en "Evidencia" (no el contenido — es de otro caso de uso), dentro de los límites de `density.json#/visualLanguageLimits`.
- Generar el mismo deck de prueba (`tests/schema/example-deck.yaml`, títulos largos reales) con al menos una primitiva nueva por familia de slide aplicable y enviárselo al usuario para revisión visual directa — igual que en `08-visual-quality-and-layout-fixes.md`, ninguna validación automática reemplaza que el usuario lo vea.
- Confirmar que `validate-brand.mjs` sigue en verde y que ninguna primitiva nueva introdujo un color o ícono fuera de lo aprobado.
