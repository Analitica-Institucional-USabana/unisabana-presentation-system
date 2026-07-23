# Reglas del proyecto — Universidad de La Sabana Design System

## Pie de página obligatorio (atribución de IA)
En **toda** diapositiva, plantilla, mock o artefacto que se genere con este sistema, incluir SIEMPRE un pie de página en la **esquina inferior derecha** con:

- El texto **"Diseñado con Claude design"**
- El **logo de Claude** a su lado (archivo en `assets/claude-logo.svg` cuando esté disponible; si aún no existe, dejar el texto + un espacio reservado y NO inventar el logo).

Propósito: dejar explícito que se hizo uso de IA en el diseño.

Especificaciones:
- Posición: abajo a la derecha, dentro del área segura (~24–40px del borde).
- Tamaño: discreto, ~12–13px el texto; logo con altura ~14–16px.
- Color: que contraste con el fondo (usar `--ink-500` sobre fondos claros, `--sabana-blue-300` o blanco sobre navy/foto).
- No debe competir con el contenido ni con el logo institucional de La Sabana (que va en su esquina habitual).

Patrón de referencia:
```html
<div style="position:absolute;right:32px;bottom:24px;display:flex;align-items:center;gap:8px;font-size:12px;color:var(--ink-500)">
  <span>Diseñado con Claude design</span>
  <img src="assets/claude-logo.svg" alt="Claude" style="height:15px;width:auto">
</div>
```

## Desagrupar antes de entregar (edición fácil para perfiles no técnicos)
Este sistema lo usan personas **no técnicas** que editan arrastrando elementos. Los contenedores flex/grid dificultan mover, borrar o editar un elemento suelto (una celda de tabla, un ítem de lista, una tarjeta).

Flujo obligatorio en dos fases:

1. **Mientras diseño:** construir todo **agrupado y alineado** con flex/grid — es la forma correcta de lograr composición, ritmo y alineación precisos.
2. **Justo ANTES de entregar** la presentación/artefacto al usuario: **desagrupar (aplanar) el layout** para que cada elemento quede posicionado de forma independiente y fácil de arrastrar y editar.

Reglas del aplanado final:
- Convertir los contenedores de layout (tablas, listas, grids de tarjetas, filas de chips/botones, cifras + etiquetas) en **elementos posicionados de forma absoluta e independiente** dentro de la diapositiva (`position:absolute` con `left`/`top` en px), conservando exactamente la posición visual que tenían agrupados.
- **No** dejar `display:flex` / `display:grid` / `gap` en el contenedor raíz de la diapositiva ni en los grupos de contenido editable: el usuario debe poder mover cada pieza sin que las demás se reacomoden.
- Mantener la **misma apariencia** (posiciones, tamaños, espaciado): aplanar es un paso técnico invisible, no un rediseño.
- Se pueden conservar como grupo las unidades que SIEMPRE se editan juntas y no tiene sentido separar (p. ej. el pie "Diseñado con Claude Design" + logo, o el eyebrow con su barra de acento). Todo lo demás — celdas, ítems, tarjetas, cifras — va suelto.
- Las **tablas** son el caso más sensible: entregar cada celda como texto independiente posicionado (o una tabla real editable celda a celda), nunca una fila flex donde arrastrar una celda rompe el resto.

Regla de oro: **agrupar para construir, desagrupar para entregar.**
