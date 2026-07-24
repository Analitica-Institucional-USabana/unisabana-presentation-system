import { CANVAS, SAFE, TYPE_SCALE_PX } from "../constants.mjs";
import { box, eyebrow, title, bodyText } from "../elements.mjs";
import { brandAssetDataUri } from "../embed.mjs";

// slides/01-cover.html y slides/08-photo-cover.html (referencia visual, no copiados
// literalmente — ver planning/00-current-state-inventory.md) se consolidan aquí en
// un único layout parametrizado por `background`.
export default function renderCover(slide, { repoRoot }) {
  const tone = slide.background === "light" ? "light" : "dark";
  let backgroundCss;
  if (slide.background === "photo") {
    const dataUri = brandAssetDataUri(repoRoot, slide.photo);
    backgroundCss = `background-image:linear-gradient(180deg, rgba(13,33,87,0.15), rgba(13,33,87,0.8)), url('${dataUri}');background-size:cover;background-position:center;`;
  } else if (slide.background === "navy") {
    backgroundCss = `background:var(--bg-inverse);`;
  } else {
    backgroundCss = `background:var(--bg-page);`;
  }

  const textColor = tone === "dark" ? "var(--text-on-dark)" : "var(--text-strong)";
  const contentWidth = CANVAS.width - SAFE.left - SAFE.right - 160;
  let boxes = "";
  let y = 220;

  if (slide.eyebrow) {
    boxes += eyebrow(slide.eyebrow, { x: SAFE.left, y, color: tone === "dark" ? "var(--sabana-blue-300)" : "var(--accent-mid)" });
    y += 40;
  }
  boxes += title(slide.title, { x: SAFE.left, y, width: contentWidth, sizePx: TYPE_SCALE_PX.coverTitle, color: textColor });
  y += Math.round(TYPE_SCALE_PX.coverTitle * 1.15) + 24;

  if (slide.subtitle) {
    boxes += bodyText(slide.subtitle, {
      x: SAFE.left, y, width: contentWidth, sizePx: 24, weight: "var(--fw-medium)",
      color: tone === "dark" ? "var(--sabana-blue-300)" : "var(--text-body)",
    });
  }

  const meta = [slide.presenter, slide.date, slide.event].filter(Boolean).join(" · ");
  if (meta) {
    boxes += bodyText(meta, {
      x: SAFE.left, y: CANVAS.height - SAFE.bottom - 40, sizePx: 16,
      color: tone === "dark" ? "var(--sabana-blue-300)" : "var(--text-muted)",
    });
  }

  return { tone, backgroundCss, boxesHtml: boxes };
}
