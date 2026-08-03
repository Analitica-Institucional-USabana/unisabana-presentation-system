# Familias de módulo aprobadas (`modules[].type`)

> Extraído de `claude-design-system/guidelines/infografias.md` §4 CATÁLOGO OFICIAL. Cada módulo del desarrollo (`modules[]`) responde a una única idea — elige la familia y `variant` según el **tipo de dato que quieres comunicar**, nunca por preferencia estética. `infografia.keyNumbers` (tarjetas KPI del encabezado) es un campo aparte, obligatorio, distinto de un módulo `indicators` del desarrollo.

1. **`indicators`** (Indicadores) — cifras destacadas dentro del desarrollo (no la tira de KPIs del encabezado, esa es `infografia.keyNumbers`). Variantes: `kpi-cards` (varias cifras agrupadas), `big-number` (una sola cifra hero), `percentage` (indicador porcentual), `progress-bar` (avance 0-100 hacia una meta), `gauge` (medidor). Úsalo cuando el punto central del módulo es una o pocas cifras aisladas, sin necesidad de comparar categorías.

2. **`comparison`** (Comparación) — comparar magnitudes entre categorías equivalentes. Variantes: `bars-horizontal`/`bars-vertical` (comparación simple), `grouped` (varias series por categoría), `stacked` (composición + comparación a la vez), `divergent` (valores positivos/negativos desde un eje central), `ranking` (orden de mayor a menor), `lollipop`/`dumbbell` (pocas categorías, énfasis editorial), `bullet` (valor vs. meta). Úsalo cuando el mensaje es "X es mayor/menor que Y", nunca para una serie temporal (eso es `trend`).

3. **`trend`** (Tendencias) — evolución en el tiempo. Variantes: `line`, `area`, `stacked-area`, `timeline`, `slope` (dos momentos, muchas categorías), `sparkline` (miniatura sin ejes, dentro de contexto denso). Requiere `categories` como eje temporal (periodos/fechas) y `series`.

4. **`distribution`** (Distribución) — forma de una variable, no solo su promedio. Variantes: `dot-plot`, `scatter` (relación entre dos variables), `histogram` (frecuencias en bins), `box-plot`/`violin` (dispersión y cuartiles). Úsalo cuando el mensaje es sobre variabilidad/dispersión, no sobre una sola cifra resumen.

5. **`composition`** (Composición) — parte de un todo. Variantes: `donut`, `waffle` (partes como unidades discretas, bueno para porcentajes redondeados), `treemap`/`sunburst` (composición jerárquica), `mosaic`. Máximo 8 categorías (`items`) — si hay más, agrupa las menores en "otros" o cambia a `comparison`/`ranking`.

6. **`relationship`** (Relaciones) — conexiones entre entidades. Variantes: `sankey` (flujo entre etapas), `network` (nodos y conexiones), `bubble` (tres variables: x, y, tamaño), `correlation-matrix`, `chord`. Requiere `nodes` + `links`.

7. **`process`** (Procesos) — secuencia con dirección. Variantes: `flowchart`, `swimlane` (pasos organizados por carril/responsable), `chevron` (flecha secuencial, la variante por defecto), `funnel` (embudo de conversión, usa `steps[].value` para el tamaño relativo), `journey-map`, `pipeline`. Prefiere 3-6 pasos; si son más, divide en varios módulos en vez de comprimir.

8. **`hierarchy`** (Jerarquías) — estructura de niveles. Variantes: `orgchart`, `tree`, `mindmap`, `pyramid`. Usa `root` (nodo raíz con `children` anidados).

9. **`geography`** (Geografía) — datos por región. Variantes: `choropleth` (color por región según valor), `bubble-map`, `heatmap`, `point-map`. **`basemap` solo admite `colombia` o `world`** — son los únicos mapas base vendorizados (`core/brand/assets/maps/`); no se genera una proyección cartográfica en vivo ni se inventa un basemap distinto. Si el contenido necesita un mapa no cubierto (ej. un departamento específico), avisa la limitación al usuario en vez de improvisar un basemap incorrecto.

10. **`strategy`** (Estrategia) — marcos analíticos. Variantes: `matrix-2x2` (la variante por defecto, dos ejes con `axes.xLabel`/`axes.yLabel`), `eisenhower`, `bcg`, `risk-matrix`, `radar`, `venn`, `canvas` (tipo Business Model Canvas — `axes` no aplica en `venn`/`canvas`). Úsalo para posicionamiento, priorización o marcos de decisión, no para series de datos crudos.

## Estilo editorial (aplica a todas las familias)

`guidelines/infografias.md` §5: apariencia de nivel Harvard Business Review / McKinsey / Deloitte / Gartner / Nature / Financial Times / World Economic Forum / Naciones Unidas. El motor de gráficas (`renderers/html/charts/`) ya aplica esto por construcción (sin 3D, sin degradados innecesarios, sin clipart, colores planos de la paleta institucional activa) — tu responsabilidad como agente es solo elegir la familia/variant correcta y los datos, no ajustar el estilo visual manualmente.
