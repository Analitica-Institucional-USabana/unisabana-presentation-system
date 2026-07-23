import React from "react";

const TONES = {
  accent: { bg: "var(--accent-100)", fg: "var(--accent-dark)" },
  solid: { bg: "var(--accent)", fg: "var(--paper)" },
  neutral: { bg: "var(--ink-200)", fg: "var(--ink-700)" },
  cream: { bg: "var(--sabana-cream)", fg: "var(--sabana-blue)" },
};

/**
 * Small pill label / category tag.
 */
export function Tag({ tone = "accent", children, style, ...rest }) {
  const t = TONES[tone] || TONES.accent;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--fs-caption)",
        fontWeight: "var(--fw-semibold)",
        letterSpacing: "0.02em",
        padding: "4px 12px",
        borderRadius: "var(--radius-pill)",
        background: t.bg,
        color: t.fg,
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
