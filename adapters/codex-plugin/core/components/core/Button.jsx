import React from "react";

const SIZES = {
  sm: { padding: "7px 14px", fontSize: 13 },
  md: { padding: "10px 20px", fontSize: 15 },
  lg: { padding: "14px 28px", fontSize: 17 },
};

/**
 * Institutional button. Crisp 4px corners, calm hover/press —
 * primary (solid accent), secondary (outline), ghost (text).
 */
export function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [down, setDown] = React.useState(false);
  const s = SIZES[size] || SIZES.md;

  const base = {
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--fw-semibold)",
    letterSpacing: "0.01em",
    borderRadius: "var(--radius-sm)",
    border: "1px solid transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    transition: "background var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard), color var(--dur-fast)",
    lineHeight: 1.1,
    ...s,
  };

  const skins = {
    primary: {
      background: down ? "var(--accent-dark)" : hover ? "var(--accent-mid)" : "var(--accent)",
      color: "var(--paper)",
      boxShadow: hover && !disabled ? "var(--shadow-md)" : "var(--shadow-sm)",
    },
    secondary: {
      background: hover ? "var(--accent-100)" : "transparent",
      color: "var(--accent)",
      borderColor: "var(--accent)",
    },
    ghost: {
      background: hover ? "var(--accent-100)" : "transparent",
      color: "var(--accent)",
    },
  };

  return (
    <button
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setDown(false); }}
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      style={{ ...base, ...(skins[variant] || skins.primary), ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}
