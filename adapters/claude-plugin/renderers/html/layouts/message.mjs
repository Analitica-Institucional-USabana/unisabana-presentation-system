import { SAFE } from "../constants.mjs";
import { title, bodyText } from "../elements.mjs";

export default function renderMessage(slide) {
  const boxes = [];
  boxes.push(title(slide.title, { x: SAFE.left, y: 260, width: 1000, sizePx: 56 }));
  if (slide.supporting) {
    boxes.push(bodyText(slide.supporting, { x: SAFE.left, y: 260 + Math.round(56 * 1.15) + 24, width: 900, sizePx: 24 }));
  }
  return { tone: "light", backgroundCss: "background:var(--bg-page);", boxesHtml: boxes.join("") };
}
