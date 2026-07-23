import React from "react";

/**
 * Uppercase, tracked kicker that sits above a title.
 * Optionally shows a short accent rule before the text.
 */
export function Eyebrow({ children, rule = true, color, style, ...rest }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "var(--font-sans)",
        fontSize: "var(--fs-caption)",
        fontWeight: "var(--fw-semibold)",
        letterSpacing: "var(--ls-label)",
        textTransform: "uppercase",
        color: color || "var(--accent-mid)",
        ...style,
      }}
      {...rest}
    >
      {rule && (
        <span
          style={{
            width: 22,
            height: 3,
            background: "currentColor",
            borderRadius: 2,
          }}
        />
      )}
      {children}
    </span>
  );
}
