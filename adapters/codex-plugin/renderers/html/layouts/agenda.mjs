import { SAFE, TYPE_SCALE_PX } from "../constants.mjs";
import { box, title, escapeHtml } from "../elements.mjs";

export default function renderAgenda(slide) {
  const boxes = [];
  const titleText = slide.title || "Agenda";
  boxes.push(title(titleText, { x: SAFE.left, y: SAFE.top + 40, width: 700, sizePx: TYPE_SCALE_PX.slideTitle }));

  let y = SAFE.top + 40 + Math.round(TYPE_SCALE_PX.slideTitle * 1.15) + 48;
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
    y += 64;
  }

  return { tone: "light", backgroundCss: "background:var(--bg-page);", boxesHtml: boxes.join("") };
}
