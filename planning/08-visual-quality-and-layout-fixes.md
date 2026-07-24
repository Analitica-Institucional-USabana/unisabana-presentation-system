# 08 — Plan de corrección: calidad visual y layout del renderer HTML

> Para una sesión de Claude Code nueva, sin memoria de la conversación donde se construyó esto. Contexto necesario: los Hitos 0–7 de `03-migration-roadmap.md` están completos — existe `core/` (tokens/reglas/componentes), `skills/` (`unisabana-create`, `unisabana-review`), `core/schemas/deck-spec.schema.json`, `validators/`, `renderers/html/` y `renderers/pptx/`, y ambos adaptadores de plugin (`adapters/claude-plugin`, `adapters/codex-plugin`). El ciclo crear→validar→renderizar→revisar funciona de punta a punta. Este documento es el backlog de lo que NO quedó bien: el usuario probó el plugin instalado generando una presentación real y el resultado, aunque técnicamente válido (pasa `validate-brand.mjs`), se ve mal.

## Evidencia

El usuario adjuntó 4 capturas de un deck real generado por `unisabana-create` + `renderers/html/render.mjs` (círculos rojos suyos marcando el problema):

1. **Cover**: título ("La investigación institucional consolidó su crecimiento en 2025") se superpone con el eyebrow/subtítulo. Fondo navy plano — no se usó `assets/campus-2.jpg` a pesar de ser la imagen "casi obligatoria" para portada.
2. **Data**: título ("La producción investigativa creció de forma sostenida en 2025") se superpone con la fila de cifras (`XX +XX% Publicaciones indexadas`, etc.).
3. **Message**: título ("El fortalecimiento de las alianzas internacionales fue el mayor logro del año") se superpone con el texto de apoyo.
4. **Comparison**: título ("El desempeño de 2025 superó al del año anterior en los tres frentes prioritarios") se superpone con las tarjetas de comparación 2024/2025.

Feedback adicional del usuario (no solo bugs, también calidad/dirección de diseño):
- Usar más las imágenes/assets — el campus (`campus-2.jpg`) debería ser casi el default de portada.
- El logo institucional se ve muy pequeño.
- El texto en general se ve pequeño.
- No se aprovecha el espacio del canvas (mucho vacío, contenido apelotonado arriba).
- Falta creatividad/gradientes — que "se sienta muy UX".
- No hay problema en que esto quede como una lista de fixes para después; el MVP (Hitos 0–7) ya está cumplido.

## Causa raíz del bug de superposición (los 4 casos son el MISMO bug)

`renderers/html/layouts/*.mjs` calcula la posición Y de cada elemento sumando un offset fijo que **asume que el título ocupa una sola línea**:

```js
// renderers/html/layouts/data.mjs (patrón idéntico en cover.mjs, message.mjs, comparison.mjs, y probablemente
// separator.mjs, process.mjs, table.mjs, quote.mjs, closing.mjs — no se vieron en las capturas pero comparten
// el mismo patrón de código, hay que revisarlos igual)
const statsY = titleY + Math.round(TYPE_SCALE_PX.slideTitle * 1.15) + 60;
```

`TYPE_SCALE_PX.slideTitle * 1.15` es la altura de **una línea** de texto. Pero `content-voice.md` (la propia guía de voz que la skill `unisabana-create` sigue) exige títulos tipo conclusión ("Los ingresos crecieron 18% en 2024", no "Ingresos") — son oraciones largas que a los tamaños definidos en `constants.mjs` (`coverTitle`=96px, `sectionTitle`=74px, `slideTitle`=51px) **envuelven a 2 o incluso 3 líneas casi siempre**. El renderer nunca mide cuántas líneas ocupa realmente el título antes de posicionar lo que sigue — por eso todo lo que viene después queda encima de la segunda línea.

Esto no es un bug aislado de una slide: es un defecto sistémico del enfoque "posición absoluta fija calculada de antemano" (`renderers/html/constants.mjs` + todos los `layouts/*.mjs`) frente a texto de longitud variable. Con títulos cortos no se nota; con la voz institucional real (que es intencionalmente larga), se rompe casi siempre.

### Opciones de solución (evaluar y decidir, no elegidas de antemano)

**Opción A — Heurística de ancho de carácter (barata, sin dependencias nuevas)**
Estimar el número de líneas con un factor de ancho promedio por carácter para Libre Franklin bold (aprox. 0.55–0.6× el tamaño de fuente), calcular `líneas = ceil(anchoEstimadoTexto / anchoDelBox)`, y usar `líneas * fontSize * lineHeight` como la altura real antes de posicionar el siguiente elemento.
- Ventaja: no añade dependencias, cambio contenido en `constants.mjs`/`elements.mjs`.
- Desventaja: aproximado — Libre Franklin no es monoespaciada, el error crece con texto muy corto o muy largo. Hay que calibrar el factor contra casos reales (probar con títulos de 3, 8, 15 palabras).

**Opción B — Medición real con navegador headless (Playwright/Puppeteer)**
Ya estaba identificada como decisión pendiente **D-18** en `planning/07-decisions-and-open-questions.md` (deferida al Hito 6, nunca adoptada). Renderizar en dos pasadas: (1) cajas de texto con `height:auto`, medir alto real vía `getBoundingClientRect`: (2) reposicionar con las alturas medidas.
- Ventaja: exacto, resuelve el problema de raíz para cualquier longitud de texto, cualquier idioma.
- Desventaja: dependencia pesada (~300 MB con el binario del navegador), el renderer deja de ser síncrono/puro-Node, más superficie para mantener.

**Opción C — Presupuesto vertical generoso fijo (más simple, acepta espacio vacío)**
Reservar siempre espacio para 2–3 líneas de título (el caso común, no el caso corto), sin medir nada. Combinar con la Opción A si se quiere afinar después.
- Ventaja: cero dependencias, cambio mínimo, elimina la superposición en el 100% de los casos por construcción.
- Desventaja: cuando el título es corto (una línea), queda espacio vacío antes del contenido — pero esto además **ayuda** con la queja de "no se aprovecha el espacio" solo si el presupuesto sobrante se rellena con contenido más grande (ver sección siguiente), no si se deja como vacío puro.

**Recomendación tentativa (a validar por quien retome esto):** empezar por **C** (elimina el bug ya, es el cambio más chico) y evaluar si con eso más los ajustes de la siguiente sección la queja de "espacio desaprovechado" queda resuelta. Si no, escalar a **A**. Reservar **B** para cuando de verdad se necesite pixel-perfect (posiblemente nunca, dado que el propio roadmap dice explícitamente que esto no es una meta del MVP).

## Backlog de calidad visual (más allá del bug de superposición)

### 1. Fondo de portada: usar `campus-2.jpg` por default
Hoy `slide.background` lo decide libremente el agente (`unisabana-create`) al redactar el Deck Spec; nada lo empuja hacia `photo`. Ajustar `skills/unisabana-create/references/slide-families.md` (sección de `cover`) y/o el propio `SKILL.md` para indicar explícitamente: *"usa `background: photo` con `photo: assets/campus-2.jpg` salvo que el usuario pida explícitamente un fondo claro/navy plano o especifique otra facultad/contexto"*. Esto es un cambio de instrucción a la skill, no de código del renderer.

### 2. Logo institucional "se ve pequeño"
Los tamaños actuales (`renderers/html/constants.mjs#LOGO_HEIGHT_PX`) son la resolución literal de los `clamp()` que ya trae `claude-design-system/readme.md` (cover=79px, separator=58px, **content=36px**, closing=72px). El propio readme.md dice explícitamente *"never enlarge the logo merely to fill empty space"* y *"use the smallest presentation-recommended size that remains clearly legible"* para slides de contenido — es decir, 36px pequeño **es la regla documentada**, no un descuido. Antes de agrandarlo, quien retome esto debe decidir: ¿el usuario quiere violar/reinterpretar esa regla (y entonces esto es una decisión de marca que idealmente se confirma con el equipo de comunicaciones, ver `planning/06-security-and-governance.md` sobre gobernanza), o el problema real es que el logo se ve pequeño **porque el resto de la composición está apelotonada arriba** (punto 4) y no porque el valor en px esté mal? Recomendación: resolver primero el punto 4 (aprovechamiento de espacio) y volver a mirar el logo — puede que el problema perceptual desaparezca solo.

### 3. "Las letras se ven pequeñas"
Mismo razonamiento que el punto 2: `TYPE_SCALE_PX` en `constants.mjs` ya resuelve los `clamp()` del addendum del readme (`slideTitle`≈51px, `body`=20px, etc.) — son los valores normativos, no arbitrarios. Cuerpos de texto secundarios que el renderer inventó por su cuenta (no vienen del readme) sí son candidatos legítimos a revisar sin tensión con la marca: por ejemplo `caption`/`source` a 14px en `data.mjs`, o el tamaño de `label`/`caption` dentro de `statBlock` en `elements.mjs`. Revisar esos caso por caso.

### 4. Espacio del canvas desaprovechado / "todo está corrido"
Visible en las 4 capturas: el contenido termina alrededor de un tercio de la altura del slide (720px), dejando la mitad inferior vacía. Causas probables combinadas:
- Todas las Y de arranque (`SAFE.top + 40`, `y = 220`, `y = 260`, etc. en cada `layouts/*.mjs`) son valores fijos pensados para "empezar arriba", sin ningún intento de centrar o distribuir verticalmente según cuánto contenido hay.
- Ningún layout usa `CANVAS.height` (720) para calcular una distribución vertical proporcional — todo está anclado a `SAFE.top`.
- Fix concreto: en cada layout, calcular la altura total del contenido (título + cuerpo + lo que sea) y centrar ese bloque verticalmente en el espacio disponible entre el logo (arriba) y el pie de atribución IA (abajo), en vez de anclarlo siempre arriba. Esto además interactúa directamente con la Opción A/B de medición de texto del bug principal — conviene resolver ambos juntos.

### 5. Sin gradientes / motivo de marca sin usar / "que se sienta muy UX"
`claude-design-system/readme.md` describe explícitamente un **motivo gráfico recurrente**: `assets/brand-wave.svg`, "gradient corner wave... #00387E → #0D2157... recurring graphic motif for covers/separators". **El renderer nunca lo usa** — ni en `cover.mjs`, ni en `separator.mjs`, ni en `quote.mjs`, ni en `closing.mjs`. Esto es una omisión real (no una tensión con la marca, al contrario: es *seguir* la marca que hoy no se sigue). Tareas concretas:
- Incorporar `core/brand/assets/brand-wave.svg` como elemento decorativo en `cover` (fondo navy/photo), `separator`, `quote` y `closing` — las 4 familias que el propio readme.md marca como candidatas.
- Revisar reglas de uso ya capturadas en `core/brand/rules/density.json#/visualLanguageLimits` (máx. 2 elementos de diagramación decorativa por slide, la ola no debe competir con el título, no debe combinarse con más patrones decorativos) — no añadirlo libremente, seguir esas reglas.
- Para fondos navy planos (`separator`, `quote`, `closing`, `cover{background:navy}`), considerar un gradiente sutil `linear-gradient` entre `--sabana-blue-mid` y `--sabana-blue-deep` en vez de un fill sólido — coherente con el propio patrón que `CLAUDE.md`/`readme.md` ya usan para el degradado de protección de fotos, aplicado ahora al fondo plano.
- Sombras/profundidad: las tarjetas de `comparison.mjs` ya usan `var(--shadow-md)` (`surfaceStyle` en `elements.mjs`) — extender ese mismo tratamiento a otros bloques que hoy son texto plano sin superficie (p. ej. los `stat` de `data.mjs` podrían vivir dentro de una tarjeta sutil en vez de flotar directamente sobre el fondo).

## Plan de trabajo priorizado (para quien retome esto)

1. **[Bloqueante, alto impacto] Corregir el bug de superposición.** Decidir A/B/C de la sección anterior, implementarlo en `renderers/html/constants.mjs` + `renderers/html/elements.mjs` (el punto único donde hoy se calculan alturas de texto) y propagar a los 10 `layouts/*.mjs`. Criterio de aceptación: renderizar `tests/schema/example-deck.yaml` (ya tiene títulos largos reales) y confirmar visualmente que ningún texto se superpone, en las 10 familias, no solo las 4 de las capturas.
2. **[Barato] Default de portada a `campus-2.jpg`.** Editar `skills/unisabana-create/references/slide-families.md` y regenerar el ejemplo para confirmar que el agente ahora elige `photo` por defecto.
3. **[Requiere decisión, no solo código] Logo y tamaños de texto.** Antes de tocar `LOGO_HEIGHT_PX`/`TYPE_SCALE_PX`, confirmar si se acepta desviarse de los valores literales del `readme.md`, o si el problema se resuelve solo al arreglar el punto 4.
4. **[Impacto visual alto] Distribución vertical / aprovechamiento de espacio.** Rediseñar el cálculo de Y en los 10 layouts para centrar/distribuir el bloque de contenido en el alto disponible, no anclarlo siempre arriba.
5. **[Pulido] Motivo de marca (`brand-wave.svg`) + gradientes en fondos navy.** Incorporar en `cover`, `separator`, `quote`, `closing`, respetando `density.json#/visualLanguageLimits`.
6. **Repetir para `renderers/pptx/`.** Todo lo anterior existe también en la versión PPTX (`renderers/pptx/layouts/*.mjs`, mismo patrón de Y fijo) — no arreglar solo HTML y dejar PPTX con el mismo bug.
7. **Regenerar y volver a correr `scripts/validate-brand.mjs`** sobre el deck de referencia después de cada cambio — los checks de logo/atribución ya existentes deben seguir en verde; si se cambia `LOGO_HEIGHT_PX`, actualizar también `core/brand/rules/logo.json` si aplica, para que validador y renderer no diverjan (evitar la brecha G-04 ya documentada: dos fuentes de verdad desalineándose).

## Cómo verificar cuando esté arreglado

- Renderizar `tests/schema/example-deck.yaml` (ya tiene títulos largos reales, es el caso que rompió) y las 10 familias deben verse sin superposición.
- Probar además con títulos deliberadamente cortos ("Agenda", "2025") para confirmar que la solución elegida (A/B/C) no deja espacios absurdos en el caso corto.
- Si se adopta la Opción B (headless browser), esto además resuelve de una vez la brecha ya anotada en `05-testing-strategy.md` sobre pruebas visuales de overflow/superposición automatizadas — vale la pena resolver ambas cosas en el mismo cambio si se llega a esa opción.
- Volver a enviar el HTML/PPTX generado al usuario para revisión visual directa, igual que en los Hitos 5 y 7 — ninguna verificación automática reemplaza que el usuario lo vea.
