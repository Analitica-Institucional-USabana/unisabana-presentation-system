# 04 — Definición del MVP

## Alcance

El MVP demuestra el ciclo completo **crear → validar → renderizar → revisar**, para una universidad, con una audiencia y densidad configurables, en un único formato de salida (HTML autocontenido), instalable localmente como plugin en al menos Claude Code.

Corresponde a los Hitos 0–6 del roadmap (`03-migration-roadmap.md`). No incluye PPTX, no incluye marketplace público, no incluye MCP.

## Fuera de alcance (explícito)

- Generación de `.pptx`.
- Publicación en un marketplace público o multi-institucional.
- Soporte Codex probado end-to-end (se diseña portable desde el día 1, pero la validación real en Codex puede quedar como tarea de verificación posterior al MVP si el tiempo apremia — no es lo mismo "diseñado para portabilidad" que "verificado en la segunda plataforma").
- Revisión de presentaciones de terceros ajenas al sistema (PPTX/HTML no generados por este pipeline) — la skill `review` en el MVP se valida contra decks producidos por el propio sistema; revisar artefactos externos arbitrarios es una capacidad de madurez posterior.
- Integraciones con sistemas externos (repositorios de activos, aprobación de marca vía workflow).
- Cualquier decisión de licenciamiento/publicación pública (son preguntas institucionales, no bloqueantes para el MVP interno).

## Casos de uso cubiertos

1. "Crea una presentación ejecutiva de 8 diapositivas sobre resultados 2025 para el Consejo Directivo, paleta institucional."
2. "Crea una presentación técnica para la Facultad de Ingeniería sobre un proyecto de investigación, densidad alta, paleta de facultad."
3. "Revisa esta presentación (generada por el sistema) y dime si cumple las reglas de marca."
4. "Reduce esta presentación porque tiene demasiado texto por diapositiva."

## Flujo principal

```
Usuario (Claude Code) → invoca skill `create` con lenguaje natural + parámetros
   → agente produce Deck Spec (YAML)
   → validators/ valida estructura (JSON Schema) + marca (core/brand/rules)
   → si falla: agente ajusta el Deck Spec y reintenta (loop acotado, no infinito)
   → si pasa: renderers/html/ produce HTML autocontenido + reporte de validación
   → usuario revisa el HTML
   → (opcional) usuario invoca skill `review` sobre el HTML resultante para una segunda verificación independiente
```

## Entradas

- Texto/instrucción en lenguaje natural (obligatorio).
- Parámetros: audiencia (ejecutiva/académica/técnica), facultad/unidad (opcional — activa `data-faculty`), densidad (ejecutiva/técnica), número aproximado de diapositivas.
- Contenido fuente opcional (Markdown/texto largo a transformar en Deck Spec — capacidad de "transformar un documento extenso" mencionada en el enunciado, cubierta como parte de la skill `create`, no como skill separada).

## Salidas

- **Deck Spec** (`.yaml`) — el artefacto intermedio, siempre generado y persistido (no descartado), para poder re-renderizar o re-validar sin repetir la fase creativa.
- **Presentación HTML autocontenida** (`.html`), abre sin conexión, incluye la atribución IA obligatoria y el logo institucional según reglas.
- **Reporte de validación** (estructura `SlideValidation`/deck-level, con niveles `error`/`warning`/`pass`).
- Archivos auxiliares: ninguno adicional en el MVP (activos ya embebidos en el HTML).

## Componentes mínimos

- `core/brand/tokens.json` + `core/brand/rules/*.json` (Hito 1).
- `core/components/` (los 7 componentes existentes, sin cambios funcionales).
- `core/schemas/deck-spec.schema.json` cubriendo como mínimo las 8–10 familias de slide ya existentes en `slides/` (cover, agenda, separador, contenido, cifras, cita, comparación, photo-cover, cierre, dashboard) — **cumple el rango "6 a 10 layouts" pedido**, usando los que ya están validados visualmente contra la plantilla oficial.
- `renderers/html/` con un layout por tipo de slide.
- `validators/` con las reglas críticas: paleta permitida y no-mezcla, tamaño mínimo y clear space del logo, atribución IA presente y separada, densidad/límites de contenido, tipografía única.

## Skills mínimas

- `skills/create/SKILL.md` — crea, y si el contenido no cabe, decide dividir en más diapositivas (nunca reduce el body por debajo de 20px, según regla ya documentada).
- `skills/review/SKILL.md` — recibe un Deck Spec o un HTML generado por el sistema y devuelve el reporte de validación, sin regenerar contenido.

Ambas comparten `core/brand/` dentro del mismo paquete de plugin (sin rutas externas).

## Instalación

- Instalación local mediante plugin en Claude Code, usando un **marketplace de desarrollo** (`.claude-plugin/marketplace.json` apuntando al propio repo local o a una rama, per `/plugin marketplace add <ruta>`).
- No se requiere ningún marketplace público ni institucional para completar el MVP.

## Pruebas de humo (mínimas para considerar el MVP "funciona")

1. Instalar el plugin localmente sin errores.
2. Invocar `create` con el caso de uso 1 (ejecutiva) → obtener Deck Spec válido + HTML + reporte `pass`.
3. Invocar `create` con una paleta de facultad → confirmar que `data-faculty` se aplica y no se mezcla con la institucional.
4. Invocar `review` sobre el HTML del punto 2 → mismo resultado de validación que en la generación original (determinismo).
5. Forzar una violación conocida (ej. reducir manualmente el logo por debajo del mínimo en un Deck Spec de prueba) → el validador debe marcar `error` y bloquear el export, tal como especifica `readme.md` §13–14.

## Presentación de referencia

Una presentación ejecutiva completa (8–10 diapositivas, paleta institucional, generada end-to-end) se conserva como **golden deck** de referencia para pruebas de regresión visual (ver `05-testing-strategy.md`).

## Criterios de éxito del MVP

- El ciclo crear→validar→renderizar→revisar funciona de punta a punta sin intervención manual en el código.
- Ningún archivo de `claude-design-system/` fue modificado para lograrlo (todo vive en `core/`, `skills/`, `validators/`, `renderers/`, `adapters/`).
- El reporte de validación es consistente entre una generación y una revisión posterior del mismo artefacto (determinismo, no dependiente del modelo).
- El HTML resultante pasa una inspección visual manual de fidelidad frente a `readme.md` y a los ejemplos de `slides/` (aun sabiendo que `slides/` mismos no están flatten — el criterio es fidelidad de *layout y marca*, no copia literal de esos archivos).

## Demostración objetivo

Grabación o walkthrough en vivo: instalar el plugin de desarrollo → pedir una presentación ejecutiva → mostrar el Deck Spec generado → mostrar el reporte de validación en verde → abrir el HTML resultante sin conexión a internet → pedir una revisión de esa misma presentación y mostrar que el resultado es idéntico.

## ¿Es adecuado este alcance o debería reducirse?

Se considera adecuado tal como está: cubre las 10 capacidades mínimas descritas en el enunciado para el MVP (Deck Spec, HTML autocontenido, reporte de validación, archivos auxiliares, skill create, skill review, 6–10 layouts, tokens canónicos, reglas de marca, validador básico, instalación local, marketplace de desarrollo, pruebas de humo, presentación de referencia) sin añadir PPTX ni marketplace público, que son las dos fuentes de mayor incertidumbre técnica/institucional (ver Hitos 7–8). Si el tiempo disponible es muy limitado, el primer recorte candidato sería reducir la cobertura de layouts de 10 a 6 (los más usados: cover, agenda, separador, contenido, cifras, cierre) y diferir cita/comparación/photo-cover/dashboard a una iteración siguiente dentro del mismo MVP — no se recomienda recortar la validación de marca, porque es el diferenciador central del proyecto frente a "solo generar HTML bonito".
