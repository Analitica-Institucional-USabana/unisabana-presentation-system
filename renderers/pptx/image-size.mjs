// pptxgenjs necesita w Y h explícitos para posicionar una imagen — a diferencia
// del renderer HTML, donde el navegador preserva el aspect ratio solo con
// `height` fijado. Aquí leemos las dimensiones reales del archivo (sin añadir
// una dependencia solo para esto) para calcular el ancho a partir del alto deseado.

import { readFileSync } from "node:fs";
import { extname } from "node:path";

function pngSize(buf) {
  // IHDR: 8 bytes de firma + 4 (length) + 4 ("IHDR") + width(4) + height(4)
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function svgSize(buf) {
  const text = buf.toString("utf8");
  const viewBox = text.match(/viewBox="[\d.\s-]*?\s([\d.]+)\s+([\d.]+)"/);
  if (viewBox) return { width: parseFloat(viewBox[1]), height: parseFloat(viewBox[2]) };
  const w = text.match(/width="([\d.]+)/);
  const h = text.match(/height="([\d.]+)/);
  if (w && h) return { width: parseFloat(w[1]), height: parseFloat(h[1]) };
  throw new Error("No se pudo determinar el tamaño del SVG (sin viewBox ni width/height).");
}

export function getImageSize(path) {
  const buf = readFileSync(path);
  const ext = extname(path).toLowerCase();
  if (ext === ".png") return pngSize(buf);
  if (ext === ".svg") return svgSize(buf);
  throw new Error(`getImageSize: extensión no soportada (${ext})`);
}

export function widthForHeight(path, height) {
  const { width, height: h } = getImageSize(path);
  return height * (width / h);
}
