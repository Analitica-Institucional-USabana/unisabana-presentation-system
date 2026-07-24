import { CANVAS, SAFE, TYPE_SCALE_PX, BANNER_HEIGHT_PX, BANNER_GAP_PX, centeredContentY } from "../constants.mjs";
import { box, title, escapeHtml, banner } from "../elements.mjs";
import { estimateBlockHeightPx } from "../text-measure.mjs";
import { iconMarkup } from "../icons.mjs";

export default function renderProcess(slide, { repoRoot } = {}) {
  const boxes = [];
  const titleWidth = CANVAS.width - SAFE.left - SAFE.right;
  const titleHeight = estimateBlockHeightPx(slide.title, { sizePx: TYPE_SCALE_PX.slideTitle, widthPx: titleWidth, weight: "black" });

  const n = slide.steps.length;
  const availWidth = CANVAS.width - SAFE.left - SAFE.right;
  const stepWidth = availWidth / n;
  const circleSize = 48;

  const labelBlockHeight = Math.max(
    ...slide.steps.map((step) => {
      const labelH = estimateBlockHeightPx(step.label, { sizePx: 18, widthPx: stepWidth - 12, weight: "semibold", lineHeight: 1.3 });
      const descH = step.description
        ? 4 + estimateBlockHeightPx(step.description, { sizePx: 14, widthPx: stepWidth - 12, weight: "regular", lineHeight: 1.3 })
        : 0;
      return labelH + descH;
    })
  );
  const stepsGap = 64;
  const stepBlockHeight = circleSize + 16 + labelBlockHeight;
  const bannerBlockHeight = slide.banner ? BANNER_GAP_PX + BANNER_HEIGHT_PX : 0;
  const contentHeight = titleHeight + stepsGap + stepBlockHeight + bannerBlockHeight;

  const titleY = centeredContentY("content", contentHeight);
  boxes.push(title(slide.title, { x: SAFE.left, y: titleY, width: titleWidth, sizePx: TYPE_SCALE_PX.slideTitle }));

  const stepsY = titleY + titleHeight + stepsGap;
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
        html: `<div style="font-size:18px;font-weight:var(--fw-semibold);line-height:1.3;color:var(--text-strong);">${escapeHtml(step.label)}</div>${
          step.description ? `<div style="font-size:14px;line-height:1.3;color:var(--text-muted);margin-top:4px;">${escapeHtml(step.description)}</div>` : ""
        }`,
      })
    );
  });

  if (slide.banner) {
    const iconHtml = slide.banner.icon ? iconMarkup(repoRoot, slide.banner.icon, { sizePx: 28 }) : undefined;
    const bannerY = stepsY + stepBlockHeight + BANNER_GAP_PX;
    boxes.push(banner({ ...slide.banner, iconHtml }, { x: SAFE.left, y: bannerY, width: availWidth, height: BANNER_HEIGHT_PX }));
  }

  return { tone: "light", backgroundCss: "background:var(--bg-page);", boxesHtml: boxes.join("") };
}
