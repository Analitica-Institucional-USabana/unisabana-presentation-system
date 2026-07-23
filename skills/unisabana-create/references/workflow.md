# Flujo de entrega

> Extraído de `claude-design-system/CLAUDE.md`.

## 1. Agrupar para construir, desagrupar para entregar

Este sistema lo usan personas **no técnicas** que editan arrastrando elementos. Los contenedores flex/grid dificultan mover, borrar o editar un elemento suelto.

- **Mientras diseñas:** construye todo agrupado y alineado con flex/grid — es la forma correcta de lograr composición y ritmo precisos.
- **Justo antes de entregar** el artefacto: desagrupa (aplana) el layout. Convierte contenedores de layout (tablas, listas, grids de tarjetas, filas de chips/botones, cifras+etiquetas) en elementos posicionados de forma independiente (`position:absolute` con `left`/`top` en px), conservando exactamente la posición visual que tenían agrupados.
- No dejes `display:flex`/`display:grid`/`gap` en el contenedor raíz de la diapositiva ni en grupos de contenido editable.
- Puedes conservar como grupo las unidades que SIEMPRE se editan juntas (ej. el pie de atribución IA + su logo, el eyebrow con su barra de acento). Todo lo demás — celdas, ítems, tarjetas, cifras — va suelto.
- Las **tablas** son el caso más sensible: entrega cada celda como texto independiente posicionado, nunca una fila flex donde arrastrar una celda rompe el resto.

Regla de oro: **agrupar para construir, desagrupar para entregar.**

## 2. Pie de atribución IA (obligatorio, ver `core/brand/rules/ai-disclosure.json` para el detalle exacto)

Todo artefacto entregado debe incluir el pie definido en `ai-disclosure.json` (texto, logo, posición, tamaño, separación mínima del logo institucional). No lo omitas ni lo modifiques.

## 3. Activos

Copia los activos usados (logo, imágenes de campus, `claude-logo.svg`) junto al HTML de salida y referéncialos con ruta relativa — no dependas de que `core/brand/assets/` exista en la máquina del usuario final. Nunca uses un activo fuera de las whitelists de `core/brand/rules/logo.json` e `imagery.json`.

## 4. Offline

Si el entregable debe abrir sin conexión, no dependas del `@import` de Google Fonts de `core/brand/tokens.json#/fonts` — embebe la fuente (WOFF2 local) en vez de referenciar el CDN.
