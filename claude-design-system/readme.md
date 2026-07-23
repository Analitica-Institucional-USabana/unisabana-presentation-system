# Universidad de La Sabana — Design System

A design system for **executive and institutional presentations** at Universidad de La Sabana. It turns strategic, academic and technical information into presentations that read as clear, contemporary, rigorous and unmistakably *La Sabana*. Built strictly on the university's brand guidelines and its official PowerPoint template.

> **Prime directive:** when creativity and brand compliance conflict, compliance wins. When decoration and clarity conflict, clarity wins.

---

## Sources (provided by the client)

All foundations below are derived **only** from these official files (in `uploads/`):

- **`BRAND-GUIDELINES-VF.pdf`** — normative brand book. Governs logo usage, proportions, clear space, minimum size, backgrounds, contrast and restrictions. Source of the institutional colour palette and the typography rules.
- **`AF-PLANTILLA PPT GENERA-3.pptx`** — the master presentation template (45 slides). Source of the presentation visual language (composition, blocks, containers, backgrounds, separators, iconography style) and of the **15 colour palettes** (1 institutional + faculty/unit palettes) on its palette slide.
- **`LOGO POSITIVO-HORIZONTAL-COLOR (2).png`** — official colour (positive) horizontal logo → `assets/logo-horizontal-color.png`
- **`LOGO NEGATIVO-HORIZONTAL-BLANCO (1).png`** — official white (negative) horizontal logo → `assets/logo-horizontal-white.png`

Campus photography and the vector logo were extracted from the `.pptx` and stored in `assets/` (see index). No imagery was invented or generated.

---

## CONTENT FUNDAMENTALS

**Language.** Spanish (Colombian institutional register). Formal but not stiff. Copy is written for executives, academics and institutional audiences.

**Voice & tone.** Sober, confident, precise. The system speaks with **institutional authority** — it states conclusions, not topics. Titles should express a *message* ("Los ingresos crecieron 18 % en 2024"), not merely a label ("Ingresos"). Every slide carries one recognisable main idea.

**Person.** Institutional third person / impersonal ("La Universidad…", "El programa…"). Avoid first-person singular; the "we" (nosotros) is used only for genuinely collective institutional statements. Never address the reader as "tú".

**Casing.**

- Titles & headings: **sentence case** (capitalise first word + proper nouns), never ALL-CAPS for long strings.
- Eyebrows / kickers / small labels: UPPERCASE with wide tracking (`--ls-label`).
- Faculty and unit names use their official capitalisation (e.g. "Facultad de Estudios Jurídicos, Políticos e Internacionales").

**Numbers.** Big figures are a feature — set large, in `--fw-bold`/`--fw-black`, with units and periods clearly labelled. Always cite source and period on data slides ("Fuente: … · 2024").

**Emoji.** Never. Not part of the brand.

**Vibe.** Academic rigour + editorial calm. Confidence through restraint, whitespace and precise alignment — not through decoration.

---

## VISUAL FOUNDATIONS

**Colour.**

- **Institutional palette is the default** for almost everything: `--sabana-blue #00205B` (Pantone 281) is the anchor, supported by `--sabana-blue-mid #003A86`, `--sabana-blue-300 #98B1D3`, `--sabana-blue-100 #DCE5F3` and the warm `--sabana-cream #FAF3DC`. Neutrals are a Pantone-Black ramp (`--ink-900 → --ink-200`) plus white.
- **Faculty palettes** (13, e.g. Ingeniería, Medicina, Filosofía, Comunicación…) are used **only** when the whole piece clearly belongs to that faculty/audience. Activate one by setting `data-faculty="<slug>"` on a container — this re-points `--accent*`. **Never mix palettes** across a deck and never introduce colours outside the system.
- Max **1–2 background colours per deck**. Colour is used to build hierarchy, differentiate categories and guide the eye — not to fill space.

**Typography.** **Libre Franklin only.** Hierarchy comes from weight (Thin → Black), size, tracking and case. Display/hero numerals are heavy and tight (`--ls-display`); body is regular at `--lh-body 1.55`; eyebrows are uppercase, tracked (`--ls-label`).

**Backgrounds.** Three registers: (1) white/`--sabana-blue-100` for content, (2) deep navy `--sabana-blue-deep #0D2157` for covers, section separators and quote slides, (3) full-bleed official campus photography with a navy protection gradient for immersive covers. A signature **gradient corner wave** (`assets/brand-wave.svg`, `#00387E → #0D2157`) is the recurring graphic motif for covers/separators. No noisy textures, no random patterns.

**Density.** Two modes. *Low density* (60–80 % fill) for high-level messages, key figures, big titles, immediate reading. *High density* (80–90 % fill) for tables, indicators, technical content — organised, never saturated, hierarchy preserved. Both keep consistent margins (`--slide-margin 72px` on the 16:9 canvas), precise alignment and visual air.

**Layout.** 1280×720 (16:9) canvas with a consistent safe area. Grid-based with intentional compositional variety to avoid monotony — alternate typographic, visual, analytical and synthesis slides. Logo sits at a fixed corner per the brand book.

**Radii.** Restrained — the template favours crisp rectangular blocks. `--radius-sm 4px` / `--radius-md 8px` for cards and containers; pills only for tags/eyebrows.

**Borders & accents.** Hairline `1px` in `--ink-200`; a `3px` accent rule (`--border-accent-width`) in `--accent` marks active/emphasised blocks and kickers.

**Shadows.** Soft, single-layer, cool-tinted (`rgba(0,32,91,·)`): `--shadow-sm/md/lg`. No hard drop shadows, no 3-D, no glow.

**Cards.** White surface, `--radius-md`, `--shadow-sm/md`, optional top or left `3px` accent rule. Restrained and rectangular; content-first.

**Motion.** Calm and editorial. Fades and short slides on `--ease-standard` over `--dur-fast/med`. No bounce, no spin, no gratuitous effects. The logo is never animated.

**Hover / press.** Hover: subtle darkening of the accent or a lift to `--shadow-md`. Press: slightly darker fill (no shrink/scale gimmicks).

**Transparency & blur.** Used sparingly — only for the navy protection gradient over photography so the white logo and text stay legible. No frosted-glass fashion effects.

**Imagery vibe.** Official campus photography only — natural daylight or warm evening light, saturated but true colour, red-brick + greenery + Colombian-colonial architecture. Never generate or simulate people, buildings or scenes.

---

## ICONOGRAPHY

The template uses **simple, functional line/geometric icons** in a single stroke weight, tinted in the institutional blue or the active accent — never multicolour, never mixed styles within one deck. No icon **font** or SVG icon set ships inside the source files (only photography, the logo and chart art were embedded).

- **Substitution (flagged):** the system standardises on **[Lucide](https://lucide.dev)** (lineal, geometric, \~1.75px stroke) as the closest match to the template's icon character. Load from CDN and tint with `color`/`stroke: currentColor` set to `--accent`. This is a substitution for a set the source did not ship — swap for an official La Sabana icon library if one is provided.
- **Rules:** one icon family per deck; consistent stroke weight and size; icons support labels, they don't replace them; keep them monochrome in `--accent` or `--ink-500`.
- **Unicode/emoji:** never used as icons.

---

## VISUAL VOCABULARY / DIAGRAMS

Choose the representation that makes the content clearest — do not convert everything to graphics reflexively. Institutional-consistent options: flujos (flowcharts), funnels, matrices, timelines, mapas conceptuales, ciclos, cascadas, pirámides, comparaciones, tablas, infografías, roadmaps. Build them from the same line weights, radii, containers, connectors and colours as the components here. In data charts prioritise legibility, correct units/categories/periods/source; no 3-D, no misleading perspective.

---

## LOGO USAGE (from the brand book)

- Two responsive lockups: **horizontal** and **vertical**. Minimum symbol height **8 mm / 22 px**.
- **White logo** (`logo-horizontal-white.png`) on dark, saturated or photographic backgrounds with enough contrast. **Blue/positive logo** (`logo-horizontal-color.png`) on light backgrounds. A mono vector (`logo-horizontal-mono.svg`, tint via `fill`/`currentColor` to blue, white or black only) is available for scalable placement.
- **Never** recolour (other than dark blue / white / black), add stroke, resize the symbol independently, reposition or realign the symbol/type, alter type proportion, use two colours, or apply shadow/gradient/3-D/effects. Keep clear space and minimum size.

## PIE DE PÁGINA — ATRIBUCIÓN DE IA (regla fija)

**Obligatorio en toda diapositiva, plantilla, mock o artefacto** generado con este sistema (ver `CLAUDE.md`): un pie de página discreto en la **esquina inferior derecha** con el texto **"Diseñado con Claude Design"** y el **logo de Claude** (`assets/claude-logo.svg`) al lado. Deja explícito el uso de IA en el diseño.

- Posición: abajo-derecha, dentro del área segura (\~40px del borde).
- Tamaño discreto: texto \~14px, logo \~17px de alto.
- Color según fondo: `--ink-500` (sobre claro), `--sabana-blue-300` + logo en blanco (`filter:brightness(0) invert(1)`) sobre navy/foto.
- No debe competir con el contenido ni con el logo institucional de La Sabana.

## ACCESIBILIDAD / LEGIBILIDAD

La escala tipográfica está calibrada para **leerse desde cualquier puesto del salón**. Mínimo de cuerpo **20px**; titulares de sección 50–76px; portadas 96px; cifras hero 96px+. En la portada el **logo institucional va grande** (\~118px de alto). Aprovecha el espacio: prefiere pocas ideas grandes y legibles a mucho texto pequeño.

---

## INDEX — what's in this project

**Foundations**

- `styles.css` — global entry (import list only)
- `tokens/colors.css` — institutional palette, neutrals, 13 faculty palettes, `[data-faculty]` scopes
- `tokens/typography.css` — Libre Franklin family, weights, type scale, tracking
- `tokens/spacing.css` — spacing, radii, borders, shadows, slide canvas, motion
- `tokens/fonts.css` — Libre Franklin `@import`

**Assets** (`assets/`)

- `logo-horizontal-color.png` · `logo-horizontal-white.png` · `logo-horizontal-mono.svg`
- `brand-wave.svg` — gradient corner motif
- `claude-logo.svg` — marca de Claude para el pie de atribución de IA (tintable)
- **Fotografía oficial de campus** (aéreas del Campus del Puente del Común):
  - `campus-2.jpg` — **imagen principal / por defecto** (usar esta salvo que se pida otra)
  - `campus-1.jpg` · `campus-3.jpg` · `campus-4.jpg` — vistas aéreas alternativas
  - `campus-plaza-balcones.jpg` · `campus-puente.jpg` — detalles de campus
  - `campus-adportas.png` · `campus-balcones.png` · `campus-night.png` — extraídas de la plantilla (menor resolución)

**Specimen cards** (Design System tab) — `guidelines/` : colour, type, spacing, brand cards.

**Components** (`components/`) — reusable primitives (React, tokens-only). See each `*.prompt.md`.

- `brand/` — **Logo** (official lockup, min-size guard), **Eyebrow** (uppercase tracked kicker)
- `core/` — **Button** (primary/secondary/ghost), **Tag** (pill label), **Card** (surface + accent rule)
- `data/` — **Stat** (featured KPI figure), **ProgressBar** (labelled share bar)

All colour-bearing components read the active `--accent*`, so wrapping them in a `data-faculty="<slug>"` container recolours them to that faculty.

**Slides** (`slides/`) — sample slide types recreated from the template (cover, agenda, separator, content, data, quote, comparison, closing).

**Skill** — `SKILL.md` (Agent Skills compatible).

---

## CAVEATS & SUBSTITUTIONS

- **Icons:** no official icon set was provided → substituted Lucide (flagged above).
- **Secondary faces:** the brand book lists Publico Banner and Cabinet Grotesk as secondary/co-branding faces; per the institutional directive this system uses **only Libre Franklin** and builds all hierarchy from it. Publico Banner / Cabinet Grotesk are **not** bundled.
- **Faculty palette mapping** was reconstructed from the palette slide's swatch geometry; a couple of faculty→hue pairings are non-obvious (e.g. Ingeniería = maroon/brown, Medicina = gold). Verify against an official palette reference if available.
- **People photography:** cut-out student photos exist in the template but were intentionally **not** bundled — per directive the system avoids depicting people unless the university supplies approved imagery.

\---

\# INSTITUTIONAL PRESENTATION IMPLEMENTATION ADDENDUM

This section extends the system with mandatory implementation rules for logo sizing, protection area, placement and institutional presentation behaviour. It does not replace any previous rule in this README. When two rules appear to overlap, the stricter brand-protection rule wins.

\## 1. LOGO GOVERNANCE BEFORE RENDERING

Before generating any slide, determine which institutional authority is speaking.

\`\`\`ts

export type BrandAuthority =

  | "university"

  | "faculty-or-unit"

  | "protocolary"

  | "government";

\`\`\`

Selection rule:

\- \`university\`: use the institutional logo when the communication represents Universidad de La Sabana as a whole, involves several faculties or units, or has general institutional scope.

\- \`faculty-or-unit\`: use the approved official \*casa marcada\* asset for that faculty or unit. Never build a \*casa marcada\* dynamically by typing a unit name next to the institutional logo.

\- \`protocolary\`: reserved for diplomas, formal academic documents and formal communications signed by the Rector in the corresponding academic capacity.

\- \`government\`: reserved for official communications from the University's government, Rectoría or Vicerrectorías when the approved government logo is required.

Default for this presentation system: \`university\`.

The renderer must stop and request the correct approved asset when \`faculty-or-unit\`, \`protocolary\` or \`government\` is selected but no official file has been supplied. It must never simulate, redraw or reconstruct any of these logos.

\## 2. OFFICIAL ASSET POLICY

The logo component is an asset selector, not a logo generator.

Allowed operations:

\- choose an approved horizontal, vertical or responsive file;

\- choose the approved positive or negative version according to the background;

\- resize the complete lockup proportionally;

\- position the complete lockup inside the slide grid.

Forbidden operations:

\- recolour individual parts;

\- rebuild the logo with text or vectors;

\- crop the symbol or wordmark;

\- separate symbol and wordmark;

\- alter symbol-to-wordmark proportions;

\- apply \`filter\`, \`drop-shadow\`, \`stroke\`, \`outline\`, gradient, blur, mask or 3-D effects;

\- skew, rotate, stretch or animate the logo;

\- use CSS \`currentColor\` to tint the institutional logo at runtime;

\- place content inside the logo protection area.

Use a whitelist instead of arbitrary file paths:

\`\`\`ts

export const approvedLogoAssets = {

  horizontalPositive: "assets/logo-horizontal-color.png",

  horizontalNegative: "assets/logo-horizontal-white.png",

  verticalPositive: "assets/logo-vertical-color.png",

  verticalNegative: "assets/logo-vertical-white.png",

  responsivePositive: "assets/logo-responsive-color.png",

  responsiveNegative: "assets/logo-responsive-white.png",

} as const;

\`\`\`

If a required approved file is not present, fail closed. Do not improvise a substitute.

\## 3. LOGO SIZE MODEL

The system must distinguish between:

1\. normative minimum size;

2\. responsive-switch threshold;

3\. presentation-recommended size;

4\. optical maximum size.

These are different controls.

\### 3.1 Normative minimum

The complete institutional logo may not render below a symbol height of:

\`\`\`css

\--logo-min-symbol-height-screen: 22px;

\--logo-min-symbol-height-print: 8mm;

\`\`\`

The measurement is the visible height of the symbol inside the official lockup, not the total PNG canvas and not the width of the full file.

\### 3.2 Responsive-switch threshold

When the available symbol height approaches:

\`\`\`css

\--logo-responsive-threshold-screen: 20px;

\--logo-responsive-threshold-print: 7mm;

\`\`\`

switch to the approved responsive version. Do not continue shrinking the complete lockup.

\`\`\`ts

function selectLogoVariant(symbolHeightPx: number) {

  return symbolHeightPx <= 20 ? "responsive" : "complete";

}

\`\`\`

For projected institutional presentations, the complete logo should normally remain above the minimum. The responsive version is an exception for constrained spaces, not the default visual choice.

\### 3.3 Presentation-recommended sizes

Recommended sizes are layout guidance, not a replacement for the normative minimum.

For a 1280 × 720 slide:

\`\`\`css

\--logo-cover-symbol-height: clamp(72px, 11vh, 118px);

\--logo-separator-symbol-height: clamp(54px, 8vh, 84px);

\--logo-content-symbol-height: clamp(32px, 5vh, 48px);

\--logo-closing-symbol-height: clamp(64px, 10vh, 104px);

\`\`\`

Rules:

\- cover: the logo may be visually prominent but must remain secondary to the main message;

\- separator: the logo supports section identity and must not compete with the section title;

\- content slide: use the smallest presentation-recommended size that remains clearly legible;

\- closing slide: the logo may recover prominence, while preserving the same protection rules;

\- never enlarge the logo merely to fill empty space;

\- never reduce it to the normative minimum when the slide will be projected in a room.

\### 3.4 Optical maximum

The logo must not dominate the slide.

Use these maximum envelopes:

\`\`\`css

\--logo-max-width-cover: 30%;

\--logo-max-width-content: 20%;

\--logo-max-height-cover: 18%;

\--logo-max-height-content: 10%;

\`\`\`

If a logo exceeds either maximum, reduce it while keeping it above the normative minimum.

\## 4. LOGO CLEAR SPACE / PROTECTION AREA

The protection area is mandatory on all four sides of the institutional logo.

The implementation must not guess this measure from the PNG canvas. Store the official clear-space value as metadata attached to each approved logo asset.

\`\`\`ts

type LogoAssetMetadata = {

  path: string;

  orientation: "horizontal" | "vertical" | "responsive";

  visibleSymbolBox: { x: number; y: number; width: number; height: number };

  officialClearSpaceRatio: number;

};

\`\`\`

\`officialClearSpaceRatio\` is the clear-space module taken from the official BRAND-GUIDELINES, expressed relative to the visible symbol height. It must be entered once from the normative source and reused consistently.

\`\`\`ts

function getLogoClearSpace(

  visibleSymbolHeight: number,

  officialClearSpaceRatio: number

) {

  return visibleSymbolHeight \* officialClearSpaceRatio;

}

\`\`\`

Until the official ratio has been encoded for an asset, the renderer must treat that asset as incomplete and block final export. It must not infer clear space from visual judgement.

\### 4.1 Protection-area rules

Nothing may enter the clear-space rectangle:

\- titles;

\- body text;

\- page numbers;

\- source notes;

\- chart labels;

\- lines;

\- icons;

\- photographs with high visual contrast;

\- texture edges;

\- the Claude Design attribution;

\- partner logos;

\- legal marks;

\- decorative shapes.

The protection area starts at the visible logo bounds, not at the transparent edge of the image file.

The following are separate and cumulative:

\`\`\`text

slide safe area

\+ logo edge offset

\+ logo official clear space

\`\`\`

A slide margin does not replace logo clear space.

\### 4.2 Edge offsets

The logo must remain inside the safe area and keep additional separation from the physical edge of the slide.

\`\`\`css

\--logo-edge-offset-x: 72px;

\--logo-edge-offset-y: 56px;

\`\`\`

For content slides, use the same edge offsets throughout the deck. Covers and separators may use a different approved template position, but the logo must still preserve its clear space.

\### 4.3 Collision validation

Every export must run a logo collision check.

\`\`\`ts

type Rect = { x: number; y: number; width: number; height: number };

function expandRect(rect: Rect, padding: number): Rect {

  return {

    x: rect.x - padding,

    y: rect.y - padding,

    width: rect.width + padding \* 2,

    height: rect.height + padding \* 2,

  };

}

\`\`\`

Build the protected logo rectangle by expanding the visible logo bounds with the official clear-space value. If any non-background element intersects that rectangle, the slide fails validation.

\## 5. LOGO PLACEMENT IN INSTITUTIONAL PRESENTATIONS

Logo placement is fixed by slide family. Claude must not choose a random corner.

\### 5.1 Cover

Preferred behaviour:

\- use the template-defined top or bottom corner;

\- select positive logo on light backgrounds;

\- select negative white logo on navy, saturated colour or photography;

\- keep title, subtitle and speaker information outside the logo protection area;

\- on photography, place a controlled navy protection gradient behind the logo only when needed for contrast;

\- never place the logo over a visually busy architectural detail without protection.

\### 5.2 Section separator

\- use one consistent logo position across all separators;

\- use the negative logo on dark separators and the positive logo on light separators;

\- do not combine the institutional logo with a second decorative brand mark;

\- keep the logo visually secondary to the section number and section message.

\### 5.3 Content slides

\- use one consistent corner across the whole deck;

\- do not alternate logo position from slide to slide;

\- align the logo to the main slide grid;

\- keep page numbers, sources and the Claude Design attribution outside the logo protection area;

\- do not place the logo inside a card, pill or chart container;

\- do not use the logo as a watermark.

\### 5.4 Closing slide

\- use the same approved logo family and colour logic as the rest of the deck;

\- the logo may be larger than on content slides;

\- keep contact information and closing message outside its protection area;

\- preserve the Claude Design attribution without allowing it to compete with the institutional logo.

\## 6. CONTRAST AND BACKGROUND CONTROL

Use:

\- positive blue logo on white, cream and approved light backgrounds;

\- negative white logo on navy, approved dark colours and photography;

\- black only when an approved monochrome application explicitly requires it.

Do not place the positive blue logo on a medium or dark background. Do not place the white logo on a pale background.

Minimum implementation check:

\`\`\`ts

function selectLogoTone(backgroundLuminance: number) {

  return backgroundLuminance < 0.45 ? "negative" : "positive";

}

\`\`\`

The luminance check is a technical guardrail. The approved asset/background combinations remain the primary rule.

On photography:

\- reserve a visually calm zone for the logo;

\- apply the approved navy protection gradient when necessary;

\- never place a translucent card directly behind the logo;

\- never use blur, glow or shadow to force legibility;

\- do not allow high-contrast edges to cross the logo or its clear-space zone.

\## 7. CLAUDE DESIGN ATTRIBUTION VS. INSTITUTIONAL LOGO

The Claude Design attribution remains mandatory under this system.

It must behave as a disclosure, not as a co-leading brand.

Rules:

\- retain the lower-right location already defined;

\- maintain a minimum separation from the institutional logo equal to the institutional logo's full protection area plus 24px;

\- never place the Claude logo inside the Universidad de La Sabana logo protection area;

\- never align both logos in a way that implies a single combined lockup;

\- do not place a dividing line that visually merges both marks;

\- the Claude attribution must remain smaller and lower in hierarchy than the institutional logo;

\- when both marks share the same corner in a template, move the Claude attribution to the opposite lower corner while keeping the institutional logo fixed;

\- the Claude attribution may not force the institutional logo to shrink below its recommended presentation size.

Recommended maximum:

\`\`\`css

\--claude-attribution-max-width: 14%;

\--claude-attribution-logo-height: 17px;

\--claude-attribution-text-size: 14px;

\`\`\`

\## 8. INSTITUTIONAL PRESENTATION GRID

The base canvas remains:

\`\`\`css

\--slide-width: 1280px;

\--slide-height: 720px;

\--slide-aspect-ratio: 16 / 9;

\`\`\`

Separate slide margins from logo controls:

\`\`\`css

\--slide-safe-left: 72px;

\--slide-safe-right: 72px;

\--slide-safe-top: 56px;

\--slide-safe-bottom: 48px;

\--content-column-gap: 32px;

\--content-row-gap: 24px;

\--footer-zone-height: 36px;

\`\`\`

Rules:

\- all content aligns to a consistent grid;

\- the logo aligns to the grid but retains its own clear space;

\- footers live in the footer zone and do not float;

\- sources and legal notes remain readable and consistently aligned;

\- no content may extend beyond the safe area;

\- full-bleed photography is the only normal exception to safe-area clipping;

\- intentional asymmetry is allowed only when the primary alignment lines remain evident.

\## 9. REQUIRED SLIDE FAMILIES

Every deck should be assembled from approved slide families rather than unrestricted free composition.

\### 9.1 Cover

Must include:

\- one message-led title;

\- optional subtitle;

\- date, event or presenter information only when useful;

\- approved institutional logo;

\- mandatory Claude Design attribution;

\- one dominant background register: light, navy or approved campus photography.

Avoid:

\- multiple cards;

\- dense agendas;

\- more than one decorative motif;

\- logo placed in the centre unless an approved template layout requires it.

\### 9.2 Agenda / route

\- 3–6 items preferred;

\- clear sequence;

\- one visual system for numbering;

\- no paragraph-length descriptions;

\- keep the logo fixed in the content-slide position.

\### 9.3 Section separator

\- one section number;

\- one section message;

\- optional short descriptor;

\- high contrast;

\- low density;

\- no charts or tables.

\### 9.4 Message slide

\- one central conclusion;

\- one supporting sentence or proof point;

\- optional single visual;

\- large type and generous whitespace.

\### 9.5 Data slide

Must include:

\- conclusion-led title;

\- clearly labelled metric;

\- unit;

\- period;

\- source;

\- direct labels where possible;

\- no 3-D, fake depth or decorative perspective.

Charts must use the institutional palette or one active faculty palette. Never mix faculty palettes within one deck.

\### 9.6 Comparison slide

\- compare equivalent dimensions;

\- use symmetrical or deliberately contrasted columns;

\- keep card count limited;

\- use one accent logic;

\- do not use colour as the only carrier of meaning.

\### 9.7 Process / timeline

\- show direction clearly;

\- use consistent connectors and node shapes;

\- prefer 3–6 steps per slide;

\- split longer processes across slides rather than shrinking the text;

\- use institutional line weights and approved accent colours.

\### 9.8 Table / technical slide

\- preserve a minimum 20px body size whenever possible;

\- use a strong header row;

\- reduce visible gridlines;

\- highlight only the values needed for the message;

\- split tables that become too dense;

\- never place the logo inside the table area.

\### 9.9 Quote slide

\- one quote;

\- one attribution;

\- low density;

\- dark navy or light editorial background;

\- no quotation-mark decoration larger than the quote itself.

\### 9.10 Closing slide

\- one closing statement or call to action;

\- approved institutional logo;

\- optional contact information;

\- Claude Design attribution;

\- no new argument or dense summary.

\## 10. PRESENTATION DENSITY AND CONTENT LIMITS

Density percentages are visual guidance, not a target to fill mechanically.

Operational limits:

\`\`\`ts

export const slideContentLimits = {

  maxPrimaryIdeas: 1,

  maxSupportingBlocks: 3,

  maxColumns: 3,

  maxCardCount: 6,

  maxChartSeriesPreferred: 5,

  maxAgendaItemsPreferred: 6,

  maxProcessStepsPreferred: 6,

};

\`\`\`

When content exceeds these limits:

1\. split the slide;

2\. prioritise the conclusion;

3\. move detail to an appendix;

4\. never solve overflow by reducing body copy below 20px;

5\. never reduce the institutional logo below its minimum or recommended size to gain content space.

\## 11. TYPOGRAPHIC ALIGNMENT FOR PRESENTATIONS

This system keeps Libre Franklin as already declared.

Use hierarchy through weight, scale, spacing and case:

\`\`\`css

\--type-cover-title: clamp(64px, 7.5vw, 96px);

\--type-section-title: clamp(50px, 5.8vw, 76px);

\--type-slide-title: clamp(34px, 4vw, 52px);

\--type-body: 20px;

\--type-caption: 16px;

\--type-source: 14px;

\`\`\`

Rules:

\- titles use sentence case;

\- do not use long uppercase headings;

\- body text must remain readable when projected;

\- use bold only for hierarchy, not for entire paragraphs;

\- keep line lengths controlled;

\- do not combine several unrelated font weights on one slide;

\- preserve consistent title baselines across slides of the same family.

\## 12. VISUAL LANGUAGE FOR PRESENTATIONS

Use visual elements as structure, not decoration.

\- maximum two institutional diagramming elements per slide;

\- do not repeat one decorative element excessively;

\- keep shapes simple and derived from the established system;

\- avoid ornamental waves, textures or patterns behind dense content;

\- use cards only when they organise information;

\- use shadows sparingly and never on logos;

\- use one accent rule consistently;

\- maintain the editorial calm of the institutional template.

The recurring corner wave may appear on covers and separators as already defined, but it must not:

\- overlap the logo protection area;

\- appear on every content slide;

\- compete with the title;

\- be combined with additional decorative patterns;

\- reduce text contrast.

\## 13. PRESENTATION VALIDATION CHECKLIST

Every generated deck must pass the following checks before export.

\### Logo

\- approved asset selected;

\- correct institutional authority;

\- no redrawing or recolouring;

\- uniform scaling;

\- symbol height above minimum;

\- responsive version used at the threshold;

\- official clear-space metadata available;

\- no collisions inside protection area;

\- correct positive/negative version;

\- fixed position by slide family;

\- no shadow, filter, animation or distortion.

\### Layout

\- 1280 × 720, 16:9;

\- content inside safe area;

\- logo clear space treated separately from slide margin;

\- consistent grid;

\- consistent footer zone;

\- no accidental overlaps;

\- no clipped text;

\- no dense slide solved by shrinking text.

\### Content

\- one main idea per slide;

\- conclusion-led title;

\- Spanish institutional register;

\- source and period on data slides;

\- no emoji;

\- no unsupported colours;

\- no mixed faculty palettes;

\- no unsupported icon family.

\### AI disclosure

\- “Diseñado con Claude Design” present where required;

\- Claude logo uses the defined size and colour;

\- attribution does not collide with the institutional logo;

\- attribution remains subordinate in hierarchy;

\- disclosure is visible but discreet.

\## 14. AUTOMATED QA CONTRACT

The slide generator should expose a validation result for each slide.

\`\`\`ts

type ValidationSeverity = "error" | "warning" | "pass";

type SlideValidation = {

  slideId: string;

  status: ValidationSeverity;

  checks: {

    logoAssetApproved: boolean;

    logoAuthorityResolved: boolean;

    logoMinimumSize: boolean;

    logoClearSpaceAvailable: boolean;

    logoCollisionFree: boolean;

    logoContrastValid: boolean;

    insideSafeArea: boolean;

    typographyReadable: boolean;

    sourcePresentWhenRequired: boolean;

    claudeDisclosurePresent: boolean;

    claudeDisclosureSeparated: boolean;

  };

  messages: string\[\];

};

\`\`\`

Export policy:

\- \`error\`: block export;

\- \`warning\`: allow preview, block final institutional handoff;

\- \`pass\`: allow export as a system-generated draft.

The validator does not constitute final institutional approval.

\## 15. RECOMMENDED TOKEN ADDITIONS

Add these tokens without replacing the existing token system:

\`\`\`css

:root {

  --logo-min-symbol-height-screen: 22px;

  --logo-responsive-threshold-screen: 20px;

  --logo-cover-symbol-height: clamp(72px, 11vh, 118px);

  --logo-separator-symbol-height: clamp(54px, 8vh, 84px);

  --logo-content-symbol-height: clamp(32px, 5vh, 48px);

  --logo-closing-symbol-height: clamp(64px, 10vh, 104px);

  --logo-max-width-cover: 30%;

  --logo-max-width-content: 20%;

  --logo-max-height-cover: 18%;

  --logo-max-height-content: 10%;

  --logo-edge-offset-x: 72px;

  --logo-edge-offset-y: 56px;

  --slide-safe-left: 72px;

  --slide-safe-right: 72px;

  --slide-safe-top: 56px;

  --slide-safe-bottom: 48px;

  --content-column-gap: 32px;

  --content-row-gap: 24px;

  --footer-zone-height: 36px;

  --claude-attribution-max-width: 14%;

  --claude-attribution-logo-height: 17px;

  --claude-attribution-text-size: 14px;

}

\`\`\`

The official logo clear-space ratio is intentionally not hard-coded here. It must be entered from the approved BRAND-GUIDELINES into the asset metadata. The system must block final export when that metadata is absent rather than inventing a value.

\## 16. DEFINITION OF DONE FOR A GENERATED PRESENTATION

A presentation generated with this system is complete only when:

\- the correct institutional logo architecture has been selected;

\- the logo asset is official and approved;

\- minimum size and responsive rules pass;

\- clear-space metadata is present and collision-free;

\- logo placement is consistent with the slide family;

\- layout follows the institutional 16:9 grid;

\- titles communicate conclusions;

\- text remains readable when projected;

\- the deck uses one coherent palette;

\- sources and periods are present where required;

\- the Claude Design attribution is present and subordinate;

\- all automated QA checks pass.

Passing these checks means the output is technically consistent with this design system. It does not replace institutional review or final approval.

\---
