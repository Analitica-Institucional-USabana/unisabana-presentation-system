import { SAFE } from "../constants.mjs";
import { title, bodyText } from "../elements.mjs";

export default function renderClosing(slide) {
  const boxes = [];
  boxes.push(title(slide.title, { x: SAFE.left, y: 280, width: 1000, sizePx: 52, color: "var(--text-on-dark)" }));
  if (slide.contact) {
    boxes.push(bodyText(slide.contact, { x: SAFE.left, y: 380, width: 800, sizePx: 20, color: "var(--sabana-blue-300)" }));
  }
  return { tone: "dark", backgroundCss: "background:var(--bg-inverse);", boxesHtml: boxes.join("") };
}
