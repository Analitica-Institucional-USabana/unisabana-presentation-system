import {
  CANVAS,
  SAFE,
  TYPE_SCALE_PX,
  BANNER_HEIGHT_PX,
  BANNER_GAP_PX,
  PROGRESS_HEIGHT_PX,
  PROGRESS_GAP_PX,
  centeredContentYIn,
  px2in,
  px2pt,
} from "../constants.mjs";
import { addTitle, addBanner, addProgressBar } from "../elements.mjs";
import { estimateBlockHeightPx } from "../../html/text-measure.mjs";

export default function renderProcess(pptxSlide, slide, { colors, repoRoot }) {
  pptxSlide.background = { color: slide.background === "tinted" ? colors.surfaceTint : colors.paper };

  const titleWidthPx = CANVAS.width - SAFE.left - SAFE.right;
  const titleHeightPx = estimateBlockHeightPx(slide.title, { sizePx: TYPE_SCALE_PX.slideTitle, widthPx: titleWidthPx, weight: "black" });
  const ctx = { colors, titleWidthPx, titleHeightPx, availWidthPx: titleWidthPx };

  const layout = slide.layout || "steps";
  if (layout === "gantt") renderGantt(pptxSlide, slide, ctx);
  else if (layout === "alternating") renderAlternating(pptxSlide, slide, ctx);
  else renderSteps(pptxSlide, slide, ctx);

  return "light";
}

function bannerAndProgressHeightPx(slide) {
  let h = 0;
  if (slide.banner) h += BANNER_GAP_PX + BANNER_HEIGHT_PX;
  if (slide.progress) h += PROGRESS_GAP_PX + PROGRESS_HEIGHT_PX;
  return h;
}

function pushBannerAndProgress(pptxSlide, slide, { colors, x, y, w }) {
  let cursorY = y;
  if (slide.banner) {
    addBanner(pptxSlide, slide.banner, { x, y: cursorY, w, h: px2in(BANNER_HEIGHT_PX), colors });
    cursorY += px2in(BANNER_HEIGHT_PX + BANNER_GAP_PX);
  }
  if (slide.progress) {
    addProgressBar(pptxSlide, slide.progress, { x, y: cursorY, w, colors });
  }
}

// ---- layout: "steps" (por defecto) ----
function renderSteps(pptxSlide, slide, { colors, titleWidthPx, titleHeightPx, availWidthPx }) {
  const n = slide.steps.length;
  const stepWidthPx = availWidthPx / n;
  const circleSizePx = 48;
  const labelBlockHeightPx = Math.max(
    ...slide.steps.map((step) => {
      const labelH = estimateBlockHeightPx(step.label, { sizePx: 18, widthPx: stepWidthPx - 12, weight: "semibold", lineHeight: 1.3 });
      const descH = step.description ? 4 + estimateBlockHeightPx(step.description, { sizePx: 14, widthPx: stepWidthPx - 12, weight: "regular", lineHeight: 1.3 }) : 0;
      return labelH + descH;
    })
  );
  const stepsGapPx = 64;
  const stepBlockHeightPx = circleSizePx + 16 + labelBlockHeightPx;
  const extraPx = bannerAndProgressHeightPx(slide);
  const contentHeightPx = titleHeightPx + stepsGapPx + stepBlockHeightPx + (extraPx ? BANNER_GAP_PX + extraPx : 0);

  const titleY = centeredContentYIn("content", contentHeightPx);
  addTitle(pptxSlide, slide.title, { x: px2in(SAFE.left), y: titleY, w: px2in(titleWidthPx), h: px2in(titleHeightPx), sizePt: px2pt(TYPE_SCALE_PX.slideTitle), color: colors.sabanaBlue });

  const stepsY = titleY + px2in(titleHeightPx + stepsGapPx);
  const availW = px2in(availWidthPx);
  const stepW = availW / n;
  const circleSize = px2in(circleSizePx);
  const circleCenterY = stepsY + circleSize / 2;

  pptxSlide.addShape("rect", {
    x: px2in(SAFE.left) + stepW / 2,
    y: circleCenterY - 0.01,
    w: availW - stepW,
    h: 0.02,
    fill: { color: colors.ink200 },
    line: { type: "none" },
  });

  slide.steps.forEach((step, i) => {
    const cx = px2in(SAFE.left) + i * stepW + stepW / 2 - circleSize / 2;
    pptxSlide.addShape("ellipse", { x: cx, y: stepsY, w: circleSize, h: circleSize, fill: { color: colors.accent }, line: { type: "none" } });
    pptxSlide.addText(String(i + 1), { x: cx, y: stepsY, w: circleSize, h: circleSize, fontFace: "Libre Franklin", fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
    const label = step.description ? `${step.label}\n${step.description}` : step.label;
    pptxSlide.addText(label, {
      x: px2in(SAFE.left) + i * stepW,
      y: stepsY + circleSize + px2in(16),
      w: stepW - px2in(12),
      h: px2in(labelBlockHeightPx),
      fontFace: "Libre Franklin",
      fontSize: 12,
      color: colors.sabanaBlue,
      align: "center",
    });
  });

  if (extraPx) {
    pushBannerAndProgress(pptxSlide, slide, { colors, x: px2in(SAFE.left), y: stepsY + px2in(stepBlockHeightPx + BANNER_GAP_PX), w: availW });
  }
}

// ---- layout: "alternating" (planning/09-visual-richness-and-content-density.md #5) ----
function renderAlternating(pptxSlide, slide, { colors, titleWidthPx, titleHeightPx, availWidthPx }) {
  const steps = slide.steps;
  const n = steps.length;
  const stepWidthPx = availWidthPx / n;
  const badgeSizePx = 40;
  const cardPaddingPx = 14;
  const cardWidthPx = stepWidthPx - 24;
  const innerWidthPx = cardWidthPx - cardPaddingPx * 2;

  const cardHeightPx = Math.max(
    ...steps.map((step) => {
      const labelH = estimateBlockHeightPx(step.label, { sizePx: 16, widthPx: innerWidthPx, weight: "bold", lineHeight: 1.25 });
      const descH = step.description ? 4 + estimateBlockHeightPx(step.description, { sizePx: 13, widthPx: innerWidthPx, weight: "regular", lineHeight: 1.25 }) : 0;
      return badgeSizePx + 10 + 16 + 4 + labelH + descH + cardPaddingPx * 2;
    })
  );

  const stepsGapPx = 56;
  const gapAroundLinePx = 28;
  const extraPx = bannerAndProgressHeightPx(slide);
  const contentHeightPx = titleHeightPx + stepsGapPx + cardHeightPx * 2 + gapAroundLinePx * 2 + (extraPx ? BANNER_GAP_PX + extraPx : 0);

  const titleY = centeredContentYIn("content", contentHeightPx);
  addTitle(pptxSlide, slide.title, { x: px2in(SAFE.left), y: titleY, w: px2in(titleWidthPx), h: px2in(titleHeightPx), sizePt: px2pt(TYPE_SCALE_PX.slideTitle), color: colors.sabanaBlue });

  const topCardY = titleY + px2in(titleHeightPx + stepsGapPx);
  const lineY = topCardY + px2in(cardHeightPx + gapAroundLinePx);
  const bottomCardY = lineY + px2in(gapAroundLinePx);

  const stepW = px2in(stepWidthPx);
  const cardW = px2in(cardWidthPx);
  const cardH = px2in(cardHeightPx);
  const availW = px2in(availWidthPx);

  pptxSlide.addShape("rect", { x: px2in(SAFE.left) + stepW / 2, y: lineY - 0.01, w: availW - stepW, h: 0.02, fill: { color: colors.ink200 }, line: { type: "none" } });

  steps.forEach((step, i) => {
    const above = i % 2 === 0;
    const cx = px2in(SAFE.left) + i * stepW + stepW / 2;
    const cardX = cx - cardW / 2;
    const cardY = above ? topCardY : bottomCardY;

    pptxSlide.addShape("ellipse", { x: cx - 0.05, y: lineY - 0.05, w: 0.1, h: 0.1, fill: { color: colors.accent }, line: { color: "FFFFFF", width: 1.5 } });

    pptxSlide.addShape("rect", { x: cardX, y: cardY, w: cardW, h: cardH, fill: { color: colors.paper }, line: { color: colors.ink200, width: 0.75 } });
    const badgeSize = px2in(badgeSizePx);
    const pad = px2in(cardPaddingPx);
    pptxSlide.addShape("roundRect", { x: cardX + pad, y: cardY + pad, w: badgeSize, h: badgeSize, rectRadius: 0.06, fill: { color: colors.accent }, line: { type: "none" } });
    pptxSlide.addText(`HITO ${i + 1}`, { x: cardX + pad, y: cardY + pad + badgeSize + 0.06, w: cardW - pad * 2, h: 0.2, fontFace: "Libre Franklin", fontSize: 9, bold: true, color: colors.accentDark, charSpacing: 1 });
    pptxSlide.addText(step.label, { x: cardX + pad, y: cardY + pad + badgeSize + 0.28, w: cardW - pad * 2, h: 0.4, fontFace: "Libre Franklin", fontSize: 13, bold: true, color: colors.ink900 });
    if (step.description) {
      pptxSlide.addText(step.description, { x: cardX + pad, y: cardY + pad + badgeSize + 0.6, w: cardW - pad * 2, h: cardH - (pad + badgeSize + 0.6), fontFace: "Libre Franklin", fontSize: 11, color: colors.ink500 });
    }

    if (step.current) {
      const bubbleW = 1.1;
      const bubbleY = above ? lineY + 0.12 : lineY - 0.12 - 0.22;
      pptxSlide.addShape("roundRect", { x: cx - bubbleW / 2, y: bubbleY, w: bubbleW, h: 0.22, rectRadius: 0.11, fill: { color: colors.ctaGold700 }, line: { type: "none" } });
      pptxSlide.addText("Estamos aquí", { x: cx - bubbleW / 2, y: bubbleY, w: bubbleW, h: 0.22, fontFace: "Libre Franklin", fontSize: 8, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
      pptxSlide.addShape("ellipse", { x: cx - 0.07, y: lineY - 0.07, w: 0.14, h: 0.14, fill: { color: colors.ctaGold700 }, line: { color: "FFFFFF", width: 2 } });
    }
  });

  if (extraPx) {
    pushBannerAndProgress(pptxSlide, slide, { colors, x: px2in(SAFE.left), y: bottomCardY + cardH + px2in(BANNER_GAP_PX), w: availW });
  }
}

// ---- layout: "gantt" (planning/09-visual-richness-and-content-density.md #4) ----
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

const LANE_LABEL_WIDTH_PX = 190;
const LANE_ROW_HEIGHT_PX = 46;
const LANE_BAR_HEIGHT_PX = 24;
const AXIS_TICK_COUNT = 4;
const AXIS_AREA_HEIGHT_PX = 32;
const MILESTONE_AREA_HEIGHT_PX = 44;
const TODAY_MARKER_TOP_PAD_PX = 40;

function renderGantt(pptxSlide, slide, { colors, titleWidthPx, titleHeightPx, availWidthPx }) {
  const lanes = slide.lanes;
  const milestones = slide.milestones || [];
  const asOfMs = parseGanttDate(slide.asOf);
  const allDates = [...lanes.flatMap((l) => [parseGanttDate(l.start), parseGanttDate(l.end)]), ...milestones.map((m) => parseGanttDate(m.date)), asOfMs];
  const rawMin = Math.min(...allDates);
  const rawMax = Math.max(...allDates);
  const pad = Math.max((rawMax - rawMin) * 0.05, DAY_MS * 3);
  const minDate = rawMin - pad;
  const maxDate = rawMax + pad;

  const laneAreaXPx = SAFE.left + LANE_LABEL_WIDTH_PX;
  const laneAreaWidthPx = availWidthPx - LANE_LABEL_WIDTH_PX;
  const xScalePx = (ms) => laneAreaXPx + ((ms - minDate) / (maxDate - minDate)) * laneAreaWidthPx;

  const laneAreaHeightPx = lanes.length * LANE_ROW_HEIGHT_PX;
  const milestonesHeightPx = milestones.length ? MILESTONE_AREA_HEIGHT_PX : 0;
  const extraPx = bannerAndProgressHeightPx(slide);
  const contentHeightPx =
    titleHeightPx + 40 + TODAY_MARKER_TOP_PAD_PX + laneAreaHeightPx + AXIS_AREA_HEIGHT_PX + milestonesHeightPx + (extraPx ? BANNER_GAP_PX + extraPx : 0);

  const titleY = centeredContentYIn("content", contentHeightPx);
  addTitle(pptxSlide, slide.title, { x: px2in(SAFE.left), y: titleY, w: px2in(titleWidthPx), h: px2in(titleHeightPx), sizePt: px2pt(TYPE_SCALE_PX.slideTitle), color: colors.sabanaBlue });

  const chartTopPx0 = titleHeightPx + 40 + TODAY_MARKER_TOP_PAD_PX;
  const chartTopIn = titleY + px2in(chartTopPx0);
  const axisYIn = chartTopIn + px2in(laneAreaHeightPx);

  lanes.forEach((lane, i) => {
    const rowYIn = chartTopIn + px2in(i * LANE_ROW_HEIGHT_PX);
    const barYIn = rowYIn + px2in((LANE_ROW_HEIGHT_PX - LANE_BAR_HEIGHT_PX) / 2);
    const barXIn = px2in(xScalePx(parseGanttDate(lane.start)));
    const barWIn = Math.max(px2in(xScalePx(parseGanttDate(lane.end))) - barXIn, px2in(6));
    const opacity = i % 2 === 0 ? 100 : 68;

    pptxSlide.addText(lane.label, {
      x: px2in(SAFE.left),
      y: rowYIn,
      w: px2in(LANE_LABEL_WIDTH_PX - 16),
      h: px2in(LANE_ROW_HEIGHT_PX),
      fontFace: "Libre Franklin",
      fontSize: 12,
      bold: true,
      color: colors.ink900,
      valign: "middle",
    });
    pptxSlide.addShape("rect", { x: barXIn, y: barYIn, w: barWIn, h: px2in(LANE_BAR_HEIGHT_PX), fill: { color: colors.accent, transparency: 100 - opacity }, line: { type: "none" } });
  });

  // Eje
  const laneAreaXIn = px2in(laneAreaXPx);
  const laneAreaWidthIn = px2in(laneAreaWidthPx);
  pptxSlide.addShape("rect", { x: laneAreaXIn, y: axisYIn, w: laneAreaWidthIn, h: 0.02, fill: { color: colors.ink200 }, line: { type: "none" } });
  for (let t = 0; t <= AXIS_TICK_COUNT; t++) {
    const ms = minDate + (t / AXIS_TICK_COUNT) * (maxDate - minDate);
    const xIn = px2in(xScalePx(ms));
    pptxSlide.addShape("rect", { x: xIn - 0.01, y: axisYIn, w: 0.02, h: px2in(8), fill: { color: colors.ink200 }, line: { type: "none" } });
    pptxSlide.addText(formatGanttDate(ms), {
      x: xIn - px2in(40),
      y: axisYIn + px2in(12),
      w: px2in(80),
      h: 0.2,
      fontFace: "Libre Franklin",
      fontSize: 9,
      color: colors.ink500,
      align: "center",
    });
  }

  // Marcador "estamos acá"
  const todayXIn = px2in(xScalePx(asOfMs));
  pptxSlide.addShape("line", { x: todayXIn, y: chartTopIn, w: 0.001, h: axisYIn - chartTopIn, line: { color: colors.ctaGold700, width: 1.25, dashType: "dash" } });
  pptxSlide.addShape("ellipse", { x: todayXIn - 0.07, y: chartTopIn - 0.07, w: 0.14, h: 0.14, fill: { color: colors.ctaGold700 }, line: { color: "FFFFFF", width: 2 } });
  const bubbleW = 1.05;
  pptxSlide.addShape("roundRect", {
    x: todayXIn - bubbleW / 2,
    y: chartTopIn - px2in(TODAY_MARKER_TOP_PAD_PX),
    w: bubbleW,
    h: 0.2,
    rectRadius: 0.1,
    fill: { color: colors.ctaGold700 },
    line: { type: "none" },
  });
  pptxSlide.addText("Estamos aquí", {
    x: todayXIn - bubbleW / 2,
    y: chartTopIn - px2in(TODAY_MARKER_TOP_PAD_PX),
    w: bubbleW,
    h: 0.2,
    fontFace: "Libre Franklin",
    fontSize: 8,
    bold: true,
    color: "FFFFFF",
    align: "center",
    valign: "middle",
  });

  // Hitos
  let bottomIn = axisYIn + px2in(AXIS_AREA_HEIGHT_PX);
  if (milestones.length) {
    milestones.forEach((m) => {
      const xIn = px2in(xScalePx(parseGanttDate(m.date)));
      pptxSlide.addShape("ellipse", { x: xIn - 0.05, y: bottomIn, w: 0.1, h: 0.1, fill: { color: colors.accentDark }, line: { type: "none" } });
      pptxSlide.addText(`${m.label}\n${formatGanttDate(parseGanttDate(m.date))}`, {
        x: xIn - px2in(60),
        y: bottomIn + px2in(14),
        w: px2in(120),
        h: 0.35,
        fontFace: "Libre Franklin",
        fontSize: 9,
        color: colors.ink500,
        align: "center",
      });
    });
    bottomIn += px2in(MILESTONE_AREA_HEIGHT_PX);
  }

  if (extraPx) {
    pushBannerAndProgress(pptxSlide, slide, { colors, x: px2in(SAFE.left), y: bottomIn + px2in(BANNER_GAP_PX), w: px2in(availWidthPx) });
  }
}
