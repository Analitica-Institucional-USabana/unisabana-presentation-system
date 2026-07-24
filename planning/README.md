# Planeación — Sistema de presentaciones institucional de Universidad de La Sabana

Este directorio contiene el análisis y la hoja de ruta para transformar `claude-design-system/` (un bundle generado por Claude Design) en un sistema de presentaciones institucional interoperable, versionable e instalable como plugin/skill en Claude Code, Codex y otros agentes compatibles con el estándar abierto [Agent Skills](https://agentskills.io).

**Estado de esta fase:** solo análisis y documentación. `claude-design-system/` no fue modificado. No existe todavía ningún `plugin.json`, `marketplace.json`, renderer, validador ni script funcional — eso corresponde a las fases de implementación descritas en `03-migration-roadmap.md`.

## Índice

1. **[00-current-state-inventory.md](00-current-state-inventory.md)** — Qué hay realmente en `claude-design-system/`, archivo por archivo: qué es humano vs. generado, qué es reutilizable directamente, qué es herramienta interna de Claude Design, y los riesgos/dudas detectados (carpeta `assets/campus/` duplicada, contradicción entre `CLAUDE.md` y el estado real de `slides/`, procedencia de algunos activos).
2. **[01-gap-analysis.md](01-gap-analysis.md)** — 22 brechas concretas (distribución, manifiestos, skills, arquitectura, tokens, esquemas, validación, seguridad, gobernanza, etc.) con prioridad, riesgo y propuesta, más una matriz de trazabilidad regla→archivo actual→forma futura→consumidores→validación.
3. **[02-target-architecture.md](02-target-architecture.md)** — Arquitectura objetivo: capas (fuentes originales → núcleo canónico de marca → skills → Deck Spec → validadores → renderers → adaptadores de plataforma → marketplace), árbol de directorios propuesto, y por qué el núcleo se comparte pero el empaquetado de plugin/marketplace no es portable entre Claude Code y Codex.
4. **[03-migration-roadmap.md](03-migration-roadmap.md)** — Hitos 0 a 10, cada uno con objetivo, tareas, entregables, criterios de aceptación, dependencias, riesgo y talla relativa (XS–XL).
5. **[04-mvp-definition.md](04-mvp-definition.md)** — Alcance concreto y comprobable del MVP: crear → validar → renderizar (HTML autocontenido) → revisar, con dos skills mínimas y 6–10 layouts institucionales ya existentes como base.
6. **[05-testing-strategy.md](05-testing-strategy.md)** — Pruebas estructurales, de marca, visuales y evaluaciones de agente, con una rúbrica de calificación y golden decks (positivos y negativos).
7. **[06-security-and-governance.md](06-security-and-governance.md)** — Riesgos de instalar plugins/skills de terceros, prompt injection, procedencia/licencia de activos, política de red, reproducibilidad de build, y la brecha confirmada de que ninguna plataforma ofrece hoy firma/checksum de plugins.
8. **[07-decisions-and-open-questions.md](07-decisions-and-open-questions.md)** — Registro tipo ADR de las 20 decisiones técnicas del enunciado, más preguntas explícitas pendientes de validación institucional, de marca, de tecnología y de usuarios finales.
9. **[08-visual-quality-and-layout-fixes.md](08-visual-quality-and-layout-fixes.md)** — Post-MVP (Hitos 0–7 completos): backlog de corrección de calidad visual del renderer HTML/PPTX a partir de una prueba real del usuario — bug sistémico de superposición de texto (títulos largos envuelven a varias líneas y el layout no lo contempla), y mejoras de diseño pendientes (foto de portada por defecto, motivo de marca `brand-wave.svg` sin usar, aprovechamiento de espacio, gradientes). **Aplicado.**
10. **[09-visual-richness-and-content-density.md](09-visual-richness-and-content-density.md)** — Siguiente capa post-`08`: comparación contra un deck real hecho directamente en Claude Design (`ejemplo-presentacion.pdf`) que expone el vocabulario visual que nuestro Deck Spec/renderer todavía no sabe producir — banners de énfasis, tarjetas de comparación con estado/alerta, timeline tipo Gantt, proceso alternado con íconos, grids de tarjetas, fondos tintados — y la pregunta de marca bloqueante sobre iconografía (Lucide sin confirmar, D-Q6, resuelta pragmáticamente vía vendorización local marcada como no aprobada por marca). **Las 8 primitivas del backlog están aplicadas** (schema, validadores, ambos renderers, skill, fixture) — pendiente confirmación visual final del usuario contra `ejemplo-presentacion.pdf` y, eventualmente, la respuesta institucional a D-Q6.

## Resumen del objetivo

Convertir un design system que hoy solo existe dentro del entorno de autoría de Claude Design en un producto con:
- Un **núcleo canónico único** de marca (tokens, paletas, reglas de logo, densidad, tipografía) del que todo lo demás se deriva — nunca duplicado a mano por plataforma.
- Una **representación intermedia** (Deck Spec, YAML validado con JSON Schema) que separa lo que decide el agente (narrativa, layout, jerarquía) de lo que exige el sistema determinista (cumplimiento de marca).
- **Dos skills** (`create`, `review`) portables sin cambios entre Claude Code y Codex, siguiendo el estándar abierto Agent Skills.
- **Adaptadores de plataforma separados** para el empaquetado como plugin instalable, porque Claude Code y Codex usan esquemas de plugin/marketplace incompatibles entre sí (verificado contra documentación oficial de ambos).
- Renderizado inicial a **HTML autocontenido**, con PPTX y otros adaptadores diferidos a fases posteriores tras una prueba de concepto explícita.
