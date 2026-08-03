# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A pipeline that turns `claude-design-system/` — a design-system bundle originally generated inside Claude Design for Universidad de La Sabana — into an installable, portable presentation-generation system (Claude Code plugin + Codex plugin) built around a validated intermediate format (**Deck Spec**, YAML) rather than agent-authored HTML.

`claude-design-system/` is the **frozen original source** (components, tokens, brand guidelines, example slides). It is never edited by this pipeline — see `planning/07-decisions-and-open-questions.md` D-12. Everything this repo builds lives in `core/`, `skills/`, `validators/`, `renderers/`, `adapters/`.

Read `planning/README.md` first — it indexes the planning docs (current-state inventory, gap analysis, target architecture, migration roadmap, MVP definition, testing strategy, security/governance, decisions/ADRs, visual-quality backlog, and the Infografía artifact type) that explain *why* the architecture is shaped this way. `planning/07-decisions-and-open-questions.md` is the ADR log; check it before revisiting a technical choice (format, stack, validation order, etc.) — it's probably already been decided there with a stated rationale. `planning/11-infografia-artifact-type.md` documents the second artifact type (see below) — a sibling of the Deck Spec, not an extension of it.

## Commands

```bash
node scripts/validate-deck-spec.mjs <deck.yaml>                    # structural validation (JSON Schema) only, Deck Spec
node scripts/validate-infografia-spec.mjs <infografia.yaml>        # structural validation (JSON Schema) only, Infografía Spec
node scripts/validate-brand.mjs <spec.yaml> [rendered.html]        # brand-rule validation; auto-detects deck vs. infografía by root key; add the html arg to also check the rendered-output rules
node renderers/html/render.mjs <deck.yaml> [out.html]              # validates structure, then renders self-contained HTML (deck)
node renderers/pptx/render.mjs <deck.yaml> [out.pptx]              # same, for editable PPTX (deck only — infografía has no PPTX export)
node renderers/html/render-infografia.mjs <infografia.yaml> [out.html]  # validates structure, then renders self-contained HTML (infografía)
node renderers/pdf/render.mjs <infografia.yaml> [out.pdf]          # renders the infografía HTML in headless Chromium and exports PDF
npm run build:adapters                                             # regenerate adapters/claude-plugin and adapters/codex-plugin from source (see below)
```

`npm test` (`tests/run.mjs`) is a small dependency-free runner (no jest/vitest — D-15, thin deterministic CLI): it validates every fixture in `tests/schema/` (structural, both Deck Spec and Infografía Spec) and `tests/golden-decks/`/`tests/golden-infografias/` (brand-rule violations, one fixture per rule) against the exact result documented in that fixture's own header comment, and exercises every `renderers/html/charts/` family × variant declared in `core/schemas/infografia-spec.schema.json` with a representative payload. See `planning/05-testing-strategy.md` for the fuller intended strategy (visual/snapshot testing, agent evals) this doesn't yet cover.

## Architecture

Pipeline, source of truth → output:

```
core/brand/{tokens.json,rules/*.json}   canonical brand data (single source; tokens.css is generated from tokens.json)
        ↓ read by
skills/{unisabana-create,unisabana-review}/SKILL.md   agent-facing instructions (creativity lives here)
        ↓ produces / consumes
Deck Spec (*.yaml) validated against core/schemas/deck-spec.schema.json
        ↓ validated by
validators/  (deterministic, no model calls)
        ↓ rendered by
renderers/{html,pptx}/
        ↓ packaged by
adapters/{claude-plugin,codex-plugin}/
```

**Creativity vs. compliance split (core principle):** the `unisabana-create` skill decides narrative, slide type, and copy, and its *only* output is a Deck Spec (data, never hand-written HTML/PPTX). `validators/` and `renderers/` are plain deterministic TypeScript/Node — no model involvement, runnable in CI. `unisabana-review` never regenerates content, only reports against the same deterministic rules. Don't blur this: if you're tempted to have a skill emit markup directly, that's the manual/disposable-mock escape hatch documented in each SKILL.md, not the default path.

**Validate-before-render is enforced, not optional** (`planning/07-decisions-and-open-questions.md` D-16): `renderers/html/render.mjs` and `renderers/pptx/render.mjs` call `loadAndValidateDeckSpec` first and refuse to render on structural failure. `scripts/validate-brand.mjs` runs brand rules in two independent layers — Deck-Spec-level rules (`imagery`, `density`, in `validators/rules/`) before rendering, and rendered-HTML-level rules (`logo`, `ai-disclosure`) after, since some things (logo pixel size, footer placement) can only be checked in the actual output.

**Deck Spec** (`core/schemas/deck-spec.schema.json`) has 10 slide types: `cover, agenda, separator, message, data, comparison, process, table, quote, closing`. One `presentation.palette` per deck — mixing institutional and faculty palettes is a hard rule violation (`core/brand/rules/palette.json`). Schema evolves under its own SemVer independent of the plugin version (see schema `$comment` for the PATCH/MINOR/MAJOR policy).

**Infografía Spec** (`core/schemas/infografia-spec.schema.json`, `planning/11-infografia-artifact-type.md`) is a **sibling artifact, not a Deck Spec variant**: a single-canvas piece (not a slide sequence) with a mandatory structure (title → `keyNumbers` KPI strip → `modules[]` "development", one idea per module, chosen from 10 visualization families with per-family `variant` — `renderers/html/charts/`) → optional `conclusions` → mandatory `sources`. Exports to HTML + PDF (via headless Chromium, `renderers/pdf/render.mjs`), never PPTX. Same single-palette rule as the deck, plus an optional acotado `coBrand` (secondary institution logo + one accent color, always subordinate — `core/brand/rules/cobrand.json`) for pieces that legitimately involve a second institution; a full second institutional palette is never allowed. Created by the `unisabana-infografia` skill, audited by the same `unisabana-review` skill (Case 1 in its SKILL.md auto-detects the artifact kind).

**Adapters are generated, never hand-edited** (`planning/07-decisions-and-open-questions.md` D-13). `adapters/claude-plugin/` and `adapters/codex-plugin/` are full copies of `core/, skills/, scripts/, renderers/, validators/, node_modules/, package.json` produced by `scripts/build-adapters.mjs`. This is required because both platforms cache installed plugins in a way that breaks any relative path reaching outside the plugin's own tree — so everything a skill invokes via Bash must travel inside the adapter. After changing anything in those source directories, re-run `npm run build:adapters` before the change is reflected in an installed plugin; don't edit files under `adapters/*/` directly, edit the source and rebuild.

**One creation skill per artifact type, one shared audit skill** (D-03, extended by `planning/11-infografia-artifact-type.md`): `unisabana-create` (deck) and `unisabana-infografia` (infografía) generate; `unisabana-review` audits both. D-03's "two skills, not one-per-slide-type" only rules out fragmenting *within* an artifact type (e.g. a skill per slide family) — a genuinely different artifact (single-canvas piece vs. slide deck) still warrants its own creation skill, since the creativity decisions involved (module/visualization selection vs. slide-family selection) don't overlap. All skills are portable as-is between Claude Code (`.claude/skills/`) and Codex (`.agents/skills/`) since they're just `SKILL.md` + progressively-loaded `references/`.

**Offline requirement** (D-20): the HTML renderer and validators must work with zero network access — fonts and images are embedded as data URIs (`scripts/lib/embed.mjs`), not linked.

## Where things stand (MVP scope)

Per `planning/04-mvp-definition.md`, the MVP is: create → validate → render (HTML) → review, installable locally as a Claude Code plugin. Out of scope for now: public/multi-institution marketplace, MCP integration, reviewing third-party (non-system-generated) artifacts beyond a manual checklist fallback. Note `adapters/*/.{claude,codex}-plugin/marketplace.json` does not exist yet even though `plugin.json` does — local dev-marketplace install per `04-mvp-definition.md` is still pending. `planning/08-visual-quality-and-layout-fixes.md` tracks a known post-MVP backlog (title-wrap/overlap bug in the layout renderers, unused `brand-wave.svg` motif, default cover photo) — check it before touching `renderers/html/layouts/` or `renderers/pptx/layouts/` for visual bugs, it may already be diagnosed there.
