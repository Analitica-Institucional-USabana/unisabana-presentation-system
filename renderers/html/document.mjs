import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CANVAS } from "./constants.mjs";
import { fileToDataUri } from "./embed.mjs";
import { logoBox } from "./logo.mjs";
import { aiDisclosureBox } from "./ai-disclosure.mjs";
import { pageNumberBox } from "./page-number.mjs";

import renderCover from "./layouts/cover.mjs";
import renderAgenda from "./layouts/agenda.mjs";
import renderSeparator from "./layouts/separator.mjs";
import renderMessage from "./layouts/message.mjs";
import renderData from "./layouts/data.mjs";
import renderComparison from "./layouts/comparison.mjs";
import renderProcess from "./layouts/process.mjs";
import renderTable from "./layouts/table.mjs";
import renderQuote from "./layouts/quote.mjs";
import renderClosing from "./layouts/closing.mjs";

const LAYOUTS = {
  cover: renderCover,
  agenda: renderAgenda,
  separator: renderSeparator,
  message: renderMessage,
  data: renderData,
  comparison: renderComparison,
  process: renderProcess,
  table: renderTable,
  quote: renderQuote,
  closing: renderClosing,
};

function buildFontFace(repoRoot) {
  const path = join(repoRoot, "core/brand/fonts/LibreFranklin-variable-latin.woff2");
  const dataUri = fileToDataUri(path);
  // Fuente variable (core/brand/tokens.json#/fonts/libreFranklin/localVariableFont):
  // un único archivo cubre los pesos 100-900 vía el eje 'wght'.
  return `@font-face{font-family:'Libre Franklin';font-style:normal;font-weight:100 900;font-display:swap;src:url(${dataUri}) format('woff2');}`;
}

export function buildDocument(deck, { repoRoot }) {
  const tokensCss = readFileSync(join(repoRoot, "core/brand/tokens.css"), "utf8");
  const fontFace = buildFontFace(repoRoot);
  const facultyAttr = deck.presentation.palette !== "institutional" ? ` data-faculty="${deck.presentation.palette}"` : "";

  const slidesHtml = deck.slides
    .map((slide, i) => {
      const layoutFn = LAYOUTS[slide.type];
      if (!layoutFn) throw new Error(`Tipo de slide sin layout de renderer: ${slide.type}`);
      const { tone, backgroundCss, boxesHtml } = layoutFn(slide, { repoRoot, presentation: deck.presentation });
      const logo = logoBox(repoRoot, slide.type, tone);
      const aiDisclosure = aiDisclosureBox(repoRoot, tone);
      const pageNumber = pageNumberBox(i + 1, deck.slides.length, tone);
      // El comentario delimita dónde termina el contenido de la slide y
      // empieza el "chrome" fijo (logo/atribución IA/numeración), que vive
      // deliberadamente en la banda del pie — validators/rules/footer-
      // overflow.mjs lo usa para no confundir esas cajas con desbordes reales.
      return `<section class="slide" id="${slide.id}" data-tone="${tone}"${facultyAttr} style="position:relative;width:${CANVAS.width}px;height:${CANVAS.height}px;overflow:hidden;${backgroundCss}">${boxesHtml}<!--CONTENT_END-->${logo}${aiDisclosure}${pageNumber}</section>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="es-CO">
<head>
<meta charset="utf-8">
<title>${deck.presentation.title.replace(/</g, "&lt;")}</title>
<style>
${fontFace}
${tokensCss}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#e5e5e5;display:flex;flex-direction:column;align-items:center;gap:24px;padding:24px;}
.slide{flex-shrink:0;box-shadow:0 4px 24px rgba(0,0,0,0.15);}
</style>
</head>
<body>
${slidesHtml}
</body>
</html>
`;
}
