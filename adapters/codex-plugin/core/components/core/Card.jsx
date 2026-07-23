import React from "react";

/**
 * Content surface. White card with restrained corners and a soft
 * cool-tinted shadow; optional accent rule on the top or left edge.
 */
export function Card({
  accent = "none",
  padding = 24,
  children,
  style,
  ...rest
}) {
  const rule = "var(--border-accent-width) solid var(--accent)";
  const edge =
    accent === "top"
      ? { borderTop: rule }
      : accent === "left"
      ? { borderLeft: rule }
      : {};
  return (
    <div
      style={{
        background: "var(--paper)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-md)",
        border: "1px solid var(--border-subtle)",
        padding,
        ...edge,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
