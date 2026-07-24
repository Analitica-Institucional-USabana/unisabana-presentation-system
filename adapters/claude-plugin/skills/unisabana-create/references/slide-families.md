# Familias de diapositiva aprobadas

> Extraído de `claude-design-system/readme.md` §9 REQUIRED SLIDE FAMILIES. Ejemplos visuales de referencia (no copiables tal cual — ver nota al final): `claude-design-system/slides/01-cover.html` … `10-dashboard.html`.

Ensambla cada deck a partir de estas familias en vez de composición libre sin restricciones. Elige la que mejor represente cada idea del contenido — no fuerces todo a "contenido genérico".

1. **Cover / Portada** — un título orientado a mensaje, subtítulo opcional, fecha/evento/presentador solo si aporta, logo institucional, atribución IA obligatoria, un único registro de fondo dominante (claro, navy o fotografía de campus aprobada). **Por defecto usa `background: photo` con `photo: assets/campus-2.jpg`** (core/brand/rules/imagery.json#/default) — es la imagen "casi obligatoria" de portada; usa `light` o `navy`, o una foto distinta de `approvedCampusPhotography`, solo si el usuario lo pide explícitamente o el contenido apunta a una facultad/contexto concreto. Evitar: varias tarjetas, agendas densas, más de un motivo decorativo, logo centrado salvo que la plantilla lo exija.
2. **Agenda / ruta** — 3-6 ítems, secuencia clara, un solo sistema de numeración, sin descripciones de párrafo.
3. **Separador de sección** — un número de sección, un mensaje de sección, descriptor corto opcional, alto contraste, baja densidad, sin gráficos ni tablas.
4. **Mensaje** — una conclusión central, una frase de apoyo o prueba, visual único opcional, tipografía grande y espacio generoso.
5. **Cifras / datos** — título orientado a conclusión, métrica claramente etiquetada, unidad, periodo, fuente, etiquetas directas donde sea posible; nunca 3D ni perspectiva decorativa falsa.
6. **Comparación** — comparar dimensiones equivalentes, columnas simétricas o deliberadamente contrastadas, número de tarjetas limitado, una sola lógica de acento, el color nunca es el único portador de significado.
7. **Proceso / línea de tiempo** — dirección clara, conectores y formas de nodo consistentes, preferir 3-6 pasos por diapositiva; dividir procesos largos en vez de encoger el texto.
8. **Tabla / técnica** — mínimo 20px de cuerpo siempre que sea posible, fila de encabezado fuerte, líneas de grilla reducidas, resaltar solo los valores necesarios para el mensaje, dividir tablas demasiado densas, nunca poner el logo dentro del área de la tabla.
9. **Cita** — una cita, una atribución, baja densidad, fondo navy oscuro o editorial claro, sin decoración de comillas más grande que la cita misma.
10. **Cierre** — una declaración de cierre o llamada a la acción, logo institucional aprobado, información de contacto opcional, atribución IA, sin argumento nuevo ni resumen denso.

## Bloques compositivos opcionales (no son familias nuevas)

`planning/09-visual-richness-and-content-density.md` documenta que el problema de "se ve plano" no es falta de texto, es falta de vocabulario visual no textual. Estos bloques son opcionales y se agregan *dentro* de una familia existente — no crean un tipo de slide nuevo.

11. **Banner de énfasis** (campo `banner` en `data`/`message`/`process`) — franja de ancho completo para UNA cifra o frase destacada, nunca un párrafo. Variantes: `info` (navy, para una apertura o conclusión fuerte), `warning` (ámbar/crema, con `label:"NOTA"` y opcionalmente `icon:"triangle-alert"` para advertencias reales), `highlight` (tinte claro, dato secundario relevante). Máximo un banner por slide — `core/brand/rules/density.json#/visualLanguageLimits` permite 2 elementos decorativos por slide, así que no combines banner + tarjeta con estado en la misma diapositiva salvo que uno de los dos sea claramente el foco. Evitar: usarlo como sustituto del título, texto largo, más de un banner.
12. **Tarjeta de comparación con estado** (campos `accent`/`badge`/`stats` en las columnas de `comparison`, o en los `stats` de `data`) — borde de acento izquierdo + badge de esquina + hasta 2 cifras grandes lado a lado. `accent:"alert"` reutiliza el rojo ya aprobado de `fac-juridicas` — úsalo solo para señalar un riesgo/problema real (el color es portador de significado, nunca decoración por variedad). `accent:"neutral"` o simplemente omitir `accent` da el borde institucional normal.
13. **Íconos** (campo `banner.icon`) — subconjunto vendorizado de Lucide en `core/brand/rules/icons.json#/approvedIcons` (13 slugs: clock, map-pin, triangle-alert, check, arrow-right, calendar, users, graduation-cap, briefcase, file-text, settings, x, info). Es una sustitución **no aprobada por marca** (pregunta abierta D-Q6 en `planning/07-decisions-and-open-questions.md`) — úsala igual que se documenta en `claude-design-system/readme.md` §ICONOGRAPHY: monocromo, acompaña una etiqueta, nunca la reemplaza, nunca decorativo puro. Un slug fuera de la whitelist es error de validación (`validators/rules/icons.mjs`), no advertencia.

## Nota sobre los ejemplos en `slides/*.html`

Esos 10 archivos son ejemplos de catálogo de Claude Design, útiles como referencia visual de layout — **pero todavía usan `display:flex`/`display:grid` y no están "desagrupados"** (violan la propia regla de `claude-design-system/CLAUDE.md`). Úsalos para entender composición y jerarquía visual, no los copies literalmente como si fueran el entregable final; el paso de flatten descrito en `references/workflow.md` sigue siendo obligatorio sobre lo que tú generes.
