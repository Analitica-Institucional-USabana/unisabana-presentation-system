---
name: unisabana-design
description: Use this skill to generate well-branded interfaces and assets for Universidad de La Sabana, either for production or throwaway prototypes/mocks/presentations. Contains essential design guidelines, colors, type, fonts, logos, and reusable UI components for prototyping — with a strong focus on executive and institutional presentations.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files (`styles.css` + `tokens/`, `assets/`, `components/`, `guidelines/`, `slides/`).

If creating visual artifacts (slides, mocks, throwaway prototypes, etc.), copy assets out and create static HTML files for the user to view. If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

Non-negotiables (see `readme.md` for detail):
- **Libre Franklin only** for all type; build hierarchy from weight/size/tracking/case.
- **Institutional palette by default** (`--sabana-blue #00205B` + supports). Use a faculty palette only when the whole piece belongs to that faculty — set `data-faculty="<slug>"` and never mix palettes.
- **Never** modify, recolour, redraw, stretch or reposition the logo; white on dark, blue on light; keep clear space and the 22px minimum.
- **Never** generate or simulate people, buildings or campus scenes; use only official supplied imagery (a few official campus photos ship in `assets/`).
- When compliance and creativity conflict, compliance wins; when decoration and clarity conflict, clarity wins.

If the user invokes this skill without other guidance, ask what they want to build or design, ask a few focused questions (audience, faculty/unit, density, slide count), and act as an expert institutional designer who outputs HTML artifacts _or_ production code, depending on the need.
