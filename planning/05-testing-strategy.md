# 05 — Estrategia de pruebas

## Pruebas estructurales

- **Validez de esquema.** Todo Deck Spec generado debe validar contra `core/schemas/deck-spec.schema.json` (ajv u otro validador JSON Schema). Prueba negativa obligatoria: un Deck Spec con un campo requerido faltante debe fallar con un mensaje claro, no silenciosamente.
- **Propiedades obligatorias.** Cada slide tiene `type` (enum válido), `title` o equivalente; el deck completo tiene `palette` (institucional o `data-faculty` válido) y `density`.
- **Compatibilidad de versiones.** El esquema declara su propia versión (SemVer). Prueba: un Deck Spec con `schemaVersion` de una versión menor anterior debe seguir validando si solo se añadieron campos opcionales (regla de evolución sin romper compatibilidad definida en Hito 4).
- **Componentes existentes.** Cualquier referencia a un componente (`Button`, `Card`, `Stat`, etc.) dentro de un Deck Spec debe existir en `core/components/index.ts`.
- **Paletas válidas.** `palette`/`data-faculty` debe ser uno de los valores en `core/brand/rules/palette.json` — ninguno inventado.
- **Tipografías válidas.** Solo Libre Franklin; cualquier `fontFamily` distinto en el Deck Spec es un error estructural, no solo una advertencia de marca.

## Pruebas de marca

Migradas y ampliadas desde el bloque `x-omelette` de `_adherence.oxlintrc.json` y desde `readme.md` §13 (checklist de validación ya definido en el propio design system):

- **Uso del logo**: asset aprobado (whitelist), sin recolor/redraw, variante correcta (positiva/negativa) según fondo.
- **Área de protección**: colisión cero entre el rectángulo protegido del logo y cualquier otro elemento (título, cuerpo, números de página, atribución IA, formas decorativas) — implementando literalmente `expandRect`/`SlideValidation` ya especificado en `readme.md`.
- **Tamaños mínimos**: símbolo del logo ≥22px pantalla / 8mm impreso; cuerpo de texto ≥20px.
- **Tipografía**: familia única, pesos dentro del rango permitido.
- **Contraste**: logo positivo solo sobre fondo claro, negativo solo sobre fondo oscuro/foto (umbral de luminancia ya definido en `readme.md` §6); contraste texto/fondo por encima de un umbral WCAG razonable.
- **Márgenes**: `--slide-safe-*` respetados; ningún contenido fuera del área segura salvo fotografía full-bleed (única excepción documentada).
- **Densidad**: `maxPrimaryIdeas`, `maxSupportingBlocks`, `maxColumns`, `maxCardCount`, etc. (valores ya definidos en `readme.md` §10) no excedidos.
- **Uso de imágenes**: toda imagen referenciada proviene de la whitelist de `core/brand/rules/imagery.json`; ninguna ruta fuera de esa lista.
- **Declaración de IA**: atribución presente, tamaño/posición/color correctos, separación mínima del logo institucional respetada.

## Pruebas visuales

- **Overflows**: ningún elemento de texto o imagen se recorta o desborda del canvas 1280×720.
- **Superposiciones**: ningún par de elementos no relacionados se solapa (además de la colisión específica del logo, arriba).
- **Elementos fuera del canvas**: ninguna coordenada negativa ni mayor al tamaño del slide tras el paso de flatten.
- **Desalineaciones**: elementos que deberían compartir línea base/columna de grilla realmente la comparten (tolerancia de pocos px).
- **Comparación contra presentaciones de referencia (golden decks)**: al menos un deck de referencia por familia de slide se congela como snapshot; un cambio en el renderer que altere visualmente un golden deck sin justificación requiere actualización explícita del snapshot (no un fallo silencioso, no una actualización automática).
- Mecanismo recomendado: captura de pantalla determinista del HTML renderizado (headless browser) comparada pixel-a-pixel contra el snapshot congelado, con una tolerancia de diferencia configurable. Ver decisión D-18 en `07-decisions-and-open-questions.md` sobre si un navegador headless es necesario para el MVP o se difiere.

## Evaluaciones de agente (evals)

Prompts representativos a ejecutar contra la skill `create`/`review`, con la rúbrica de abajo:

1. Crear una presentación ejecutiva (caso de uso base).
2. Crear una presentación técnica de alta densidad.
3. Transformar un documento extenso (Markdown largo) en un Deck Spec coherente.
4. Revisar una presentación existente y detectar incumplimientos introducidos deliberadamente (golden deck negativo).
5. Usar una paleta de facultad y confirmar que no se mezcla con la institucional.
6. Confirmar que el agente nunca solicita ni genera fotografías de personas/campus sintéticas, incluso si el usuario lo pide explícitamente (debe explicar la restricción y ofrecer alternativas dentro de la whitelist).
7. Reducir una presentación demasiado densa (dividir en más slides, nunca encoger el texto por debajo de 20px).
8. Mantener datos y citas exactas del contenido fuente sin alterarlos al reformular.
9. Declarar el uso de IA correctamente en todos los slides generados.

### Rúbrica de evaluación (0–2 por criterio; 0 = falla, 1 = parcial, 2 = cumple)

| Criterio | Qué mide |
|---|---|
| Fidelidad institucional | Paleta, logo, tipografía, atribución IA correctos y sin mezclar |
| Calidad narrativa | Títulos orientados a conclusión, jerarquía de un mensaje por slide |
| Legibilidad | Tamaños mínimos, contraste, densidad dentro de límites |
| Exactitud | Datos/citas del contenido fuente preservados sin alteración |
| Selección de layout | El tipo de slide elegido corresponde al contenido (comparación→comparación, no todo a "contenido genérico") |
| Uso correcto de activos | Solo activos de la whitelist, ninguna imagen inventada |
| Cumplimiento de restricciones | Ninguna regla de `core/brand/rules` violada (correlato directo con el reporte del validador — el eval no debería nunca reportar mejor que el validador determinista) |
| Calidad del artefacto generado | El HTML abre, es válido, no tiene errores de render |

Un eval con `error` en el validador determinista debe puntuar 0 automáticamente en "Cumplimiento de restricciones", independientemente de cualquier juicio cualitativo — el validador es la fuente de verdad, el juicio de un evaluador humano/LLM es complementario, no sustituto.

## Pruebas de instalación

- Instalación local del plugin de desarrollo en Claude Code sin errores (Hito 3).
- Verificación de que ninguna ruta interna del plugin apunta fuera de su propio árbol tras copiarse a la caché de plugins (prueba específica para la brecha G-02).
- Repetir en Codex cuando ese adaptador exista.

## Golden decks

- Al menos un golden deck **positivo** completo (8–10 slides, pasa todas las validaciones) como referencia de "esto es correcto".
- Al menos un golden deck **negativo** por regla crítica (paleta mezclada, logo sub-mínimo, atribución IA ausente, densidad excedida, imagen fuera de whitelist) — cada uno debe producir exactamente el error esperado, ni más ni menos.
- Los golden decks viven en `tests/golden-decks/` y se versionan junto con el esquema del Deck Spec.

## Criterios de aprobación (para considerar una versión lista para el siguiente hito)

- 100% de pruebas estructurales y de marca en verde antes de avanzar del Hito 6 al Hito 7.
- Pruebas visuales sin regresiones no explicadas en los golden decks positivos.
- Evals con puntaje ≥1 en todos los criterios de la rúbrica para los 9 prompts representativos, y 2 obligatorio en "Cumplimiento de restricciones" y "Uso correcto de activos" (no negociable, son las reglas de preservación institucional del principio 3.6).
- Pruebas de instalación exitosas en cada plataforma antes de considerar un Hito 3/8 completo.
