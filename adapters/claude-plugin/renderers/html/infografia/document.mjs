// Ensambla el documento HTML autocontenido de una Infografía Spec.
// A diferencia de renderers/html/document.mjs (deck): el canvas NO es fijo
// (1280x720) — una infografía es un lienzo único cuya altura depende del
// contenido, así que el layout es flujo normal de documento (bloques
// apilados), no posicionamiento absoluto sobre un canvas de altura fija. Por
// eso no se reutiliza constants.mjs#CANVAS/SAFE ni text-measure.mjs: ese
// aparato existe específicamente para no desbordar un canvas fijo, algo que
// aquí no puede pasar (el documento simplemente crece).

import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileToDataUri, brandAssetDataUri } from "../embed.mjs";
import { escapeHtml } from "../elements.mjs";
import { iconMarkup } from "../icons.mjs";
import { resolvePlatform } from "../platform.mjs";
import { LOGO_HEIGHT_PX, LOGO_MIN_HEIGHT_PX } from "../constants.mjs";
import { MODULE_CHARTS } from "../charts/index.mjs";

// Mismo tamaño único de logo ya decidido para las 4 familias de slide
// (planning/10-numbering-footer-safety-logo-and-multiplatform-branding.md #4)
// — se reutiliza aquí en vez de inventar un tamaño nuevo para el artefacto.
const LOGO_HEIGHT = Math.max(LOGO_HEIGHT_PX.content, LOGO_MIN_HEIGHT_PX);

function loadJson(repoRoot, relPath) {
  return JSON.parse(readFileSync(join(repoRoot, relPath), "utf8"));
}

function buildFontFace(repoRoot) {
  const path = join(repoRoot, "core/brand/fonts/LibreFranklin-variable-latin.woff2");
  const dataUri = fileToDataUri(path);
  return `@font-face{font-family:'Libre Franklin';font-style:normal;font-weight:100 900;font-display:swap;src:url(${dataUri}) format('woff2');}`;
}

function accentToneColor(tone) {
  switch (tone) {
    case "alert":
      return "var(--fac-juridicas-500)";
    case "secondary":
      return "var(--accent-mid)";
    case "neutral":
      return "var(--ink-500)";
    case "primary":
    default:
      return "var(--accent)";
  }
}

function headerBlock(infografia, repoRoot, widthPx) {
  const logoUri = brandAssetDataUri(repoRoot, "assets/logo-horizontal-color.png");
  let coBrandHtml = "";
  if (infografia.coBrand) {
    const cb = infografia.coBrand;
    const cbHeight = Math.round(LOGO_HEIGHT * 0.6); // core/brand/rules/cobrand.json#/logo/maxHeightRelativeToPrimary
    const cbPath = resolve(process.cwd(), cb.logoAsset);
    if (existsSync(cbPath)) {
      const cbUri = fileToDataUri(cbPath);
      coBrandHtml = `<img src="${cbUri}" alt="${escapeHtml(cb.institutionName)}" style="height:${cbHeight}px;width:auto;margin-left:20px;align-self:center" />`;
    } else {
      coBrandHtml = `<span style="margin-left:20px;align-self:center;font-family:var(--font-sans);font-size:13px;color:var(--fac-juridicas-500)">[co-marca: ${escapeHtml(cb.institutionName)} — logo no encontrado en ${escapeHtml(cb.logoAsset)}]</span>`;
    }
  }
  return `<div style="display:flex;align-items:center;margin-bottom:28px">
    <img src="${logoUri}" alt="Universidad de La Sabana" style="height:${LOGO_HEIGHT}px;width:auto;display:block" />
    ${coBrandHtml}
  </div>
  <div style="font-family:var(--font-sans);font-size:40px;font-weight:var(--fw-black);letter-spacing:var(--ls-heading);line-height:var(--lh-heading);color:var(--text-strong);max-width:${widthPx}px">${escapeHtml(infografia.title)}</div>
  ${infografia.subtitle ? `<div style="font-family:var(--font-sans);font-size:20px;font-weight:var(--fw-medium);color:var(--text-muted);margin-top:10px">${escapeHtml(infografia.subtitle)}</div>` : ""}`;
}

function keyNumberCard(item, repoRoot, index, cardWidth) {
  const iconHtml = iconMarkup(repoRoot, item.icon, { sizePx: 26, color: accentToneColor(item.accent) });
  const deltaHtml = item.delta
    ? `<span style="font-size:14px;font-weight:var(--fw-bold);color:${item.deltaDirection === "down" ? "var(--fac-juridicas-500)" : "var(--fac-familia-700)"};margin-left:6px">${item.deltaDirection === "down" ? "▾" : "▴"} ${escapeHtml(item.delta)}</span>`
    : "";
  return `<div style="width:${cardWidth}px;box-sizing:border-box;background:var(--paper);border:1px solid var(--border-subtle);border-left:4px solid ${accentToneColor(item.accent)};border-radius:var(--radius-md);padding:18px">
    <div style="margin-bottom:10px">${iconHtml}</div>
    <div style="font-family:var(--font-sans);font-size:38px;font-weight:var(--fw-black);color:var(--text-strong);line-height:1">${escapeHtml(item.value)}<span style="font-size:16px;font-weight:var(--fw-semibold);color:var(--text-muted);margin-left:4px">${escapeHtml(item.unit)}</span>${deltaHtml}</div>
    <div style="font-family:var(--font-sans);font-size:15px;font-weight:var(--fw-medium);color:var(--text-body);margin-top:6px">${escapeHtml(item.descriptor)}</div>
  </div>`;
}

function keyNumbersBlock(keyNumbers, repoRoot, widthPx) {
  const gap = 16;
  const n = keyNumbers.length;
  const perRow = Math.min(n, 3);
  const cardWidth = (widthPx - gap * (perRow - 1)) / perRow;
  const cards = keyNumbers.map((item, i) => keyNumberCard(item, repoRoot, i, cardWidth)).join("");
  return `<div style="display:flex;flex-wrap:wrap;gap:${gap}px;margin:32px 0">${cards}</div>`;
}

function moduleBlock(module, repoRoot, widthPx, bodyPx) {
  const chartFn = MODULE_CHARTS[module.type];
  if (!chartFn) throw new Error(`Tipo de módulo sin renderer de gráfica: ${module.type}`);
  const { html } = chartFn(module, { widthPx, repoRoot });
  const sourceHtml = module.source
    ? `<div style="font-family:var(--font-sans);font-size:13px;color:var(--text-muted);margin-top:10px">Fuente: ${escapeHtml(module.source)}</div>`
    : "";
  return `<div style="margin-bottom:40px">
    <div data-body-copy="1" style="font-family:var(--font-sans);font-size:${bodyPx}px;font-weight:var(--fw-bold);color:var(--text-strong);margin-bottom:16px">${escapeHtml(module.title)}</div>
    ${html}
    ${sourceHtml}
  </div>`;
}

function conclusionsBlock(conclusions, bodyPx) {
  const items = conclusions
    .map((c) => `<div data-body-copy="1" style="font-family:var(--font-sans);font-size:${bodyPx}px;line-height:var(--lh-body);color:var(--text-body);margin-bottom:8px">• ${escapeHtml(c)}</div>`)
    .join("");
  return `<div style="background:var(--surface-tint);border-radius:var(--radius-md);padding:24px;margin-bottom:32px">
    <div style="font-family:var(--font-sans);font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:var(--ls-label);color:var(--accent-dark);margin-bottom:12px">Conclusiones</div>
    ${items}
  </div>`;
}

function sourcesBlock(sources, bodyPx) {
  const parts = [`Desarrollado por: ${escapeHtml(sources.developedBy)}`];
  if (sources.dataSource) parts.push(`Fuente de datos: ${escapeHtml(sources.dataSource)}`);
  if (sources.period) parts.push(`Periodo: ${escapeHtml(sources.period)}`);
  return `<div style="border-top:1px solid var(--border-subtle);padding-top:16px;margin-top:24px;font-family:var(--font-sans);font-size:13px;color:var(--text-muted)">${parts.join(" · ")}</div>`;
}

function aiDisclosureFooter(repoRoot) {
  const platform = resolvePlatform(repoRoot);
  let logoHtml = "";
  if (platform.logoAsset) {
    const uri = brandAssetDataUri(repoRoot, platform.logoAsset);
    logoHtml = `<img src="${uri}" alt="${platform.name}" style="height:17px;width:auto" />`;
  }
  return `<div style="display:flex;justify-content:flex-end;align-items:center;gap:8px;margin-top:24px;font-family:var(--font-sans);font-size:14px;color:var(--text-muted)">
    <span>${platform.attributionText}</span>${logoHtml}
  </div>`;
}

export function buildInfografiaDocument(spec, { repoRoot }) {
  const { infografia, modules } = spec;
  const canvasRules = loadJson(repoRoot, "core/brand/rules/infografia-canvas.json");
  const profile = canvasRules.profiles[infografia.format];
  const bodyPx = canvasRules.minBodyPxByMedium[infografia.medium] ?? 16;
  const widthPx = profile.widthPx - profile.safeMargin.x * 2;

  const tokensCss = readFileSync(join(repoRoot, "core/brand/tokens.css"), "utf8");
  const fontFace = buildFontFace(repoRoot);
  const facultyAttr = infografia.palette !== "institutional" ? ` data-faculty="${infografia.palette}"` : "";

  let body = headerBlock(infografia, repoRoot, widthPx);
  body += keyNumbersBlock(infografia.keyNumbers, repoRoot, widthPx);
  body += modules.map((m) => moduleBlock(m, repoRoot, widthPx, bodyPx)).join("");
  if (infografia.conclusions) body += conclusionsBlock(infografia.conclusions, bodyPx);
  body += sourcesBlock(infografia.sources, bodyPx);
  body += aiDisclosureFooter(repoRoot);

  return `<!doctype html>
<html lang="es-CO">
<head>
<meta charset="utf-8">
<title>${escapeHtml(infografia.title)}</title>
<style>
${fontFace}
${tokensCss}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#e5e5e5;display:flex;justify-content:center;padding:24px;}
.infografia{background:var(--bg-page);box-shadow:0 4px 24px rgba(0,0,0,0.15);}
</style>
</head>
<body>
<div class="infografia"${facultyAttr} style="width:${profile.widthPx}px;padding:${profile.safeMargin.y}px ${profile.safeMargin.x}px;">
${body}
</div>
</body>
</html>
`;
}
