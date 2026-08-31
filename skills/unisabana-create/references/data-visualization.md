# Cuándo usar texto, gráfico o diagrama

> Marco de decisión provisto por el usuario del proyecto (2026-08-31), adaptado a lo que el Deck Spec puede construir hoy. planning/09-visual-richness-and-content-density.md Fase 1 implementó el campo `chart` (gráficos nativos de PowerPoint); sus adendas Fase 2 sumaron 7 diagramas sin gráfico nativo (matrix-2x2, funnel, hierarchy, network, treemap, pyramid, venn), dibujados con formas. El resto de la biblioteca original del usuario sigue siendo criterio de composición con las primitivas ya existentes, no campos nuevos del esquema.

Antes de diseñar cada diapositiva, pregúntate: **¿esta información se entiende mejor con texto, o existe una representación visual que comunique la misma idea más rápido y de forma más memorable?**

Un gráfico o diagrama comunica información, nunca decora. No conviertas contenido en gráfico solo para que la diapositiva "se vea más visual" — si no aporta estructura, comparación o comprensión, es texto.

- **Texto** → mensaje narrativo, conceptual, que requiere explicación.
- **Gráfico** (`chart`, ver abajo) → cantidades, métricas, diferencias, tendencias, distribución.
- **Diagrama** (`process`, `comparison` con tarjetas de estado, banner) → relaciones, procesos, etapas, jerarquías, flujos.
- **Indicadores destacados** (`stats` en `data`) → una a cuatro cifras que son el mensaje principal.

**Restricción innegociable: nunca inventes valores numéricos.** Si el contenido no trae datos reales, usa un diagrama conceptual, iconografía, un proceso, o queda en composición textual — nunca fabriques una cifra para justificar un `chart`.

## Gráficos disponibles hoy (`chart` en `data`/`message`)

`core/schemas/deck-spec.schema.json#/$defs/chart` — nativos de PowerPoint (editables, `pptxgenjs addChart`), no imágenes:

| `type` | Úsalo para | Forma de datos |
|---|---|---|
| `bar-horizontal` | comparar categorías, rankings; preferir sobre vertical con muchas categorías o nombres largos | `categories[]` + `series[{name,values[]}]` |
| `bar-vertical` | comparar categorías, actual vs. meta, escenarios | igual que arriba |
| `line` | evolución temporal, tendencia, series históricas | igual que arriba (categorías = eje temporal) |
| `area` | evolución + volumen/acumulación; solo si aporta algo frente a `line` | igual que arriba |
| `donut` | composición de un todo, pocas categorías (nunca pie con muchas) | `items[{label,value}]` |
| `scatter` | relación entre dos variables, outliers, agrupaciones | `points[{x,y,group?}]` |
| `radar` | perfil multidimensional, 3+ ejes (ej. autoevaluación por criterio) | `items[{label,value}]`, un eje por ítem |

Reglas: `values.length` de cada serie debe igualar `categories.length` (validado en `validators/rules/chart-data.mjs`); máximo 4 series por chart (legibilidad); título del chart es opcional y no repite el título del slide, que debe seguir siendo la conclusión (`references/content-voice.md`).

## Diagramas disponibles hoy, sin gráfico nativo (mismo campo `chart`)

Sin equivalente en `pptxgenjs addChart` — se dibujan con formas (`renderers/pptx/diagrams.mjs`), pero siguen siendo objeto real del deck (editable como forma de PowerPoint), no una imagen:

| `type` | Úsalo para | Forma de datos |
|---|---|---|
| `matrix-2x2` | priorización/clasificación en dos dimensiones (impacto×esfuerzo, urgencia×importancia) | `items[{label,x,y}]` + `axes:{xLabel,yLabel}` opcional |
| `funnel` | reducción progresiva real entre etapas (cada una implica una conversión, no una lista cualquiera) | `items[{label,value?}]` — el ORDEN del array es la secuencia, de arriba hacia abajo, angostando |
| `hierarchy` | organigrama o árbol de estructura (nunca para pasos secuenciales — eso es `process`) | `tree:{label,children:[...]}` recursivo |
| `network` | relaciones entre varios elementos; un hub-and-spoke es solo un `network` con un nodo enlazado a todos los demás, **no un `type` aparte** | `nodes[{id,label}]` + `links[{source,target,value?}]` |
| `treemap` | composición de un todo cuando hay más categorías de las que un `donut` puede leerse bien (5+) | `items[{label,value}]` — misma forma que `donut` |
| `pyramid` | jerarquía REAL entre niveles (nunca decorativo para una lista arbitraria) | `items[{label}]` — el ORDEN es la secuencia, de arriba hacia abajo, ensanchando (cúspide→base) |
| `venn` | intersección real entre 2-3 conjuntos (nunca decorativo) | `items[{label}]`, exactamente 2 o 3 |

Igual restricción anti-fabricación: en `matrix-2x2` no inventes coordenadas para que quede "bien distribuido" — si no hay una estimación real de x/y, usa una composición textual o `comparison`. En `funnel`/`pyramid`, `value` es opcional (el orden ya comunica la secuencia), pero si lo incluyes debe ser una cifra real. `pyramid` y `venn` son fáciles de usar como decoración — antes de ponerlos, confirma que hay una jerarquía o intersección de verdad (criterio final #3 abajo), no solo "quiero un triángulo/tres círculos".

## Ya cubierto por primitivas existentes (no son "chart", no lo fuercen a serlo)

- **Proceso / flujo secuencial, ciclos** → `process` (`layout: steps`, `alternating` o `gantt`); un ciclo se modela como `steps` que vuelve a nombrar el primer paso al final si hace falta explicitarlo.
- **Antes/después, problema→solución→impacto, input→proceso→output** → `process{layout:steps}` de 3 pasos, o `comparison` de 2 columnas si es un contraste puntual.
- **Roadmap / cronograma con fechas reales** → `process{layout:gantt}`.
- **Comparación cualitativa con estado/alerta** → `comparison` (columnas con `accent`/`badge`/`stats`) o `data.stats[].badge`.
- **Cifras protagonistas (1-4)** → `data.stats`, nunca una tabla para eso.
- **Avance hacia una meta** → `progress` en `data`/`process`.
- **Cifra o frase destacada de ancho completo** → `banner` (`info`/`warning`/`highlight`).

## Todavía sin soporte en el Deck Spec (backlog, no lo inventes en el schema)

Sankey (requiere curvas, sin buen equivalente en formas planas de PowerPoint), small multiples (necesitaría varios `chart` por slide, no encaja en el campo actual), sparklines, escaleras de madurez, árboles de decisión/problema (un árbol causa→problema→consecuencia se puede aproximar con `hierarchy`, pero uno con condiciones reales en las aristas — "Sí"/"No" — no), diagramas de arquitectura/capas, mapas conceptuales (aproximables con `network`, sin distinción formal todavía). Varios de estos **sí existen ya** en el motor de la Infografía (`renderers/html/charts/`, familia `relationship` para Sankey) — si el contenido realmente los necesita, sugiere al usuario un artefacto **Infografía** (`unisabana-infografia`) como pieza complementaria en vez de forzar un diagrama a mano en el deck. Si el usuario insiste en tenerlo dentro del PPTX, dilo explícitamente como limitación actual, no lo simules con formas sueltas fuera de las primitivas documentadas.

## Evitar monotonía

No repitas la misma composición (título + texto + tres tarjetas) diapositiva tras diapositiva. Alterna entre composición editorial, `chart`, `process`, cifra protagonista, comparación, tabla y fotografía según lo que el contenido realmente pida — la variedad responde al contenido, nunca es arbitraria.

## Antes de cerrar cada diapositiva

1. ¿Cuál es la idea principal?
2. ¿Hay una representación visual mejor que el texto?
3. ¿El tipo elegido corresponde a la estructura real de la información?
4. ¿Ayuda a comprender o solo decora?
5. ¿Puede simplificarse (menos categorías, menos series)?
6. ¿Respeta la paleta/tipografía institucional (nunca colores libres, nunca 3D, nunca degradados decorativos)?
