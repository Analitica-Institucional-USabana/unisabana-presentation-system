import { SAFE, TYPE_SCALE_PX } from "../constants.mjs";
import { title, bodyText } from "../elements.mjs";

export default function renderSeparator(slide) {
  const boxes = [];
  let y = 220;

  if (slide.sectionNumber != null) {
    boxes.push(title(String(slide.sectionNumber), { x: SAFE.left, y, sizePx: 96, color: "var(--sabana-blue-300)" }));
    y += 130;
  }
  boxes.push(title(slide.title, { x: SAFE.left, y, width: 900, sizePx: TYPE_SCALE_PX.sectionTitle, color: "var(--text-on-dark)" }));
  y += Math.round(TYPE_SCALE_PX.sectionTitle * 1.15) + 20;

  if (slide.descriptor) {
    boxes.push(bodyText(slide.descriptor, { x: SAFE.left, y, width: 800, sizePx: 20, color: "var(--sabana-blue-300)" }));
  }

  return { tone: "dark", backgroundCss: "background:var(--bg-inverse);", boxesHtml: boxes.join("") };
}
