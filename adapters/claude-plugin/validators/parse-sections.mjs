// Extrae cada <section class="slide" id="..." data-tone="..."> del HTML generado
// por renderers/html/document.mjs. Regex deliberadamente acoplado a esa forma
// exacta de salida — validar HTML arbitrario de terceros es una capacidad de
// madurez posterior (ver planning/04-mvp-definition.md, fuera de alcance del MVP).

const SECTION_RE = /<section class="slide" id="([^"]+)" data-tone="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g;

export function parseSlideSections(html) {
  const sections = [];
  for (const match of html.matchAll(SECTION_RE)) {
    sections.push({ id: match[1], tone: match[2], content: match[3] });
  }
  return sections;
}
