# Familias de diapositiva aprobadas

> Extraído de `claude-design-system/readme.md` §9 REQUIRED SLIDE FAMILIES. Ejemplos visuales de referencia (no copiables tal cual — ver nota al final): `claude-design-system/slides/01-cover.html` … `10-dashboard.html`.

Ensambla cada deck a partir de estas familias en vez de composición libre sin restricciones. Elige la que mejor represente cada idea del contenido — no fuerces todo a "contenido genérico".

1. **Cover / Portada** — un título orientado a mensaje, subtítulo opcional, fecha/evento/presentador solo si aporta, logo institucional, atribución IA obligatoria, un único registro de fondo dominante (claro, navy o fotografía de campus aprobada). Evitar: varias tarjetas, agendas densas, más de un motivo decorativo, logo centrado salvo que la plantilla lo exija.
2. **Agenda / ruta** — 3-6 ítems, secuencia clara, un solo sistema de numeración, sin descripciones de párrafo.
3. **Separador de sección** — un número de sección, un mensaje de sección, descriptor corto opcional, alto contraste, baja densidad, sin gráficos ni tablas.
4. **Mensaje** — una conclusión central, una frase de apoyo o prueba, visual único opcional, tipografía grande y espacio generoso.
5. **Cifras / datos** — título orientado a conclusión, métrica claramente etiquetada, unidad, periodo, fuente, etiquetas directas donde sea posible; nunca 3D ni perspectiva decorativa falsa.
6. **Comparación** — comparar dimensiones equivalentes, columnas simétricas o deliberadamente contrastadas, número de tarjetas limitado, una sola lógica de acento, el color nunca es el único portador de significado.
7. **Proceso / línea de tiempo** — dirección clara, conectores y formas de nodo consistentes, preferir 3-6 pasos por diapositiva; dividir procesos largos en vez de encoger el texto.
8. **Tabla / técnica** — mínimo 20px de cuerpo siempre que sea posible, fila de encabezado fuerte, líneas de grilla reducidas, resaltar solo los valores necesarios para el mensaje, dividir tablas demasiado densas, nunca poner el logo dentro del área de la tabla.
9. **Cita** — una cita, una atribución, baja densidad, fondo navy oscuro o editorial claro, sin decoración de comillas más grande que la cita misma.
10. **Cierre** — una declaración de cierre o llamada a la acción, logo institucional aprobado, información de contacto opcional, atribución IA, sin argumento nuevo ni resumen denso.

## Nota sobre los ejemplos en `slides/*.html`

Esos 10 archivos son ejemplos de catálogo de Claude Design, útiles como referencia visual de layout — **pero todavía usan `display:flex`/`display:grid` y no están "desagrupados"** (violan la propia regla de `claude-design-system/CLAUDE.md`). Úsalos para entender composición y jerarquía visual, no los copies literalmente como si fueran el entregable final; el paso de flatten descrito en `references/workflow.md` sigue siendo obligatorio sobre lo que tú generes.
