import { SAFE, TYPE_SCALE_PX, centeredContentY } from "../constants.mjs";
import { box, title, escapeHtml } from "../elements.mjs";
import { estimateBlockHeightPx } from "../text-measure.mjs";

const ROW_HEIGHT = 64;

export default function renderAgenda(slide) {
  const titleText = slide.title || "Agenda";
  const titleHeight = estimateBlockHeightPx(titleText, { sizePx: TYPE_SCALE_PX.slideTitle, widthPx: 700, weight: "black" });
  const itemsHeight = slide.items.length * ROW_HEIGHT;
  const contentHeight = titleHeight + 48 + itemsHeight;

  let y = centeredContentY("content", contentHeight);
  const boxes = [];
  boxes.push(title(titleText, { x: SAFE.left, y, width: 700, sizePx: TYPE_SCALE_PX.slideTitle }));
  y += titleHeight + 48;

  for (let i = 0; i < slide.items.length; i++) {
    const num = String(i + 1).padStart(2, "0");
    boxes.push(
      box({
        x: SAFE.left,
        y,
        width: 900,
        style: "display:flex;align-items:center;gap:20px;font-family:var(--font-sans);",
        html: `<span style="font-size:28px;font-weight:var(--fw-black);color:var(--accent);min-width:52px;">${num}</span><span style="font-size:22px;font-weight:var(--fw-medium);color:var(--text-strong);">${escapeHtml(slide.items[i])}</span>`,
      })
    );
    y += ROW_HEIGHT;
  }

  return { tone: "light", backgroundCss: "background:var(--bg-page);", boxesHtml: boxes.join("") };
}
