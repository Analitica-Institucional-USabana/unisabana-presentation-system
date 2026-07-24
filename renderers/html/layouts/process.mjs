import { CANVAS, SAFE, TYPE_SCALE_PX } from "../constants.mjs";
import { box, title, escapeHtml } from "../elements.mjs";

export default function renderProcess(slide) {
  const boxes = [];
  const titleY = SAFE.top + 40;
  boxes.push(title(slide.title, { x: SAFE.left, y: titleY, width: CANVAS.width - SAFE.left - SAFE.right, sizePx: TYPE_SCALE_PX.slideTitle }));

  const stepsY = titleY + Math.round(TYPE_SCALE_PX.slideTitle * 1.15) + 100;
  const n = slide.steps.length;
  const availWidth = CANVAS.width - SAFE.left - SAFE.right;
  const stepWidth = availWidth / n;
  const circleSize = 48;
  const circleCenterY = stepsY + circleSize / 2;

  // Línea conectora, primero en el orden del documento para quedar detrás de los círculos.
  boxes.push(
    box({
      x: SAFE.left + stepWidth / 2,
      y: circleCenterY - 1,
      width: availWidth - stepWidth,
      height: 2,
      style: "background:var(--border-subtle);",
    })
  );

  slide.steps.forEach((step, i) => {
    const cx = SAFE.left + i * stepWidth + stepWidth / 2 - circleSize / 2;
    boxes.push(
      box({
        x: cx,
        y: stepsY,
        width: circleSize,
        height: circleSize,
        style: "background:var(--accent);border-radius:var(--radius-pill);display:flex;align-items:center;justify-content:center;font-family:var(--font-sans);font-weight:var(--fw-bold);color:var(--paper);font-size:18px;",
        html: String(i + 1),
      })
    );
    boxes.push(
      box({
        x: SAFE.left + i * stepWidth,
        y: stepsY + circleSize + 16,
        width: stepWidth - 12,
        style: "font-family:var(--font-sans);text-align:center;",
        html: `<div style="font-size:18px;font-weight:var(--fw-semibold);color:var(--text-strong);">${escapeHtml(step.label)}</div>${
          step.description ? `<div style="font-size:14px;color:var(--text-muted);margin-top:4px;">${escapeHtml(step.description)}</div>` : ""
        }`,
      })
    );
  });

  return { tone: "light", backgroundCss: "background:var(--bg-page);", boxesHtml: boxes.join("") };
}
