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

// Barra de progreso (core/components/data/ProgressBar.jsx, expuesta en pptx —
// planning/09-visual-richness-and-content-density.md #8).
export function addProgressBar(slide, { value, label }, { x, y, w, colors }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  if (label) {
    slide.addText(label, { x, y, w: w * 0.7, h: 0.24, fontFace: "Libre Franklin", fontSize: 11, bold: true, color: colors.ink700 });
  }
  slide.addText(`${pct}%`, { x, y, w, h: 0.24, fontFace: "Libre Franklin", fontSize: 11, bold: true, color: colors.ink900, align: "right" });
  const barY = y + 0.3;
  const barH = 0.14;
  slide.addShape("roundRect", { x, y: barY, w, h: barH, rectRadius: barH / 2, fill: { color: colors.accent100 }, line: { type: "none" } });
  if (pct > 0) {
    slide.addShape("roundRect", { x, y: barY, w: Math.max((w * pct) / 100, barH), h: barH, rectRadius: barH / 2, fill: { color: colors.accent }, line: { type: "none" } });
  }
}

// Pill pequeño para badges de esquina (planning/09-visual-richness-and-content-density.md #2).
function addBadge(slide, text, { x, y, w, color, bg }) {
  const h = 0.26;
  slide.addShape("roundRect", { x, y, w, h, rectRadius: 0.13, fill: { color: bg }, line: { type: "none" } });
  slide.addText(text, { x, y, w, h, fontFace: "Libre Franklin", fontSize: 9, bold: true, color, align: "center", valign: "middle" });
}

export function addStatBlock(slide, stat, { x, y, w, valueSizePt, colors, accentColor, badge }) {
  let cursorY = y;
  if (badge) {
    addBadge(slide, badge, {
      x,
      y: cursorY,
      w: Math.min(w, 1.6),
      color: accentColor ? colors.juridicas700 : colors.ink700,
      bg: accentColor ? colors.juridicas100 : colors.ink200,
    });
    cursorY += 0.34;
  }

  const deltaColor = stat.deltaDirection === "down" ? colors.juridicas500 : colors.familia700;
  const runs = [{ text: stat.value, options: { fontSize: valueSizePt, bold: true, color: colors.accent } }];
  if (stat.delta) {
    const arrow = stat.deltaDirection === "down" ? "▾" : "▴";
    runs.push({ text: `  ${arrow} ${stat.delta}`, options: { fontSize: valueSizePt * 0.4, bold: true, color: deltaColor } });
  }
  if (accentColor) {
    slide.addShape("rect", { x: x - 0.08, y: cursorY, w: 0.04, h: valueSizePt / 54, fill: { color: accentColor }, line: { type: "none" } });
  }
  slide.addText(runs, { x, y: cursorY, w, h: valueSizePt / 54, fontFace: "Libre Franklin", valign: "bottom" });

  cursorY += valueSizePt / 54 + 0.05;
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

// Tarjeta de comparación con estado (planning/09-visual-richness-and-content-density.md
// #2): borde de acento izquierdo + badge de esquina + hasta 2 cifras + divisor + bullets.
export function addStatusCard(slide, { heading, badge, accent = "neutral", stats = [], points = [] }, { x, y, w, h, colors }) {
  const accentColor = accent === "alert" ? colors.juridicas500 : colors.accent;

  slide.addShape("rect", { x, y, w, h, fill: { color: colors.paper }, line: { color: colors.ink200, width: 0.75 } });
  slide.addShape("rect", { x, y, w: 0.06, h, fill: { color: accentColor }, line: { type: "none" } });

  const headingW = badge ? w - 2.0 : w - 0.5;
  slide.addText(heading, { x: x + 0.25, y: y + 0.2, w: headingW, h: 0.4, fontFace: "Libre Franklin", fontSize: 16, bold: true, color: colors.sabanaBlue });
  if (badge) {
    addBadge(slide, badge, {
      x: x + w - 1.65,
      y: y + 0.2,
      w: 1.4,
      color: accent === "alert" ? colors.juridicas700 : colors.ink700,
      bg: accent === "alert" ? colors.juridicas100 : colors.ink200,
    });
  }

  let cursorY = y + 0.75;
  if (stats.length) {
    const statW = (w - 0.5) / stats.length;
    stats.forEach((stat, i) => {
      addStatBlock(slide, stat, { x: x + 0.25 + i * statW, y: cursorY, w: statW - 0.15, valueSizePt: 24, colors });
    });
    if (stats.length === 2) {
      slide.addShape("line", { x: x + w / 2, y: cursorY, w: 0.001, h: 0.6, line: { color: colors.ink200, width: 0.75 } });
    }
    cursorY += 0.85;
  }

  if (points.length) {
    const bulletRuns = points.map((p) => ({ text: p, options: { bullet: { code: "2022" }, breakLine: true } }));
    slide.addText(bulletRuns, { x: x + 0.25, y: cursorY, w: w - 0.5, h: Math.max(0.3, y + h - cursorY - 0.15), fontFace: "Libre Franklin", fontSize: 12, color: colors.ink700 });
  }
}

// Franja de énfasis (planning/09-visual-richness-and-content-density.md #1).
export function addBanner(slide, { variant, text, label }, { x, y, w, h, colors }) {
  // ponytail: sin glyph de ícono en pptx — pptxgenjs no puede rasterizar SVG en
  // Node (mismo precedente ya aceptado en decor.mjs para brand-wave.svg);
  // label + color ya cargan el significado. Subir si se adopta un rasterizador (ej. sharp).
  const variants = {
    info: { bg: colors.sabanaBlueDeep, text: "FFFFFF", labelColor: "FFFFFF" },
    warning: { bg: colors.sabanaCream, text: colors.ink900, labelColor: colors.ctaGold700, accentBar: colors.ctaGold700 },
    highlight: { bg: colors.surfaceTint, text: colors.ink900, labelColor: colors.accentDark },
  };
  const v = variants[variant] || variants.highlight;

  slide.addShape("rect", { x, y, w, h, fill: { color: v.bg }, line: { type: "none" } });
  if (v.accentBar) {
    slide.addShape("rect", { x, y, w: 0.06, h, fill: { color: v.accentBar }, line: { type: "none" } });
  }

  const textX = x + (v.accentBar ? 0.35 : 0.3);
  const textW = w - (textX - x) - 0.3;
  let cursorY = y + (h - 0.35) / 2;
  if (label) {
    cursorY = y + 0.14;
    slide.addText(label.toUpperCase(), { x: textX, y: cursorY, w: textW, h: 0.22, fontFace: "Libre Franklin", fontSize: 10, bold: true, color: v.labelColor, charSpacing: 2 });
    cursorY += 0.28;
  }
  slide.addText(text, { x: textX, y: cursorY, w: textW, h: 0.4, fontFace: "Libre Franklin", fontSize: 14, bold: true, color: v.text, valign: "top" });
}
