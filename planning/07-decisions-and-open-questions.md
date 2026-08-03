# 07 — Decisiones y preguntas abiertas

Formato tipo ADR: Decisión · Estado · Contexto · Alternativas · Recomendación · Consecuencias · Información faltante.

## Decisiones recomendadas (con base suficiente para proceder)

### D-01 — Monorepo vs. repositorios separados

**Estado:** recomendada. **Contexto:** el proyecto tiene `core/`, `skills/`, `validators/`, `renderers/`, dos `adapters/` — todos evolucionan juntos en las fases tempranas.
**Alternativas:** (a) monorepo único; (b) repos separados por capa (`unisabana-brand-core`, `unisabana-skills`, `unisabana-claude-plugin`, `unisabana-codex-plugin`).
**Recomendación:** (a) monorepo, al menos hasta el Hito 8. **Motivo:** el volumen de código es pequeño, las capas cambian juntas durante el desarrollo activo, y separar repos ahora obligaría a versionar y sincronizar cross-repo antes de tener una sola versión estable. Reevaluar split cuando exista más de un adaptador de plataforma maduro y contribuidores externos por capa. **Momento:** decisión vigente desde Hito 0; revisar en Hito 8.

### D-02 — Un plugin único vs. varios plugins

**Estado:** recomendada. **Alternativas:** (a) un plugin `unisabana-presentations` que incluye ambas skills; (b) plugins separados `unisabana-brand` (solo reglas/lectura) y `unisabana-presentations` (creación/revisión).
**Recomendación:** (a) un plugin único para el MVP. **Motivo:** ambas skills comparten el mismo `core/brand/` y el mismo ciclo de vida de versión; separar plugins solo tiene sentido si se anticipa que otro producto (no presentaciones) querrá consumir `core/brand/` de forma independiente — no hay evidencia de esa necesidad hoy. **Momento:** Hito 3; reevaluar si aparece un segundo consumidor de `core/brand/` fuera de presentaciones.

### D-03 — Una skill grande vs. varias especializadas

**Estado:** recomendada. **Recomendación:** dos skills (`create`, `review`), no una sola ni tres o más. **Motivo:** dos responsabilidades claramente distintas (generar vs. auditar) que además mapean 1:1 al principio de separación creatividad/cumplimiento; fragmentar más (p. ej. una skill por tipo de slide) añadiría complejidad de mantenimiento sin beneficio de contexto, ya que el "progressive disclosure" dentro de una skill ya resuelve el problema de cargar solo lo necesario. **Momento:** Hito 2.

### D-04 — YAML vs. JSON para el Deck Spec

**Estado:** recomendada. **Recomendación:** YAML como formato de autoría, JSON Schema como contrato de validación (se parsea YAML→JSON internamente). **Motivo:** mejor legibilidad para humanos y para el propio agente al redactar/depurar; coincide con el ejemplo ya usado en el enunciado del usuario; JSON Schema es el estándar de validación independientemente del formato de serialización elegido. **Desventaja aceptada:** YAML tiene más ambigüedades de parseo que JSON (tipos implícitos, indentación) — mitigado exigiendo un parser estricto y validación inmediata contra el esquema. **Momento:** Hito 4.

### D-05 — TypeScript, Python o ambos

**Estado:** recomendada, con puerta abierta documentada. **Recomendación:** TypeScript/Node como núcleo único para el MVP (componentes, validador, renderer HTML, CLI). No introducir Python hasta el Hito 7 (PPTX), y solo si la prueba de concepto muestra que `python-pptx` aporta fidelidad significativamente mayor que `pptxgenjs`. **Motivo:** evitar fragmentar el toolchain sin necesidad comprobada; los componentes ya son React/JSX, por lo que Node es la ruta de menor fricción. **Consecuencia de introducir Python después:** el `renderer/pptx` sería un proceso separado invocado por el CLI/skill, no una dependencia del resto del sistema — aislable sin contaminar el núcleo TS. **Momento:** decidir definitivamente en Hito 7, no antes.

### D-06 — Renderer HTML inicial

**Estado:** recomendada. **Recomendación:** HTML autocontenido (CSS y activos embebidos), generado directamente por un renderer TS a partir del Deck Spec — no reutilizar `slides/*.html` como plantilla copiable (no están flatten, referencian CSS externo). **Momento:** Hito 5.

### D-07 — Estrategia para PPTX editable

**Estado:** pendiente de prueba de concepto, con recomendación condicional. **Alternativas:** `pptxgenjs` (Node, mismo stack, comunidad más pequeña) vs. `python-pptx` (Python, más maduro, mejor soporte de layouts complejos y plantillas base). **Recomendación:** iniciar la POC con `pptxgenjs` por continuidad de stack; si la fidelidad frente a `uploads/AF-PLANTILLA PPT GENERA-3.pptx` resulta insuficiente, evaluar `python-pptx` como proceso aislado. **Momento:** Hito 7, no antes — no se compromete la decisión ahora.

### D-08 — Uso de plantillas PPTX existentes

**Estado:** pendiente de confirmación de licencia (ver preguntas institucionales abajo). **Recomendación técnica, condicionada:** si se autoriza, usar `uploads/AF-PLANTILLA PPT GENERA-3.pptx` como plantilla base (`python-pptx`/`pptxgenjs` pueden partir de un `.pptx` existente y reemplazar placeholders) en vez de reconstruir el layout desde cero — mayor fidelidad, menor esfuerzo. **Momento:** Hito 7, bloqueado por D-Q1 (pregunta abierta).

### D-09 — Uso de componentes HTML/React existentes

**Estado:** recomendada. **Recomendación:** sí, reutilizar `components/**/*.jsx` casi sin cambios dentro de `core/components/`, generando el HTML final por composición de estos componentes (server-side render simple, sin necesidad de un framework completo) en vez de reescribir el markup a mano en el renderer. **Momento:** Hito 1 (extracción), Hito 5 (uso en renderer).

### D-10 — Tokens en JSON, CSS variables, o ambos

**Estado:** recomendada. **Recomendación:** ambos, con **JSON como fuente única** y CSS generado como proyección. **Motivo:** JSON es consumible por cualquier renderer (HTML, futuro PPTX); CSS variables siguen siendo necesarias para que `core/components/**/*.jsx` funcione sin reescritura. **Momento:** Hito 1.

### D-11 — Inclusión o exclusión de logos y activos en el repositorio

**Estado:** parcialmente recomendada, parcialmente pendiente. **Recomendación:** incluir `core/brand/assets/` (subset curado, planos, ya canónicos) en el repositorio de desarrollo; **excluir siempre** `uploads/` de cualquier paquete distribuible; decidir con el equipo de marca si el repo completo (incluyendo `core/brand/assets/`) puede ser público en el futuro (D-Q2). **Momento:** Hito 1 (repo interno), Hito 8 (decisión de visibilidad).

### D-12 — Tratamiento de archivos generados por Claude Design

**Estado:** recomendada. **Recomendación:** `_ds_bundle.js`, `_ds_manifest.json`, `support.js`, `ds-base.js`, `*.dc.html`, `*.card.html`, `thumbnail.html`, `.thumbnail/` permanecen únicamente dentro de `claude-design-system/` (congelado), **nunca se copian a `core/`** ni a ningún adaptador. Son herramienta de autoría de un entorno específico, no parte del producto. **Momento:** Hito 0–1.

### D-13 — Sincronización de adaptadores

**Estado:** recomendada. **Recomendación:** cada adaptador (`adapters/claude-plugin/`, `adapters/codex-plugin/`) se genera/empaqueta desde `core/`, `skills/`, `validators/`, `renderers/` mediante un script de build simple (copia + genera manifiesto), no mediante edición manual duplicada. Un cambio en `core/` se propaga a ambos adaptadores en el mismo release. **Momento:** Hito 3.

### D-14 — Hooks automáticos o ejecución explícita

**Estado:** recomendada. **Recomendación:** ejecución explícita (el usuario invoca la skill) para el MVP; no usar hooks automáticos (p. ej. validar en cada `PostToolUse`) hasta que haya evidencia de que el flujo manual es insuficiente. **Motivo:** los hooks añaden comportamiento implícito difícil de depurar y no están en el spec portable de skills. **Momento:** no antes del Hito 9.

### D-15 — CLI propia o scripts invocados directamente por la skill

**Estado:** recomendada. **Recomendación:** un CLI delgado (`cli/`, ej. `unisabana validate <deck.yaml>`, `unisabana render <deck.yaml>`) que la skill invoca vía Bash, y que **también** sirve para CI y para desarrollo local sin un agente. Evita duplicar lógica entre "lo que hace la skill" y "lo que se prueba en CI". **Momento:** Hito 4–5.

### D-16 — Validación previa o posterior al renderizado

**Estado:** recomendada. **Recomendación:** validación **antes** del renderizado (sobre el Deck Spec) como paso obligatorio, más una validación **posterior** opcional/complementaria sobre el HTML final (para capturar problemas que solo existen en el artefacto renderizado, como colisiones exactas de píxeles). No renderizar nunca un Deck Spec que falló la validación estructural. **Momento:** Hito 4 (previa), Hito 6 (posterior).

### D-17 — Revisión visual automática

**Estado:** parcialmente recomendada. **Recomendación:** sí, pero acotada a comparación contra golden decks (snapshot testing), no a un juicio estético automático general. **Momento:** Hito 6, dependiente de D-18.

### D-18 — Dependencia de navegador headless

**Estado:** RESUELTA (adoptada), ver `planning/11-infografia-artifact-type.md`. **Alternativas:** (a) sin navegador headless — validar solo el HTML/CSS/Deck Spec de forma estática (más simple, no captura problemas de layout real); (b) con navegador headless (Playwright/Puppeteer) para capturas y detección real de overflow/colisión visual. **Decisión:** (b), Playwright — adoptado como dependencia real al construir el export a PDF del artefacto Infografía (`renderers/pdf/render.mjs`), no solo para pruebas visuales como se planteaba originalmente. El binario de Chromium se instala con `PLAYWRIGHT_BROWSERS_PATH=0` (queda dentro de `node_modules/playwright-core/.local-browsers/`) para que `scripts/build-adapters.mjs` lo capture sin cambios y el requisito offline (D-20) se mantenga: nunca se descarga en tiempo de ejecución. **Riesgo aceptado:** dependencia pesada (~300MB con el binario de Chromium) — el usuario confirmó explícitamente aceptar este costo. Queda pendiente, no resuelto aquí: usar este mismo navegador headless para snapshot testing de decks (D-17) es un aprovechamiento futuro, no implementado todavía.

### D-19 — Estrategia para fuentes tipográficas

**Estado:** recomendada. **Recomendación:** embeber Libre Franklin (WOFF2 local) en el HTML autocontenido en vez de depender del `@import` de Google Fonts actual en `tokens/fonts.css` — requisito directo del criterio "abre sin conexión a internet" del MVP. Confirmar licencia de redistribución de la fuente (es de Google Fonts, licencia SIL Open Font License — habitualmente permite embebido, pero se debe confirmar antes de distribuir, ver D-Q3). **Momento:** Hito 5.

### D-20 — Compatibilidad con entornos sin acceso a Internet

**Estado:** recomendada. **Recomendación:** el renderer HTML y el validador deben funcionar 100% offline (activos y fuentes embebidos); el CLI y las skills no deben requerir red salvo para la instalación inicial del plugin. **Momento:** transversal desde Hito 1.

## Decisiones pendientes de validación institucional

- **D-Q1 — ¿Puede el sistema usar `AF-PLANTILLA PPT GENERA-3.pptx` como base programática para el renderer PPTX (Hito 7), o solo como referencia visual de diseño?** Afecta directamente a D-08.
- **D-Q2 — ¿Puede `core/brand/assets/` (logos, fotos de campus procesadas) publicarse en un repositorio con visibilidad ampliada (institucional interna, o eventualmente pública), o deben permanecer siempre en un repositorio privado separado del código?** Afecta a D-11 y al Hito 8.
- **D-Q3 — ¿Existe una licencia de marca formal para la fuente Libre Franklin y para los logos que autorice explícitamente su empaquetado/redistribución dentro de un plugin de software?**
- **D-Q4 — ¿El mapeo paleta↔facultad actual (reconstruido por Claude Design desde la geometría de la diapositiva de paletas del PPTX, marcado como "no obvio" en el propio `readme.md`) está verificado contra una fuente oficial, o requiere validación del equipo de marca antes de considerarse canónico?**
- **D-Q5 — ¿La regla de atribución obligatoria "Diseñado con Claude Design" debe generalizarse a "Diseñado con IA" o mantenerse literal, dado que el sistema ahora podría generarse también desde Codex u otros agentes?** Afecta a `core/brand/rules/ai-disclosure.json` y a la brecha G-16 mencionada indirectamente en `01-gap-analysis.md`.
- **D-Q6 — ¿Existe un icono/set gráfico institucional oficial, o se mantiene la sustitución por Lucide ya señalada como caveat en `readme.md`?**

## Preguntas para el equipo de marca

1. ¿Quién será el "brand owner" designado para aprobar cambios a `core/brand/` (ver `06-security-and-governance.md`, roles)? De momento solo yo, el usuario que estara llevando a cabo el plan
2. ¿Confirmar el origen y la licencia de `logo-horizontal-mono.svg` (sin contraparte en `uploads/`)? El origen es de la guia de marca oficial de la institucion
3. ¿Confirmar el mapeo paleta↔facultad (D-Q4)?
4. ¿Autorizar o no el uso de fotografías de campus procesadas fuera del entorno de autoría de Claude Design, en un plugin instalable? de momento autoricemoslo

## Preguntas para el equipo de tecnología

1. ¿El repositorio de este proyecto debe alojarse en la organización institucional de GitHub/GitLab de la universidad, o en un espacio personal/de equipo temporal durante el desarrollo? esto eventualmente estara en un repositorio oficial de la organizacion, de momento queda en un repositorio privado personal
2. ¿Existe ya una política de gestión de dependencias/auditoría de seguridad de software que este proyecto deba seguir? De momento no
3. ¿Es aceptable introducir Playwright/Puppeteer (navegador headless) como dependencia de desarrollo para pruebas visuales (D-18), dado su tamaño? Dale sin asco

## Preguntas para usuarios finales

1. ¿Qué tan frecuente es la necesidad real de PPTX editable frente a HTML/PDF? (afecta la prioridad relativa del Hito 7). Es demasiado importante que eventualmente sea un ppt editable, pero no lo definas como prioridad ahorita
2. ¿Qué audiencias/densidades son realmente las más usadas hoy (para priorizar qué layouts pulir primero dentro del MVP)? visualmente debe ser acorde a la presentacion de ejemplo
3. ¿Se necesita soporte para más de una facultad/unidad en una misma presentación (hoy explícitamente prohibido: "nunca mezclar paletas"), o la regla de no-mezcla es aceptada sin excepción por los usuarios reales? No veo pq no se podrian mezclar paletas si el usuario asi lo necesita
