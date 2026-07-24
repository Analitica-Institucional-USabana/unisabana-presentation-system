// pptxgenjs no entiende var(--accent) — a diferencia del renderer HTML, aquí
// hay que resolver los colores concretos en JS antes de escribirlos, según la
// paleta elegida en presentation.palette (core/brand/tokens.json).

import { readFileSync } from "node:fs";
import { join } from "node:path";

const hex = (v) => v.replace(/^#/, "");

export function loadTokens(repoRoot) {
  return JSON.parse(readFileSync(join(repoRoot, "core/brand/tokens.json"), "utf8"));
}

export function resolveColors(tokens, palette) {
  const inst = (name) => hex(tokens.color.institutional[name].value);
  const neutral = (name) => hex(tokens.color.neutrals[name].value);

  const base = {
    sabanaBlue: inst("sabana-blue"),
    sabanaBlueDeep: inst("sabana-blue-deep"),
    sabanaBlueMid: inst("sabana-blue-mid"),
    sabanaBlue300: inst("sabana-blue-300"),
    sabanaCream: inst("sabana-cream"),
    ink900: neutral("ink-900"),
    ink700: neutral("ink-700"),
    ink500: neutral("ink-500"),
    ink200: neutral("ink-200"),
    paper: neutral("paper"),
    familia700: hex(tokens.color.faculties.familia["700"]),
    juridicas500: hex(tokens.color.faculties.juridicas["500"]),
  };

  if (!palette || palette === "institutional") {
    return { ...base, accent: base.sabanaBlue, accentDark: base.sabanaBlueDeep, accentMid: base.sabanaBlueMid, accent100: inst("sabana-blue-100") };
  }

  const fac = tokens.color.faculties[palette];
  const map = tokens.color.facultyAccentMapping[palette];
  return {
    ...base,
    accent: hex(fac[map.accent]),
    accentDark: hex(fac[map["accent-dark"]]),
    accentMid: hex(fac[map["accent-mid"]]),
    accent100: hex(fac[map["accent-100"]]),
  };
}
