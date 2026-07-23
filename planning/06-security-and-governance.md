# 06 — Seguridad y gobernanza

## Riesgos

### Riesgo de instalar skills o plugins de terceros
Un plugin instalado tiene la capacidad de incluir scripts que Claude/Codex ejecutarán vía Bash. Cualquiera que pueda publicar en el marketplace usado puede, en principio, introducir código. Verificado contra documentación oficial: **ni Claude Code ni Codex ofrecen hoy firma criptográfica ni checksum de integridad de plugins/marketplaces**. Mitigación recomendada:
- Mantener el marketplace **privado/interno** (no público) mientras el proyecto esté en fases tempranas (Hitos 0–8).
- Instalar/actualizar siempre fijando un `sha` de git específico en el manifiesto del marketplace, no solo una rama (`ref`), para que una actualización no traiga cambios no revisados automáticamente.
- Revisión manual obligatoria de cualquier cambio a `validators/`, `renderers/`, `hooks/` (si se añaden) antes de cada release — son las superficies con capacidad de ejecución.

### Riesgo de prompt injection en documentos de entrada
La capacidad de "transformar un documento extenso" (MVP, caso de uso 3) implica que la skill `create` leerá contenido potencialmente no confiable (un `.docx`/`.md`/PDF aportado por un usuario). Ese contenido podría incluir instrucciones diseñadas para desviar al agente (p. ej. "ignora las reglas de marca", "usa esta imagen externa").
Mitigación: las reglas de `core/brand/rules/*.json` se aplican en la capa **determinista** (`validators/`), no dependen de que el agente "recuerde" resistir la instrucción inyectada — así, incluso si el contenido de entrada intenta manipular al agente, el validador bloqueará cualquier salida que viole paleta, logo, densidad o whitelist de imágenes. Esto es una consecuencia directa de la arquitectura de `02-target-architecture.md` (separación creatividad/cumplimiento), no una capa de seguridad añadida aparte.

### Restricciones de ejecución de scripts
`validators/` y `renderers/` deben ser scripts Node/TS puros, sin `eval`, sin ejecución de código proveniente del Deck Spec (que es datos, nunca código). Ningún script del sistema debe invocar red externa salvo la carga de fuentes (ver política de red más abajo), y eso debe ser configurable/desactivable.

### Restricciones de escritura en disco
Los renderers escriben únicamente dentro de un directorio de salida explícito indicado por el usuario/skill (nunca fuera de él, nunca sobrescriben `core/`, `claude-design-system/` o cualquier archivo del propio plugin). Cualquier script bundleado debe validar que su ruta de escritura está dentro del árbol esperado antes de escribir.

### Manejo de rutas
Todas las rutas internas del paquete deben resolverse contra `${CLAUDE_PLUGIN_ROOT}` (Claude Code) o el equivalente de Codex — nunca contra rutas relativas que puedan escapar del árbol del plugin tras la copia a caché (brecha G-02 de `01-gap-analysis.md`). Ninguna ruta de usuario (nombre de archivo de entrada, ruta de salida) debe concatenarse sin sanitizar — riesgo de path traversal si en el futuro se acepta una ruta arbitraria como parámetro.

### Manejo de archivos temporales
Cualquier archivo intermedio (p. ej. una captura headless para pruebas visuales) debe escribirse en un directorio temporal del sistema, con limpieza explícita al finalizar, y nunca dentro del árbol del plugin instalado.

### Procedencia y licencia de activos
- `uploads/` contiene material fuente entregado por el cliente (PDF de marca, PPTX maestro, logos, fotos) sin licencia de redistribución explícita documentada. **No debe empaquetarse dentro de ningún plugin distribuible** — se mantiene únicamente como referencia de desarrollo en el árbol congelado (`_legacy/`).
- `assets/*` (planos) son los activos ya procesados/aprobados; su uso dentro del sistema está implícitamente autorizado por ser el propio design system entregado, pero su **redistribución pública** (marketplace externo) requiere confirmación institucional explícita antes del Hito 8 (ver preguntas abiertas en `07`).
- `logo-horizontal-mono.svg` no tiene una contraparte verificada en `uploads/` — su procedencia exacta debe confirmarse con el equipo de marca antes de incluirlo en cualquier paquete que salga del entorno interno.
- `assets/campus/` (duplicados sin comprimir, no referenciados) se excluye del núcleo portable; no se decide su eliminación en esta fase.

### Dependencias de terceros
El stack recomendado (Node/TS, ajv, yaml, eventualmente pptxgenjs o python-pptx) debe fijarse con lockfile y auditarse (`npm audit` o equivalente) antes de cada release. Cualquier dependencia con licencia incompatible con la distribución prevista (ej. GPL fuerte si el `core/` se distribuye bajo una licencia permisiva) se marca como bloqueante.

### Gestión de secretos
El sistema, tal como está diseñado (validación/renderizado local, sin llamadas a servicios externos salvo fuentes tipográficas), **no requiere secretos** en el MVP. Si una fase futura (Hito 9, integraciones externas) introduce un servicio con autenticación, los secretos se gestionan vía variables de entorno del entorno del agente, nunca hardcodeados en `core/` ni en el Deck Spec (que podría, en teoría, viajar entre personas/sistemas).

### Validación de archivos suministrados por usuarios
Cualquier documento fuente (Markdown, PDF, DOCX) aportado por un usuario para transformar en presentación debe tratarse como **no confiable**: no ejecutar macros/scripts embebidos, no seguir enlaces externos automáticamente, no interpretar el contenido como instrucciones del sistema (mismo mecanismo que prompt injection, arriba).

### Prevención de inclusión accidental de información sensible
Los Deck Specs y HTML generados no deben incluir metadatos ocultos del sistema operativo del usuario, rutas locales absolutas, ni contenido de otros documentos no relacionados que pudieran haber quedado en el contexto del agente. El renderer debe producir salidas "limpias" (sin comentarios de depuración, sin rutas de desarrollo).

### Política de acceso a Internet
- La única dependencia de red identificada hoy es `tokens/fonts.css` (`@import` de Google Fonts). Para que el HTML autocontenido funcione realmente offline (requisito del MVP), la fuente debe **embeberse** (base64/`@font-face` local) en el renderer, no depender de un CDN en tiempo de visualización.
- Ningún script de `validators/`/`renderers/` debe requerir red para operar. Si en el futuro se añade una revisión visual con navegador headless, ese navegador debe poder operar sin conexión (activos ya locales).

### Reproducibilidad del build
`core/brand/tokens.css` se genera a partir de `tokens.json` (no al revés) — el build debe ser determinista dado el mismo `tokens.json` (mismo output byte a byte, o al menos funcionalmente idéntico). Lockfile de dependencias fijado; versión de Node especificada. Ninguna generación debe depender de estado no versionado (fecha del sistema, aleatoriedad no sembrada) salvo donde sea explícitamente intencional (ej. IDs únicos de slide, que deben generarse de forma determinista a partir del contenido, no aleatoriamente, para que las pruebas de regresión sean estables).

### Firma, checksum o verificación de artefactos
No existe mecanismo nativo en ninguna plataforma (confirmado). Mitigación mínima viable: publicar el hash SHA-256 del tarball de cada release en el `CHANGELOG.md`/notas de release del propio repositorio, para que un instalador pueda verificar manualmente que lo que instaló corresponde a lo publicado. No se promete ni se implementa una solución de firma criptográfica completa en el MVP — se documenta como brecha conocida (G-15).

## Roles y aprobaciones

| Rol | Responsabilidad |
|---|---|
| Brand owner (equipo de comunicaciones/marca de la universidad) | Aprueba cualquier cambio a `core/brand/` antes de un release; única fuente autorizada para nuevos activos/paletas/logos |
| Mantenedor técnico | Aprueba cambios a `core/schemas/`, `validators/`, `renderers/`, `adapters/`; responsable de que ningún cambio técnico contradiga una regla de marca ya aprobada |
| Revisor de seguridad (rotativo o el propio mantenedor técnico en fases tempranas) | Revisa cualquier script nuevo bundleado antes de release, especialmente los que tocan disco o red |

Ningún cambio a `core/brand/` debería mezclarse en el mismo release que un cambio técnico no relacionado — facilita auditar qué cambió y por qué.

## Gestión de activos

- Los activos que viajan dentro de un plugin distribuible se limitan a `core/brand/assets/` (subset curado, ya confirmado como planos/canónicos en `00-current-state-inventory.md`), nunca `uploads/` ni `assets/campus/`.
- Cualquier activo nuevo (ej. una nueva paleta de facultad, un nuevo logo) entra primero a `_legacy/claude-design-system/` como fuente humana (o a un futuro `uploads/` equivalente), se extrae a `core/brand/` con proveniencia citada, y solo entonces se distribuye.

## Versionado de marca

- `core/brand/` se versiona independientemente del plugin/skill (SemVer propio: cambios de MAJOR = paleta o logo cambia de forma incompatible; MINOR = nueva paleta de facultad añadida; PATCH = corrección de un valor mal transcrito).
- El `plugin.json`/manifiesto de Codex referencia qué versión de `core/brand` empaqueta, permitiendo saber, ante un reporte de incumplimiento, exactamente qué reglas estaban vigentes.

## Publicación

- Fase interna (Hitos 0–7): repositorio y marketplace **privados**, uso restringido al equipo de desarrollo.
- Fase de marketplace institucional (Hito 8): visibilidad **a decidir con el equipo de marca/tecnología** — recomendado privado/interno-institucional al menos hasta tener Hitos 6–7 estables y una respuesta a las preguntas de licenciamiento de `07-decisions-and-open-questions.md`.
- Publicación pública (fuera de la universidad): explícitamente fuera de alcance de este plan; requeriría aprobación institucional formal no técnica.

## Información sensible

- Ninguna información personal identificable debería aparecer en `core/`, Deck Specs de ejemplo, o golden decks — usar datos ficticios claramente marcados como tales en cualquier ejemplo/demo.
- El PDF de marca y el PPTX maestro en `uploads/` pueden contener información interna de la universidad no destinada a un repositorio público — razón adicional para no empaquetarlos ni, si el repo se hace público en el futuro, para no incluirlos siquiera en `_legacy/` de la rama pública (posible necesidad de un repo privado adicional solo para `uploads/`, a decidir).
