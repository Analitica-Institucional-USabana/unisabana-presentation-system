// Red de seguridad determinista (planning/10-numbering-footer-safety-logo-and-
// multiplatform-branding.md #2, Capa B): si algún elemento de contenido con
// altura EXPLÍCITA (tarjetas, banners, barras de progreso, tarjetas de
// agenda) termina más abajo que el límite inferior de contentBand() para la
// familia de esa slide (renderers/html/constants.mjs — fuente única de
// verdad, ya usada por los propios layouts para centrar contenido), se marca
// como error en vez de dejarlo pasar en silencio.
//
// Alcance deliberadamente limitado (best-effort, no reemplaza medir el DOM
// real — D-18 sigue sin adoptarse): solo detecta cajas con `height` explícito
// en el HTML renderizado. Texto de flujo natural sin altura fija (párrafos,
// celdas de <table>) queda fuera — la Capa A (estimateBlockHeightPx en cada
// layout) es la primera línea de defensa para esos casos; esta regla es el
// backstop que falla la validación cuando la Capa A se queda corta, no un
// sustituto de medirlos.

import { CANVAS, contentBand, slideFamilyFor } from "../../renderers/html/constants.mjs";
import { parseSlideSections } from "../parse-sections.mjs";

const BOX_RE = /position:absolute;left:(-?\d+)px;top:(-?\d+)px;(?:width:(\d+)px;)?(?:height:(\d+)px;)?/g;

export function checkFooterOverflow(html, deck, _ctx, reportsById) {
  const typeById = new Map(deck.slides.map((s) => [s.id, s.type]));
  const sections = parseSlideSections(html);

  for (const { id, content } of sections) {
    const r = reportsById.get(id);
    if (!r) continue;

    const family = slideFamilyFor(typeById.get(id));
    const { bottom } = contentBand(family);
    // El pie fijo (logo/atribución IA/numeración) vive deliberadamente en la
    // banda del pie — solo se escanea el contenido antes del marcador.
    const [contentHtml] = content.split("<!--CONTENT_END-->");

    let worstOverflowPx = 0;
    for (const match of contentHtml.matchAll(BOX_RE)) {
      // Grupos: 1=left (no usado), 2=top, 3=width, 4=height.
      const top = Number(match[2]);
      const width = match[3] != null ? Number(match[3]) : null;
      const height = match[4] != null ? Number(match[4]) : null;
      if (height == null) continue;
      // Decoración de fondo a canvas completo (ej. decor.mjs#waveOverlay:
      // x:0,y:0,width:CANVAS.width,height:CANVAS.height, opacity baja,
      // pointer-events:none) no es "contenido" que pueda solaparse con el
      // pie — se excluye explícitamente en vez de marcarla como desborde.
      if (width === CANVAS.width && height === CANVAS.height) continue;
      const boxBottom = top + height;
      if (boxBottom > bottom) worstOverflowPx = Math.max(worstOverflowPx, boxBottom - bottom);
    }

    if (worstOverflowPx > 0) {
      r.add(
        "error",
        `Desborde hacia el pie de página: un elemento con altura explícita termina ${Math.round(worstOverflowPx)}px por debajo del límite de contentBand() (bottom=${bottom}px) — riesgo de solape con la atribución IA o la numeración.`
      );
    } else {
      r.add("pass", "Ningún elemento de contenido con altura explícita invade la banda del pie de página.");
    }
  }
}
