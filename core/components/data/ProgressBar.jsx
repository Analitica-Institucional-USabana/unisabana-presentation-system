import React from "react";

/**
 * Labelled progress / share bar in the active accent.
 */
export function ProgressBar({
  value = 0,
  label,
  showValue = true,
  height = 10,
  style,
  ...rest
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div style={{ fontFamily: "var(--font-sans)", ...style }} {...rest}>
      {(label || showValue) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
            fontSize: "var(--fs-small)",
            color: "var(--text-strong)",
          }}
        >
          <span style={{ fontWeight: "var(--fw-medium)" }}>{label}</span>
          {showValue && <span style={{ fontWeight: "var(--fw-bold)" }}>{pct}%</span>}
        </div>
      )}
      <div
        style={{
          height,
          width: "100%",
          background: "var(--accent-100)",
          borderRadius: "var(--radius-pill)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "var(--accent)",
            borderRadius: "var(--radius-pill)",
            transition: "width var(--dur-med) var(--ease-standard)",
          }}
        />
      </div>
    </div>
  );
}
