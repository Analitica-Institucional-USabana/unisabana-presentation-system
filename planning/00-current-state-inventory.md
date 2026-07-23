# 00 — Inventario del estado actual

> Basado en inspección directa del contenido (no solo nombres de archivo) de `claude-design-system/` realizada el 2026-07-23. Ningún archivo fue modificado para producir este inventario.

## Árbol relevante

```
claude-design-system/
├── SKILL.md                        # frontmatter Agent Skill + instrucciones de uso
├── CLAUDE.md                       # reglas de proyecto (atribución IA, "desagrupar antes de entregar")
├── readme.md                       # fuente normativa humana: voz, color, tipografía, logo, addendum institucional
├── styles.css                      # entry point, solo @import de tokens/*.css
├── _ds_manifest.json               # catálogo generado por Claude Design (componentes, cards, tokens, temas)
├── _ds_bundle.js                   # bundle JS generado (React transpilado) para el runtime de preview
├── _adherence.oxlintrc.json        # config oxlint + bloque "x-omelette" con reglas de marca machine-readable
├── thumbnail.html                  # página fuente del thumbnail de portada del bundle
├── .thumbnail/                     # imagen de preview cacheada (binario, regenerable)
├── assets/
│   ├── logo-horizontal-color.png   # = uploads/LOGO POSITIVO-HORIZONTAL-COLOR (2).png (idéntico en bytes)
│   ├── logo-horizontal-white.png   # = uploads/LOGO NEGATIVO-HORIZONTAL-BLANCO (1).png (idéntico en bytes)
│   ├── logo-horizontal-mono.svg    # derivado, sin contraparte en uploads/
│   ├── brand-wave.svg              # motivo gráfico de esquina (cover/separadores)
│   ├── claude-logo.svg             # = uploads/claude-seeklogo.svg (idéntico en bytes) — atribución IA
│   ├── campus-1.jpg … campus-4.jpg, campus-plaza-balcones.jpg, campus-puente.jpg  # fotografía oficial, plana, en uso real
│   ├── campus-adportas.png, campus-balcones.png, campus-night.png  # extraídas de la plantilla PPT, menor resolución
│   └── campus/                     # CARPETA DUPLICADA — ver hallazgo de riesgo más abajo
│       ├── Campus 2.jpg            # original sin comprimir (27.2 MB) vs campus-2.jpg (6.7 MB) ya procesado
│       ├── plaza-balcones.jpg      # duplicado byte-idéntico en tamaño a assets/campus-plaza-balcones.jpg
│       ├── puente.jpg              # duplicado byte-idéntico en tamaño a assets/campus-puente.jpg
│       └── README.md               # documenta campus-2.jpg como "imagen principal" pero con rutas planas, no las de esta subcarpeta
├── components/
│   ├── brand/{Eyebrow,Logo}.{jsx,d.ts,prompt.md}, brand.card.html
│   ├── core/{Button,Card,Tag}.{jsx,d.ts,prompt.md}, core.card.html
│   └── data/{ProgressBar,Stat}.{jsx,d.ts,prompt.md}, data.card.html
├── guidelines/                     # 14 páginas HTML especimen (color, tipografía, spacing, marca) — solo documentación visual
├── slides/                         # 10 ejemplos HTML (01-cover … 10-dashboard) — catálogo, NO deliverables finales
├── templates/
│   ├── plantilla-institucional/{PlantillaInstitucional.dc.html, ds-base.js, support.js, .thumbnail}
│   └── presentacion/{Presentacion.dc.html, ds-base.js, support.js, .thumbnail}
├── tokens/{colors,typography,spacing,fonts}.css   # NÚCLEO CANÓNICO REAL
└── uploads/                        # originales crudos del cliente (PDF, PPTX, PNGs de logo, fotos), con duplicados por re-subida
```

## Clasificación por elemento

### Fuentes humanas / normativas (máximo valor, mínimo riesgo de reutilizar)

| Ruta | Tipo | Propósito | Dependencias | Reutilización |
|---|---|---|---|---|
| `readme.md` | Markdown | Fuente normativa completa: voz/tono, color, tipografía, logo, addendum institucional (gobernanza de logo, grid, checklist QA) | Cita `uploads/BRAND-GUIDELINES-VF.pdf` y `uploads/AF-PLANTILLA PPT GENERA-3.pptx` como origen | **Reutilizar directamente** como base narrativa de `core/brand/` — es el documento más rico y ya casi tiene la forma de un spec (ver bloques `ts`/`css` embebidos: `BrandAuthority`, `approvedLogoAssets`, `LogoAssetMetadata`, `slideContentLimits`, `SlideValidation`) |
| `CLAUDE.md` | Markdown | Reglas de proyecto específicas de Claude Design: atribución IA obligatoria, flujo "agrupar para construir / desagrupar para entregar" | Ninguna | **Transformar**: la regla de atribución IA es específica del contexto "hecho con Claude Design" y debe re-evaluarse para un producto multiplataforma (¿aplica igual si Codex genera el deck?); la regla de flatten debe convertirse en un paso determinista del renderer, no una instrucción en lenguaje natural |
| `SKILL.md` | Markdown + frontmatter | Definición de Agent Skill actual (`name: unisabana-design`, `user-invocable: true`) | Referencia `readme.md`, `styles.css`, `tokens/`, `assets/`, `components/`, `guidelines/`, `slides/` | **No modificar en esta fase.** Es el punto de partida para las futuras skills `create`/`review`, pero mezcla hoy "crear" y "ser experto en la marca" en un solo skill — brecha de separación de responsabilidades (ver 01-gap-analysis.md) |
| `assets/campus/README.md` | Markdown | Guía de uso de fotografía de campus (imagen principal, alternativas, prohibición de fabricar imágenes) | — | Contenido reutilizable; la carpeta que lo contiene es sospechosa (ver riesgo abajo) |

### Núcleo canónico técnico (portable casi sin cambios)

| Ruta | Tipo | Propósito | Dependencias | Reutilización |
|---|---|---|---|---|
| `tokens/colors.css` | CSS custom properties | Paleta institucional + 13 paletas de facultad vía `[data-faculty="x"]` repuntando `--accent*` | Ninguna (hoja hoja) | **Reutilizar directamente**; extraer también a JSON para consumo no-CSS (validador, renderer PPTX) |
| `tokens/typography.css` | CSS | Libre Franklin, pesos, escala tipográfica, tracking | Ninguna | **Reutilizar directamente**; comentarios `@kind font` son metadata de Claude Design, no rompen nada si se preservan o se limpian |
| `tokens/spacing.css` | CSS | Spacing 4px, radii, shadows, canvas 1280×720, motion | Ninguna | **Reutilizar directamente** |
| `tokens/fonts.css` | CSS | `@import` de Google Fonts para Libre Franklin | Red externa (Google Fonts CDN) | **Reutilizar con nota de riesgo**: un renderer/HTML autocontenido para entornos sin internet necesita la fuente embebida (ver 06-security-and-governance.md, política de red) |
| `styles.css` | CSS | Import list únicamente | Los 4 archivos de `tokens/` | Reutilizar tal cual como entrypoint de desarrollo |
| `components/**/*.jsx` | React real (no DSL propietario) | 7 componentes (Eyebrow, Logo, Button, Card, Tag, ProgressBar, Stat), todos leen tokens vía `var(--...)` | Los tokens CSS | **Reutilizar directamente** en `core/components/`, sin el tooling de Claude Design alrededor |
| `components/**/*.d.ts` | TypeScript ambient declarations | Tipado + metadata `@startingPoint` (propia de Claude Design) | — | Reutilizar, limpiando anotaciones específicas de Claude Design si estorban al build |
| `components/**/*.prompt.md` | Markdown | Documentación de uso/regeneración de cada componente | — | Útil como base de documentación de componente; no es un contrato validable |
| `_adherence.oxlintrc.json` (bloque `x-omelette`) | JSON dentro de config oxlint | **Único lugar con reglas de marca machine-readable**: paletas permitidas, props/enum por componente (`Button.variant`, `Logo.variant`, `Tag.tone`), prohibición de hex/px crudos, clasificación de tokens | Referencia archivos de `components/` y `tokens/` | **Extraer y migrar** a `core/brand/rules/*.json` desacoplado de oxlint (oxlint es una herramienta de lint en tiempo de autoría JSX, no un validador de decks) |

### Herramienta interna de Claude Design (no reutilizable como está, no es deliverable)

| Ruta | Tipo | Propósito | Riesgo de tratarlo como fuente |
|---|---|---|---|
| `_ds_manifest.json` | JSON generado | Catálogo del bundle (componentes, cards, tokens, temas, plantillas) para la UI de Claude Design | Alto si se edita a mano — se regenera; no debe alimentar el Deck Spec directamente |
| `_ds_bundle.js` | JS generado (build) | Concatenación transpilada (`React.createElement`) de `components/**/*.jsx`, expuesta en `window.UniversidadDeLaSabanaDesignSystem_529c5d` | No editar; es un artefacto de preview del entorno Claude Design, sin uso en un pipeline propio |
| `templates/**/ds-base.js` | JS (988 B, idéntico en ambas plantillas) | Inyecta los `<link>` de tokens + `_ds_bundle.js` en la página | Loader legítimo pero acoplado a rutas relativas de Claude Design; no es el mecanismo de carga del producto futuro |
| `templates/**/support.js` | JS generado (64 KB, idéntico en ambas plantillas) | Runtime propio `<x-dc>` de Claude Design ("GENERATED from dc-runtime/src/*.ts — do not edit") | Es infraestructura de autoría/preview de Claude Design, no del design system institucional — **excluir del núcleo portable** |
| `templates/**/*.dc.html` | Formato propietario `.dc.html` | Réplica de la plantilla oficial PPT con placeholders `{{ faculty }}` tipo Mustache | Usa flex/grid (no flatten), formato no estándar — **tratar como referencia visual, no como plantilla de renderer** |
| `components/*/*.card.html`, `thumbnail.html`, `.thumbnail/` | HTML/binario | Harness de previsualización de Claude Design | Sin valor fuera del entorno de autoría; excluir del paquete distribuible |

### Documentación visual (guidelines/, slides/) — referencia, no motor de reglas

| Ruta | Tipo | Propósito | Nota |
|---|---|---|---|
| `guidelines/*.html` (14 archivos) | HTML estático | Especímenes visuales de color/tipografía/spacing/marca | Confirmado: sin JSON-LD ni `data-*` semántico más allá de demos — **documentación, no fuente de reglas ejecutables**. Las reglas reales viven en `readme.md` + `x-omelette` |
| `slides/01-cover.html`…`10-dashboard.html` (10 archivos) | HTML | Ejemplos de las 10 familias de slide del template oficial | **Contradicción detectada**: usan `display:flex`/`display:grid` y `<table>` real, violando la propia regla de `CLAUDE.md` de desagrupar antes de entregar. Son ejemplos de catálogo en construcción — útiles como referencia de layout para el Deck Spec y el renderer HTML, **no copiables tal cual como "deliverable final"** |

### Activos binarios

| Ruta | Tipo | Procedencia | Nota |
|---|---|---|---|
| `assets/logo-horizontal-color.png`, `assets/logo-horizontal-white.png` | PNG | Idénticos en bytes a los PNG en `uploads/` | Activos aprobados, únicos, no regenerar/redibujar nunca |
| `assets/logo-horizontal-mono.svg` | SVG | Sin contraparte en `uploads/` (derivado, probablemente del PDF de marca) | Verificar procedencia exacta con el equipo de marca antes de publicar (ver preguntas abiertas) |
| `assets/claude-logo.svg` | SVG | Idéntico a `uploads/claude-seeklogo.svg` | Vinculado a la regla de atribución IA — su vigencia en un producto multiplataforma debe revisarse (ver 07) |
| `assets/campus-*.jpg/png` (planas) | Fotografía/extracciones | Fotografía oficial procesada, en uso real por `slides/` | Únicas imágenes institucionales aprobadas — nunca generar imágenes de personas/campus sintéticas |
| `uploads/*` | PDF, PPTX, PNG, JPG, SVG | Originales crudos del cliente, con duplicados por re-subida (sufijos hash) | **Fuente de desarrollo únicamente** — no debe empaquetarse en el plugin distribuible (tamaño, formato no runtime, posibles restricciones de licencia del PPTX maestro) |

## Riesgo destacado: `assets/campus/`

Comparación de tamaños confirma que `assets/campus/Campus 2.jpg` (27.2 MB, sin comprimir) y sus pares `plaza-balcones.jpg`/`puente.jpg` son duplicados de mayor peso de archivos ya existentes y optimizados en `assets/campus-*.jpg`. **Ningún** `slide`, `guideline` o `template` referencia `assets/campus/*` directamente. Es candidato a legado/staging intermedio de Claude Design que nunca se limpió. No se toca en esta fase (regla de no modificar el design system), pero se marca como **excluir del núcleo portable y del paquete distribuible** en `02-target-architecture.md`.

## Contradicción interna a resolver (no ocultar)

`CLAUDE.md` exige que todo elemento entregado esté "desagrupado" (`position:absolute` por elemento) antes de handoff. Sin embargo `slides/*.html` y `templates/**/*.dc.html` usan activamente `display:flex`/`display:grid`. Esto confirma que estos archivos son **material de catálogo en construcción**, no plantillas finales, y que el paso de "flatten" nunca ha sido una transformación automática — es una instrucción en lenguaje natural que un agente debe ejecutar manualmente cada vez. Este es precisamente el tipo de regla que la arquitectura objetivo debe convertir en un paso determinista del renderer (ver 02-target-architecture.md, capa de renderizado).

## Archivos generados que NO deben interpretarse como fuente de reglas

`_ds_manifest.json`, `_ds_bundle.js`, `templates/**/support.js`, `.thumbnail/**` — todos regenerables por el propio Claude Design a partir de las fuentes humanas y del código de `components/`. Ninguno debe editarse a mano ni tratarse como el lugar donde "vive" una regla institucional.

## Elementos dudosos / requieren aclaración institucional (ver 07)

- Origen exacto de `logo-horizontal-mono.svg` (no viene de `uploads/`).
- Vigencia de la carpeta `assets/campus/` (duplicado sin usar; ¿se puede eliminar en una fase posterior, con autorización explícita?).
- Licencia de uso del PPTX maestro y del PDF de marca en `uploads/` fuera del entorno de autoría de Claude Design.
- Verificación oficial del mapeo paleta↔facultad, señalado como no-obvio por el propio `readme.md` ("Ingeniería = marrón/maroon, Medicina = dorado").

## Resumen de riesgo por acción futura

| Acción | Riesgo |
|---|---|
| Leer y extraer valores de `tokens/*.css` a JSON | Bajo — son hojas de estilo puras, sin lógica |
| Migrar el bloque `x-omelette` a un validador propio | Bajo — es JSON ya estructurado |
| Copiar `components/**/*.jsx` a un paquete npm propio | Bajo-medio — requiere quitar dependencia implícita de `_ds_bundle.js`/entorno de preview |
| Usar `slides/*.html` como plantilla final sin flatten | Alto — viola la propia regla de marca del proyecto |
| Empaquetar `uploads/` dentro de un plugin público | Alto — tamaño, procedencia/licencia no confirmada, posible información no destinada a redistribución |
| Eliminar `assets/campus/` | Fuera de alcance de esta fase; requiere confirmación explícita antes de cualquier fase futura |
