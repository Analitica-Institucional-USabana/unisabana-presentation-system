// Helpers compartidos entre layouts pptx. A diferencia del renderer HTML,
// pptxgenjs necesita alto explícito por cuadro de texto (no hay "auto" real) —
// se usan alturas generosas; no se persigue ajuste pixel-perfect (fuera de
// alcance del Hito 7, planning/03-migration-roadmap.md).

import { weightToBold } from "./constants.mjs";

export function addTitle(slide, text, { x, y, w, h = 1.4, sizePt, color }) {
  slide.addText(text, { x, y, w, h, fontFace: "Libre Franklin", fontSize: sizePt, bold: true, color, valign: "top", fit: "shrink" });
}

export function addBody(slide, text, { x, y, w, h = 0.5, sizePt = 15, color = "3C3C3B", weight = "regular" }) {
  slide.addText(text, { x, y, w, h, fontFace: "Libre Franklin", fontSize: sizePt, bold: weightToBold(weight), color, fit: "shrink" });
}

export function addEyebrow(slide, text, { x, y, w = 4, color }) {
  slide.addText(text.toUpperCase(), { x, y, w, h: 0.35, fontFace: "Libre Franklin", fontSize: 11, bold: true, color, charSpacing: 2 });
}

export function addStatBlock(slide, stat, { x, y, w, valueSizePt, colors }) {
  const deltaColor = stat.deltaDirection === "down" ? colors.juridicas500 : colors.familia700;
  const runs = [{ text: stat.value, options: { fontSize: valueSizePt, bold: true, color: colors.accent } }];
  if (stat.delta) {
    const arrow = stat.deltaDirection === "down" ? "▾" : "▴";
    runs.push({ text: `  ${arrow} ${stat.delta}`, options: { fontSize: valueSizePt * 0.4, bold: true, color: deltaColor } });
  }
  slide.addText(runs, { x, y, w, h: valueSizePt / 54, fontFace: "Libre Franklin", valign: "bottom" });

  let cursorY = y + valueSizePt / 54 + 0.05;
  if (stat.label) {
    slide.addText(stat.label, { x, y: cursorY, w, h: 0.35, fontFace: "Libre Franklin", fontSize: 16, bold: true, color: colors.sabanaBlue });
    cursorY += 0.35;
  }
  if (stat.caption) {
    slide.addText(stat.caption, { x, y: cursorY, w, h: 0.3, fontFace: "Libre Franklin", fontSize: 11, color: colors.ink500 });
  }
}

export function addBulletCard(slide, { heading, points }, { x, y, w, h, colors }) {
  slide.addShape("rect", { x, y, w, h, fill: { color: colors.paper }, line: { color: colors.ink200, width: 0.75 } });
  slide.addShape("rect", { x, y, w, h: 0.06, fill: { color: colors.accent }, line: { type: "none" } });
  slide.addText(heading, { x: x + 0.25, y: y + 0.2, w: w - 0.5, h: 0.5, fontFace: "Libre Franklin", fontSize: 16, bold: true, color: colors.sabanaBlue });
  const bulletRuns = points.map((p) => ({ text: p, options: { bullet: { code: "2022" }, breakLine: true } }));
  slide.addText(bulletRuns, { x: x + 0.25, y: y + 0.75, w: w - 0.5, h: h - 1, fontFace: "Libre Franklin", fontSize: 13, color: colors.ink700 });
}
