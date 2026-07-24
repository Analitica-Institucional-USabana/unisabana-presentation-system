import PptxGenJS from "pptxgenjs";
import { PPTX_LAYOUT, PPTX_LAYOUT_NAME } from "./constants.mjs";
import { loadTokens, resolveColors } from "./colors.mjs";
import { addLogo } from "./logo.mjs";
import { addAiDisclosure } from "./ai-disclosure.mjs";

import renderCover from "./layouts/cover.mjs";
import renderAgenda from "./layouts/agenda.mjs";
import renderSeparator from "./layouts/separator.mjs";
import renderMessage from "./layouts/message.mjs";
import renderData from "./layouts/data.mjs";
import renderComparison from "./layouts/comparison.mjs";
import renderProcess from "./layouts/process.mjs";
import renderTable from "./layouts/table.mjs";
import renderQuote from "./layouts/quote.mjs";
import renderClosing from "./layouts/closing.mjs";

const LAYOUTS = {
  cover: renderCover,
  agenda: renderAgenda,
  separator: renderSeparator,
  message: renderMessage,
  data: renderData,
  comparison: renderComparison,
  process: renderProcess,
  table: renderTable,
  quote: renderQuote,
  closing: renderClosing,
};

export async function buildPptx(deck, { repoRoot }) {
  const tokens = loadTokens(repoRoot);
  const colors = resolveColors(tokens, deck.presentation.palette);

  const pptx = new PptxGenJS();
  pptx.defineLayout(PPTX_LAYOUT);
  pptx.layout = PPTX_LAYOUT_NAME;
  pptx.title = deck.presentation.title;

  for (const slide of deck.slides) {
    const layoutFn = LAYOUTS[slide.type];
    if (!layoutFn) throw new Error(`Tipo de slide sin layout pptx: ${slide.type}`);
    const pptxSlide = pptx.addSlide();
    const tone = layoutFn(pptxSlide, slide, { repoRoot, colors, tokens });
    addLogo(pptxSlide, repoRoot, slide.type, tone);
    addAiDisclosure(pptxSlide, repoRoot, tone);
  }

  return pptx;
}
