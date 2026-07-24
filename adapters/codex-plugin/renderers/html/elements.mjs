// Bloques de construcción compartidos entre layouts. Cada slide se ensambla
// como una lista de <div style="position:absolute;..."> — flatten mecánico,
// nunca flex/grid en la salida final (claude-design-system/CLAUDE.md).
// Única excepción explícitamente permitida por esa misma regla: una <table>
// real para contenido tabular (ver layouts/table.mjs).

export function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function box({ x, y, width, height, style = "", html = "" }) {
  const parts = [`position:absolute`, `left:${x}px`, `top:${y}px`];
  if (width != null) parts.push(`width:${width}px`);
  if (height != null) parts.push(`height:${height}px`);
  return `<div style="${parts.join(";")};${style}">${html}</div>`;
}

export function eyebrow(text, { x, y, color = "var(--accent-mid)" } = {}) {
  return box({
    x,
    y,
    style: `font-family:var(--font-sans);font-size:var(--fs-caption);font-weight:var(--fw-semibold);letter-spacing:var(--ls-label);text-transform:uppercase;color:${color};display:flex;align-items:center;gap:10px;`,
    html: `<span style="width:22px;height:3px;background:currentColor;border-radius:2px;display:inline-block"></span>${escapeHtml(text)}`,
  });
}

export function title(text, { x, y, width, sizePx, color = "var(--text-strong)", weight = "var(--fw-black)" } = {}) {
  return box({
    x,
    y,
    width,
    style: `font-family:var(--font-sans);font-size:${sizePx}px;font-weight:${weight};letter-spacing:var(--ls-heading);line-height:var(--lh-heading);color:${color};`,
    html: escapeHtml(text),
  });
}

export function bodyText(text, { x, y, width, sizePx = 20, color = "var(--text-body)", weight = "var(--fw-regular)" } = {}) {
  return box({
    x,
    y,
    width,
    style: `font-family:var(--font-sans);font-size:${sizePx}px;font-weight:${weight};line-height:var(--lh-body);color:${color};`,
    html: escapeHtml(text),
  });
}

export function statBlock({ value, label, delta, deltaDirection, caption }, { x, y, width, valueSizePx = 72 } = {}) {
  const deltaColor = deltaDirection === "down" ? "var(--fac-juridicas-500)" : "var(--fac-familia-700)";
  const deltaArrow = deltaDirection === "down" ? "▾" : "▴";
  let html = `<div style="font-family:var(--font-sans)">`;
  html += `<div style="display:flex;align-items:baseline;gap:10px">`;
  html += `<span style="font-size:${valueSizePx}px;font-weight:var(--fw-black);letter-spacing:var(--ls-display);line-height:1;color:var(--accent)">${escapeHtml(value)}</span>`;
  if (delta) {
    html += `<span style="font-size:var(--fs-h4);font-weight:var(--fw-bold);color:${deltaColor}">${deltaArrow} ${escapeHtml(delta)}</span>`;
  }
  html += `</div>`;
  if (label) {
    html += `<div style="font-size:var(--fs-lead);font-weight:var(--fw-semibold);color:var(--text-strong);margin-top:4px">${escapeHtml(label)}</div>`;
  }
  if (caption) {
    html += `<div style="font-size:var(--fs-caption);color:var(--text-muted);margin-top:4px">${escapeHtml(caption)}</div>`;
  }
  html += `</div>`;
  return box({ x, y, width, html });
}

// Superficie tipo Card (core/components/core/Card.jsx): blanca, radio contenido,
// sombra suave, regla de acento superior opcional.
export function surfaceStyle({ accentEdge = "none" } = {}) {
  const rule = "var(--border-accent-width) solid var(--accent)";
  const edge = accentEdge === "top" ? `border-top:${rule};` : accentEdge === "left" ? `border-left:${rule};` : "";
  return `background:var(--paper);border-radius:var(--radius-md);box-shadow:var(--shadow-md);border:1px solid var(--border-subtle);${edge}`;
}

export function tag(text, { tone = "accent" } = {}) {
  const tones = {
    accent: "background:var(--accent-100);color:var(--accent-dark);",
    solid: "background:var(--accent);color:var(--paper);",
    neutral: "background:var(--ink-200);color:var(--ink-700);",
    cream: "background:var(--sabana-cream);color:var(--sabana-blue);",
  };
  return `<span style="display:inline-flex;align-items:center;font-family:var(--font-sans);font-size:var(--fs-caption);font-weight:var(--fw-semibold);letter-spacing:0.02em;padding:4px 12px;border-radius:var(--radius-pill);${tones[tone] || tones.accent}">${escapeHtml(text)}</span>`;
}
