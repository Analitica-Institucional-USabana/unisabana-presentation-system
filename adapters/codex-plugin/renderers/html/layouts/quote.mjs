import { SAFE } from "../constants.mjs";
import { box, escapeHtml } from "../elements.mjs";

export default function renderQuote(slide) {
  const boxes = [];
  boxes.push(
    box({
      x: SAFE.left,
      y: 250,
      width: 1000,
      style: "font-family:var(--font-sans);font-size:40px;font-weight:var(--fw-medium);line-height:var(--lh-snug);color:var(--text-on-dark);",
      html: `“${escapeHtml(slide.text)}”`,
    })
  );
  boxes.push(
    box({
      x: SAFE.left,
      y: 430,
      width: 900,
      style: "font-family:var(--font-sans);font-size:20px;font-weight:var(--fw-semibold);color:var(--sabana-blue-300);",
      html: `— ${escapeHtml(slide.attribution)}`,
    })
  );
  return { tone: "dark", backgroundCss: "background:var(--bg-inverse);", boxesHtml: boxes.join("") };
}
