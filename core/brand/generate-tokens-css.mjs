#!/usr/bin/env node
// Genera core/brand/tokens.css a partir de core/brand/tokens.json.
// tokens.json es la fuente única (Hito 1, decisión D-10 en planning/07-decisions-and-open-questions.md);
// este script produce una proyección CSS equivalente a la de claude-design-system/tokens/*.css
// para que core/components/**/*.jsx (que leen var(--...)) sigan funcionando sin reescritura.
// No editar tokens.css a mano — volver a ejecutar: node core/brand/generate-tokens-css.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const tokens = JSON.parse(readFileSync(join(here, "tokens.json"), "utf8"));

function entries(obj) {
  return Object.entries(obj).filter(([key]) => !key.startsWith("_"));
}

function resolve(node) {
  if (node && typeof node === "object" && "ref" in node) {
    const path = node.ref.split(".");
    let cur = tokens;
    for (const key of path) cur = cur[key];
    return resolve(cur);
  }
  if (node && typeof node === "object" && "value" in node) return node.value;
  return node;
}

const lines = [];
lines.push("/* ============================================================");
lines.push("   GENERADO desde core/brand/tokens.json — no editar a mano.");
lines.push("   Regenerar con: node core/brand/generate-tokens-css.mjs");
lines.push("   Universidad de La Sabana — tokens de marca (Hito 1)");
lines.push("   ============================================================ */");
lines.push("");
lines.push(":root {");
lines.push("  /* ---- Institutional blues ---- */");
for (const [name, node] of entries(tokens.color.institutional)) {
  lines.push(`  --sabana-${name.replace(/^sabana-/, "")}: ${resolve(node)}; /* ${node.note ?? ""} */`.replace("--sabana-sabana-", "--sabana-"));
}
lines.push("");
lines.push("  /* ---- Neutrals ---- */");
for (const [name, node] of entries(tokens.color.neutrals)) {
  lines.push(`  --${name}: ${resolve(node)};`);
}
lines.push("");
lines.push("  /* ---- Semantic aliases ---- */");
for (const [name, node] of entries(tokens.color.semantic)) {
  lines.push(`  --${name}: var(--${node.ref.split(".").pop()});`);
}
lines.push("");
lines.push("  /* ---- Active accent (institutional default) ---- */");
for (const [name, node] of entries(tokens.color.accent.default)) {
  lines.push(`  --${name}: var(--${node.ref.split(".").pop()});`);
}
lines.push("");
lines.push("  /* ---- Faculty & unit palettes ---- */");
for (const [fac, weights] of entries(tokens.color.faculties)) {
  const parts = entries(weights).map(([w, hex]) => `--fac-${fac}-${w}:${hex};`).join(" ");
  lines.push(`  ${parts}`);
}
lines.push("");
lines.push("  /* ---- Typography ---- */");
lines.push(`  --font-sans: ${tokens.typography.fontFamily.sans};`);
lines.push(`  --font-display: var(--font-sans);`);
for (const [name, w] of entries(tokens.typography.weights)) {
  lines.push(`  --fw-${name}: ${w}; /* @kind font */`);
}
for (const [name, s] of entries(tokens.typography.scale)) {
  lines.push(`  --fs-${name}: ${s.rem}rem; /* ${s.px}px${s.use ? " · " + s.use : ""} */`);
}
for (const [name, v] of entries(tokens.typography.lineHeight)) {
  lines.push(`  --lh-${name}: ${v}; /* @kind font */`);
}
for (const [name, v] of entries(tokens.typography.letterSpacing)) {
  lines.push(`  --ls-${name}: ${v}; /* @kind font */`);
}
lines.push("");
lines.push("  /* ---- Spacing scale ---- */");
for (const [name, v] of entries(tokens.spacing.scale)) {
  lines.push(`  --${name}: ${v};`);
}
lines.push("");
lines.push("  /* ---- Radii ---- */");
for (const [name, v] of entries(tokens.spacing.radii)) {
  lines.push(`  --radius-${name}: ${v};`);
}
lines.push("");
lines.push("  /* ---- Borders ---- */");
lines.push(`  --border-width: ${tokens.spacing.borders.width}; /* @kind spacing */`);
lines.push(`  --border-accent-width: ${tokens.spacing.borders.accentWidth}; /* @kind spacing */`);
lines.push("");
lines.push("  /* ---- Shadows ---- */");
for (const [name, v] of entries(tokens.spacing.shadows)) {
  lines.push(`  --shadow-${name}: ${v};`);
}
lines.push("");
lines.push("  /* ---- Slide canvas ---- */");
lines.push(`  --slide-w: ${tokens.spacing.canvas.width}px;`);
lines.push(`  --slide-h: ${tokens.spacing.canvas.height}px;`);
lines.push(`  --slide-margin: ${tokens.spacing.canvas.margin};`);
lines.push(`  --slide-gap: ${tokens.spacing.canvas.gap};`);
lines.push("");
lines.push("  /* ---- Motion ---- */");
lines.push(`  --ease-standard: ${tokens.spacing.motion.easeStandard}; /* @kind other */`);
lines.push(`  --dur-fast: ${tokens.spacing.motion.durationFast};  /* @kind other */`);
lines.push(`  --dur-med: ${tokens.spacing.motion.durationMedium};   /* @kind other */`);
lines.push("}");
lines.push("");
lines.push('/* ---- Faculty scopes: set data-faculty on a container to re-point --accent ----');
lines.push("   Use ONLY when the whole piece belongs to that faculty; never mix palettes. */");
for (const [fac, mapping] of entries(tokens.color.facultyAccentMapping)) {
  const decl = entries(mapping)
    .map(([role, weight]) => `--${role}:var(--fac-${fac}-${weight});`)
    .join(" ");
  lines.push(`[data-faculty="${fac}"] { ${decl} }`);
}
lines.push("");

const css = lines.join("\n");
writeFileSync(join(here, "tokens.css"), css, "utf8");
console.log(`tokens.css generado (${css.split("\n").length} líneas)`);
