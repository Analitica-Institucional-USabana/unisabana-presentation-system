import {
  CANVAS,
  SAFE,
  TYPE_SCALE_PX,
  BANNER_HEIGHT_PX,
  BANNER_GAP_PX,
  PROGRESS_HEIGHT_PX,
  PROGRESS_GAP_PX,
  centeredContentY,
} from "../constants.mjs";
import { box, title, surfaceStyle, escapeHtml, banner, progressBar } from "../elements.mjs";
import { estimateBlockHeightPx } from "../text-measure.mjs";
import { iconMarkup } from "../icons.mjs";

export default function renderProcess(slide, { repoRoot } = {}) {
  const titleWidth = CANVAS.width - SAFE.left - SAFE.right;
  const titleHeight = estimateBlockHeightPx(slide.title, { sizePx: TYPE_SCALE_PX.slideTitle, widthPx: titleWidth, weight: "black" });
  const ctx = { repoRoot, titleWidth, titleHeight, availWidth: titleWidth };

  const layout = slide.layout || "steps";
  const boxes =
    layout === "gantt" ? renderGantt(slide, ctx) : layout === "alternating" ? renderAlternating(slide, ctx) : renderSteps(slide, ctx);

  const backgroundCss = slide.background === "tinted" ? "background:var(--surface-tint);" : "background:var(--bg-page);";
  return { tone: "light", backgroundCss, boxesHtml: boxes.join("") };
}

// Bloque compartido de banner/progreso, apilado al final de cualquiera de los
// 3 modos — evita que un Deck Spec válido (banner/progress no dependen de
// `layout` en el schema) se renderice silenciosamente sin ese contenido.
function bannerAndProgressHeight(slide) {
  let h = 0;
  if (slide.banner) h += BANNER_GAP_PX + BANNER_HEIGHT_PX;
  if (slide.progress) h += PROGRESS_GAP_PX + PROGRESS_HEIGHT_PX;
  return h;
}

function pushBannerAndProgress(boxes, slide, { repoRoot, x, y, width }) {
  let cursorY = y;
  if (slide.banner) {
    const iconHtml = slide.banner.icon ? iconMarkup(repoRoot, slide.banner.icon, { sizePx: 28 }) : undefined;
    boxes.push(banner({ ...slide.banner, iconHtml }, { x, y: cursorY, width, height: BANNER_HEIGHT_PX }));
    cursorY += BANNER_HEIGHT_PX + BANNER_GAP_PX;
  }
  if (slide.progress) {
    boxes.push(progressBar(slide.progress, { x, y: cursorY, width, height: PROGRESS_HEIGHT_PX }));
  }
}

// ---- layout: "steps" (por defecto — círculos numerados + línea conectora) ----
function renderSteps(slide, { repoRoot, titleWidth, titleHeight, availWidth }) {
  const n = slide.steps.length;
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
  const extraHeight = bannerAndProgressHeight(slide);
  const contentHeight = titleHeight + stepsGap + stepBlockHeight + (extraHeight ? BANNER_GAP_PX + extraHeight : 0);

  const titleY = centeredContentY("content", contentHeight);
  const boxes = [title(slide.title, { x: SAFE.left, y: titleY, width: titleWidth, sizePx: TYPE_SCALE_PX.slideTitle })];

  const stepsY = titleY + titleHeight + stepsGap;
  const circleCenterY = stepsY + circleSize / 2;

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
        style:
          "background:var(--accent);border-radius:var(--radius-pill);display:flex;align-items:center;justify-content:center;font-family:var(--font-sans);font-weight:var(--fw-bold);color:var(--paper);font-size:18px;",
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

  if (extraHeight) {
    pushBannerAndProgress(boxes, slide, { repoRoot, x: SAFE.left, y: stepsY + stepBlockHeight + BANNER_GAP_PX, width: availWidth });
  }

  return boxes;
}

// ---- layout: "alternating" (planning/09-visual-richness-and-content-density.md
// #5): tarjetas en zigzag arriba/abajo de la línea, insignia de ícono, eyebrow
// "HITO N", marcador "estamos acá" en el paso con step.current === true ----
function renderAlternating(slide, { repoRoot, titleWidth, titleHeight, availWidth }) {
  const steps = slide.steps;
  const n = steps.length;
  const stepWidth = availWidth / n;
  const badgeSize = 44;
  const cardPadding = 16;
  const cardWidth = stepWidth - 24;
  const innerWidth = cardWidth - cardPadding * 2;

  const cardHeight = Math.max(
    ...steps.map((step) => {
      const labelH = estimateBlockHeightPx(step.label, { sizePx: 16, widthPx: innerWidth, weight: "bold", lineHeight: 1.25 });
      const descH = step.description ? 4 + estimateBlockHeightPx(step.description, { sizePx: 13, widthPx: innerWidth, weight: "regular", lineHeight: 1.25 }) : 0;
      return badgeSize + 10 + 16 + 4 + labelH + descH + cardPadding * 2;
    })
  );

  const stepsGap = 56;
  const gapAroundLine = 28;
  const extraHeight = bannerAndProgressHeight(slide);
  const contentHeight = titleHeight + stepsGap + cardHeight * 2 + gapAroundLine * 2 + (extraHeight ? BANNER_GAP_PX + extraHeight : 0);

  const titleY = centeredContentY("content", contentHeight);
  const boxes = [title(slide.title, { x: SAFE.left, y: titleY, width: titleWidth, sizePx: TYPE_SCALE_PX.slideTitle })];

  const topCardY = titleY + titleHeight + stepsGap;
  const lineY = topCardY + cardHeight + gapAroundLine;
  const bottomCardY = lineY + gapAroundLine;

  boxes.push(box({ x: SAFE.left + stepWidth / 2, y: lineY - 1, width: availWidth - stepWidth, height: 2, style: "background:var(--border-subtle);" }));

  steps.forEach((step, i) => {
    const above = i % 2 === 0;
    const cx = SAFE.left + i * stepWidth + stepWidth / 2;
    const cardX = cx - cardWidth / 2;
    const cardY = above ? topCardY : bottomCardY;

    boxes.push(box({ x: cx - 6, y: lineY - 6, width: 12, height: 12, style: "background:var(--accent);border-radius:var(--radius-pill);border:2px solid var(--paper);" }));

    const iconHtml = step.icon
      ? `<span style="display:flex;align-items:center;justify-content:center;">${iconMarkup(repoRoot, step.icon, { sizePx: 22, color: "var(--paper)" })}</span>`
      : "";
    const inner =
      `<div style="${surfaceStyle()}padding:${cardPadding}px;height:100%;box-sizing:border-box;font-family:var(--font-sans);">` +
      `<div style="width:${badgeSize}px;height:${badgeSize}px;border-radius:var(--radius-md);background:var(--accent);display:flex;align-items:center;justify-content:center;margin-bottom:10px;">${iconHtml}</div>` +
      `<div style="font-size:12px;font-weight:var(--fw-semibold);letter-spacing:var(--ls-label);text-transform:uppercase;color:var(--accent-dark);margin-bottom:4px;">HITO ${i + 1}</div>` +
      `<div style="font-size:16px;font-weight:var(--fw-bold);color:var(--text-strong);line-height:1.25;">${escapeHtml(step.label)}</div>` +
      (step.description ? `<div style="font-size:13px;color:var(--text-muted);margin-top:4px;line-height:1.25;">${escapeHtml(step.description)}</div>` : "") +
      `</div>`;
    boxes.push(box({ x: cardX, y: cardY, width: cardWidth, height: cardHeight, html: inner }));

    if (step.current) {
      const bubbleW = 108;
      const bubbleY = above ? lineY + 12 : lineY - 12 - 22;
      boxes.push(
        box({
          x: cx - bubbleW / 2,
          y: bubbleY,
          width: bubbleW,
          height: 22,
          style:
            "background:var(--fac-cta-700);color:var(--paper);border-radius:var(--radius-pill);display:flex;align-items:center;justify-content:center;font-family:var(--font-sans);font-size:10px;font-weight:var(--fw-bold);letter-spacing:0.04em;text-transform:uppercase;",
          html: "Estamos aquí",
        })
      );
      boxes.push(box({ x: cx - 9, y: lineY - 9, width: 18, height: 18, style: "background:var(--fac-cta-700);border-radius:var(--radius-pill);border:3px solid var(--paper);" }));
    }
  });

  if (extraHeight) {
    pushBannerAndProgress(boxes, slide, { repoRoot, x: SAFE.left, y: bottomCardY + cardHeight + BANNER_GAP_PX, width: availWidth });
  }

  return boxes;
}

// ---- layout: "gantt" (planning/09-visual-richness-and-content-density.md #4):
// carriles horizontales + eje de fechas + marcador "estamos acá" + hitos ----
const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DAY_MS = 1000 * 60 * 60 * 24;

function parseGanttDate(str) {
  const iso = str.length === 7 ? `${str}-01` : str;
  return new Date(`${iso}T00:00:00Z`).getTime();
}

function formatGanttDate(ms) {
  const d = new Date(ms);
  return `${MONTHS_ES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

const LANE_LABEL_WIDTH = 190;
const LANE_ROW_HEIGHT = 46;
const LANE_BAR_HEIGHT = 24;
const AXIS_TICK_COUNT = 4;
const AXIS_AREA_HEIGHT = 32;
const MILESTONE_AREA_HEIGHT = 44;
const TODAY_MARKER_TOP_PAD = 40;

function renderGantt(slide, { repoRoot, titleWidth, titleHeight, availWidth }) {
  const lanes = slide.lanes;
  const milestones = slide.milestones || [];
  const asOfMs = parseGanttDate(slide.asOf);
  const allDates = [...lanes.flatMap((l) => [parseGanttDate(l.start), parseGanttDate(l.end)]), ...milestones.map((m) => parseGanttDate(m.date)), asOfMs];
  const rawMin = Math.min(...allDates);
  const rawMax = Math.max(...allDates);
  const pad = Math.max((rawMax - rawMin) * 0.05, DAY_MS * 3);
  const minDate = rawMin - pad;
  const maxDate = rawMax + pad;

  const laneAreaX = SAFE.left + LANE_LABEL_WIDTH;
  const laneAreaWidth = availWidth - LANE_LABEL_WIDTH;
  const xScale = (ms) => laneAreaX + ((ms - minDate) / (maxDate - minDate)) * laneAreaWidth;

  const laneAreaHeight = lanes.length * LANE_ROW_HEIGHT;
  const milestonesHeight = milestones.length ? MILESTONE_AREA_HEIGHT : 0;
  const extraHeight = bannerAndProgressHeight(slide);
  const contentHeight =
    titleHeight + 40 + TODAY_MARKER_TOP_PAD + laneAreaHeight + AXIS_AREA_HEIGHT + milestonesHeight + (extraHeight ? BANNER_GAP_PX + extraHeight : 0);

  const titleY = centeredContentY("content", contentHeight);
  const boxes = [title(slide.title, { x: SAFE.left, y: titleY, width: titleWidth, sizePx: TYPE_SCALE_PX.slideTitle })];

  const chartTop = titleY + titleHeight + 40 + TODAY_MARKER_TOP_PAD;
  const axisY = chartTop + laneAreaHeight;

  lanes.forEach((lane, i) => {
    const rowY = chartTop + i * LANE_ROW_HEIGHT;
    const barY = rowY + (LANE_ROW_HEIGHT - LANE_BAR_HEIGHT) / 2;
    const barX = xScale(parseGanttDate(lane.start));
    const barW = Math.max(xScale(parseGanttDate(lane.end)) - barX, 6);
    const opacity = i % 2 === 0 ? 1 : 0.68;

    boxes.push(
      box({
        x: SAFE.left,
        y: rowY,
        width: LANE_LABEL_WIDTH - 16,
        height: LANE_ROW_HEIGHT,
        style: "display:flex;align-items:center;font-family:var(--font-sans);font-size:14px;font-weight:var(--fw-semibold);color:var(--text-strong);",
        html: escapeHtml(lane.label),
      })
    );
    boxes.push(box({ x: barX, y: barY, width: barW, height: LANE_BAR_HEIGHT, style: `background:var(--accent);opacity:${opacity};border-radius:var(--radius-sm);` }));
  });

  // Eje con marcas de fecha
  boxes.push(box({ x: laneAreaX, y: axisY, width: laneAreaWidth, height: 2, style: "background:var(--border-subtle);" }));
  for (let t = 0; t <= AXIS_TICK_COUNT; t++) {
    const ms = minDate + (t / AXIS_TICK_COUNT) * (maxDate - minDate);
    const x = xScale(ms);
    boxes.push(box({ x: x - 1, y: axisY, width: 2, height: 8, style: "background:var(--border-subtle);" }));
    boxes.push(
      box({
        x: x - 40,
        y: axisY + 12,
        width: 80,
        style: "font-family:var(--font-sans);font-size:11px;color:var(--text-muted);text-align:center;",
        html: formatGanttDate(ms),
      })
    );
  }

  // Marcador "estamos acá": pin + burbuja + línea punteada
  const todayX = xScale(asOfMs);
  boxes.push(
    box({
      x: todayX,
      y: chartTop,
      width: 0,
      height: axisY - chartTop,
      style: "border-left:2px dashed var(--fac-cta-700);",
    })
  );
  boxes.push(box({ x: todayX - 7, y: chartTop - 7, width: 14, height: 14, style: "background:var(--fac-cta-700);border-radius:var(--radius-pill);border:2px solid var(--paper);" }));
  boxes.push(
    box({
      x: todayX - 54,
      y: chartTop - TODAY_MARKER_TOP_PAD,
      width: 108,
      height: 20,
      style:
        "background:var(--fac-cta-700);color:var(--paper);border-radius:var(--radius-pill);display:flex;align-items:center;justify-content:center;font-family:var(--font-sans);font-size:10px;font-weight:var(--fw-bold);letter-spacing:0.04em;text-transform:uppercase;",
      html: "Estamos aquí",
    })
  );

  // Segunda fila: hitos puntuales bajo el eje
  if (milestones.length) {
    const milestoneY = axisY + AXIS_AREA_HEIGHT;
    milestones.forEach((m) => {
      const x = xScale(parseGanttDate(m.date));
      boxes.push(box({ x: x - 5, y: milestoneY, width: 10, height: 10, style: "background:var(--accent-dark);border-radius:var(--radius-pill);" }));
      boxes.push(
        box({
          x: x - 60,
          y: milestoneY + 14,
          width: 120,
          style: "font-family:var(--font-sans);font-size:11px;color:var(--text-muted);text-align:center;line-height:1.3;",
          html: `${escapeHtml(m.label)}<br>${formatGanttDate(parseGanttDate(m.date))}`,
        })
      );
    });
  }

  const bottomY = axisY + AXIS_AREA_HEIGHT + milestonesHeight;
  if (extraHeight) {
    pushBannerAndProgress(boxes, slide, { repoRoot, x: SAFE.left, y: bottomY + BANNER_GAP_PX, width: availWidth });
  }

  return boxes;
}
