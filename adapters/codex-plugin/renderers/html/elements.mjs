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

function statNumberHtml({ value, label, delta, deltaDirection, caption }, { valueSizePx = 72 } = {}) {
  const deltaColor = deltaDirection === "down" ? "var(--fac-juridicas-500)" : "var(--fac-familia-700)";
  const deltaArrow = deltaDirection === "down" ? "▾" : "▴";
  let html = `<div style="display:flex;align-items:baseline;gap:10px">`;
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
  return html;
}

export function statBlock({ value, label, delta, deltaDirection, caption, accentColor, badge, badgeTone = "alert" }, { x, y, width, height, valueSizePx = 72, card = false } = {}) {
  let html = `<div style="font-family:var(--font-sans)">`;
  if (badge) {
    html += `<div style="text-align:right;margin-bottom:8px">${tag(badge, { tone: badgeTone })}</div>`;
  }
  html += statNumberHtml({ value, label, delta, deltaDirection, caption }, { valueSizePx });
  html += `</div>`;
  if (!card) return box({ x, y, width, html });
  const surface = accentColor ? surfaceStyle({ accentEdge: "left", accentColor }) : surfaceStyle();
  return box({ x, y, width, height, style: `${surface}padding:24px;box-sizing:border-box;`, html });
}

// Superficie tipo Card (core/components/core/Card.jsx): blanca, radio contenido,
// sombra suave, regla de acento superior/izquierda opcional en un color dado
// (planning/09-visual-richness-and-content-density.md #2: tarjeta con estado).
export function surfaceStyle({ accentEdge = "none", accentColor = "var(--accent)" } = {}) {
  const rule = `var(--border-accent-width) solid ${accentColor}`;
  const edge = accentEdge === "top" ? `border-top:${rule};` : accentEdge === "left" ? `border-left:${rule};` : "";
  return `background:var(--paper);border-radius:var(--radius-md);box-shadow:var(--shadow-md);border:1px solid var(--border-subtle);${edge}`;
}

export function tag(text, { tone = "accent" } = {}) {
  const tones = {
    accent: "background:var(--accent-100);color:var(--accent-dark);",
    solid: "background:var(--accent);color:var(--paper);",
    neutral: "background:var(--ink-200);color:var(--ink-700);",
    cream: "background:var(--sabana-cream);color:var(--sabana-blue);",
    alert: "background:var(--fac-juridicas-100);color:var(--fac-juridicas-700);",
  };
  return `<span style="display:inline-flex;align-items:center;font-family:var(--font-sans);font-size:var(--fs-caption);font-weight:var(--fw-semibold);letter-spacing:0.02em;padding:4px 12px;border-radius:var(--radius-pill);${tones[tone] || tones.accent}">${escapeHtml(text)}</span>`;
}

// Franja de énfasis de ancho completo (planning/09-visual-richness-and-content-density.md
// #1). iconHtml, si se pasa, ya viene resuelto por el caller vía icons.mjs — este
// archivo se mantiene libre de fs para no acoplar el layout de bloques a disco.
export function banner({ variant, text, label, iconHtml }, { x, y, width, height } = {}) {
  const variants = {
    info: { bg: "background:var(--bg-inverse);", text: "color:var(--text-on-dark);", labelColor: "var(--text-on-dark)" },
    warning: { bg: "background:var(--surface-cream);border-left:4px solid var(--fac-cta-700);", text: "color:var(--text-strong);", labelColor: "var(--fac-cta-700)" },
    highlight: { bg: "background:var(--surface-tint);", text: "color:var(--text-strong);", labelColor: "var(--accent-dark)" },
  };
  const v = variants[variant] || variants.highlight;
  let html = `<div style="font-family:var(--font-sans);display:flex;align-items:center;gap:14px;height:100%;padding:0 28px;box-sizing:border-box;${v.text}">`;
  if (iconHtml) html += iconHtml;
  html += `<div>`;
  if (label) {
    html += `<div style="font-size:var(--fs-caption);font-weight:var(--fw-semibold);letter-spacing:var(--ls-label);text-transform:uppercase;color:${v.labelColor};margin-bottom:4px;">${escapeHtml(label)}</div>`;
  }
  html += `<div style="font-size:20px;font-weight:var(--fw-semibold);line-height:var(--lh-body);">${escapeHtml(text)}</div>`;
  html += `</div></div>`;
  return box({ x, y, width, height, style: `border-radius:var(--radius-md);${v.bg}`, html });
}

// Tarjeta de comparación con estado (planning/09-visual-richness-and-content-density.md
// #2): borde de acento + badge de esquina + hasta 2 cifras grandes + divisor + bullets.
export function statusCard({ heading, badge, accent = "neutral", stats = [], points = [] }, { x, y, width, height } = {}) {
  const accentColor = accent === "alert" ? "var(--fac-juridicas-500)" : "var(--accent)";
  const badgeTone = accent === "alert" ? "alert" : "neutral";

  let html = `<div style="font-family:var(--font-sans);height:100%;box-sizing:border-box;display:flex;flex-direction:column;">`;
  html += `<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px;">`;
  html += `<div style="font-size:22px;font-weight:var(--fw-bold);color:var(--text-strong);">${escapeHtml(heading)}</div>`;
  if (badge) html += tag(badge, { tone: badgeTone });
  html += `</div>`;

  if (stats.length) {
    html += `<div style="display:flex;gap:24px;margin-bottom:16px;">`;
    stats.forEach((stat, i) => {
      const divider = i === 0 && stats.length === 2 ? "border-right:1px solid var(--border-subtle);padding-right:24px;" : "";
      html += `<div style="flex:1;${divider}">${statNumberHtml(stat, { valueSizePx: 44 })}</div>`;
    });
    html += `</div>`;
  }

  if (points.length) {
    html += `<div>${points.map((p) => `<div style="font-size:16px;color:var(--text-body);line-height:var(--lh-body);margin-bottom:8px;">• ${escapeHtml(p)}</div>`).join("")}</div>`;
  }
  html += `</div>`;

  return box({ x, y, width, height, style: `${surfaceStyle({ accentEdge: "left", accentColor })}padding:24px;box-sizing:border-box;`, html });
}
