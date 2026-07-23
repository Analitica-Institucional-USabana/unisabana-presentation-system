import React from "react";

/**
 * Big-figure statistic block — the institutional way to feature a KPI.
 * Large value in accent, label below, optional delta and caption.
 */
export function Stat({
  value,
  label,
  delta,
  deltaDirection = "up",
  caption,
  align = "left",
  style,
  ...rest
}) {
  const deltaColor =
    deltaDirection === "down" ? "var(--fac-juridicas-500)" : "var(--fac-familia-700)";
  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        textAlign: align,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 10,
          justifyContent: align === "center" ? "center" : "flex-start",
        }}
      >
        <span
          style={{
            fontSize: "var(--fs-display)",
            fontWeight: "var(--fw-black)",
            letterSpacing: "var(--ls-display)",
            lineHeight: 1,
            color: "var(--accent)",
          }}
        >
          {value}
        </span>
        {delta != null && (
          <span style={{ fontSize: "var(--fs-h4)", fontWeight: "var(--fw-bold)", color: deltaColor }}>
            {deltaDirection === "down" ? "▾" : "▴"} {delta}
          </span>
        )}
      </div>
      {label && (
        <span style={{ fontSize: "var(--fs-lead)", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)" }}>
          {label}
        </span>
      )}
      {caption && (
        <span style={{ fontSize: "var(--fs-caption)", color: "var(--text-muted)" }}>{caption}</span>
      )}
    </div>
  );
}
