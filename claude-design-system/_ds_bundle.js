/* @ds-bundle: {"format":4,"namespace":"UniversidadDeLaSabanaDesignSystem_529c5d","components":[{"name":"Eyebrow","sourcePath":"components/brand/Eyebrow.jsx"},{"name":"Logo","sourcePath":"components/brand/Logo.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"ProgressBar","sourcePath":"components/data/ProgressBar.jsx"},{"name":"Stat","sourcePath":"components/data/Stat.jsx"}],"sourceHashes":{"components/brand/Eyebrow.jsx":"794f70de262b","components/brand/Logo.jsx":"7bf059c53997","components/core/Button.jsx":"83c6541db947","components/core/Card.jsx":"a143ecaa9fc0","components/core/Tag.jsx":"1e1b80135107","components/data/ProgressBar.jsx":"ef512ce8fc0d","components/data/Stat.jsx":"1b3fb4c9a167"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.UniversidadDeLaSabanaDesignSystem_529c5d = window.UniversidadDeLaSabanaDesignSystem_529c5d || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/Eyebrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Uppercase, tracked kicker that sits above a title.
 * Optionally shows a short accent rule before the text.
 */
function Eyebrow({
  children,
  rule = true,
  color,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      fontFamily: "var(--font-sans)",
      fontSize: "var(--fs-caption)",
      fontWeight: "var(--fw-semibold)",
      letterSpacing: "var(--ls-label)",
      textTransform: "uppercase",
      color: color || "var(--accent-mid)",
      ...style
    }
  }, rest), rule && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 22,
      height: 3,
      background: "currentColor",
      borderRadius: 2
    }
  }), children);
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/brand/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const FILES = {
  color: "logo-horizontal-color.png",
  white: "logo-horizontal-white.png",
  mono: "logo-horizontal-mono.svg"
};

/**
 * Official Universidad de La Sabana horizontal logo lockup.
 * Renders the supplied brand asset — never a redrawn mark.
 * Enforces the brand-book minimum symbol height (22px) via a floor on `height`.
 */
function Logo({
  variant = "color",
  height = 48,
  basePath = "assets",
  alt = "Universidad de La Sabana",
  style,
  ...rest
}) {
  const h = Math.max(22, height); // brand-book minimum symbol height
  const file = FILES[variant] || FILES.color;
  return /*#__PURE__*/React.createElement("img", _extends({
    src: `${basePath}/${file}`,
    alt: alt,
    style: {
      height: h,
      width: "auto",
      display: "block",
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    padding: "7px 14px",
    fontSize: 13
  },
  md: {
    padding: "10px 20px",
    fontSize: 15
  },
  lg: {
    padding: "14px 28px",
    fontSize: 17
  }
};

/**
 * Institutional button. Crisp 4px corners, calm hover/press —
 * primary (solid accent), secondary (outline), ghost (text).
 */
function Button({
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
    ...s
  };
  const skins = {
    primary: {
      background: down ? "var(--accent-dark)" : hover ? "var(--accent-mid)" : "var(--accent)",
      color: "var(--paper)",
      boxShadow: hover && !disabled ? "var(--shadow-md)" : "var(--shadow-sm)"
    },
    secondary: {
      background: hover ? "var(--accent-100)" : "transparent",
      color: "var(--accent)",
      borderColor: "var(--accent)"
    },
    ghost: {
      background: hover ? "var(--accent-100)" : "transparent",
      color: "var(--accent)"
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setDown(false);
    },
    onMouseDown: () => setDown(true),
    onMouseUp: () => setDown(false),
    style: {
      ...base,
      ...(skins[variant] || skins.primary),
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Content surface. White card with restrained corners and a soft
 * cool-tinted shadow; optional accent rule on the top or left edge.
 */
function Card({
  accent = "none",
  padding = 24,
  children,
  style,
  ...rest
}) {
  const rule = "var(--border-accent-width) solid var(--accent)";
  const edge = accent === "top" ? {
    borderTop: rule
  } : accent === "left" ? {
    borderLeft: rule
  } : {};
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: "var(--paper)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-md)",
      border: "1px solid var(--border-subtle)",
      padding,
      ...edge,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  accent: {
    bg: "var(--accent-100)",
    fg: "var(--accent-dark)"
  },
  solid: {
    bg: "var(--accent)",
    fg: "var(--paper)"
  },
  neutral: {
    bg: "var(--ink-200)",
    fg: "var(--ink-700)"
  },
  cream: {
    bg: "var(--sabana-cream)",
    fg: "var(--sabana-blue)"
  }
};

/**
 * Small pill label / category tag.
 */
function Tag({
  tone = "accent",
  children,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.accent;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
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
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/data/ProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Labelled progress / share bar in the active accent.
 */
function ProgressBar({
  value = 0,
  label,
  showValue = true,
  height = 10,
  style,
  ...rest
}) {
  const pct = Math.max(0, Math.min(100, value));
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      fontFamily: "var(--font-sans)",
      ...style
    }
  }, rest), (label || showValue) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 6,
      fontSize: "var(--fs-small)",
      color: "var(--text-strong)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--fw-medium)"
    }
  }, label), showValue && /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--fw-bold)"
    }
  }, pct, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height,
      width: "100%",
      background: "var(--accent-100)",
      borderRadius: "var(--radius-pill)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: `${pct}%`,
      background: "var(--accent)",
      borderRadius: "var(--radius-pill)",
      transition: "width var(--dur-med) var(--ease-standard)"
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/data/Stat.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Big-figure statistic block — the institutional way to feature a KPI.
 * Large value in accent, label below, optional delta and caption.
 */
function Stat({
  value,
  label,
  delta,
  deltaDirection = "up",
  caption,
  align = "left",
  style,
  ...rest
}) {
  const deltaColor = deltaDirection === "down" ? "var(--fac-juridicas-500)" : "var(--fac-familia-700)";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      fontFamily: "var(--font-sans)",
      textAlign: align,
      display: "flex",
      flexDirection: "column",
      gap: 4,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 10,
      justifyContent: align === "center" ? "center" : "flex-start"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-display)",
      fontWeight: "var(--fw-black)",
      letterSpacing: "var(--ls-display)",
      lineHeight: 1,
      color: "var(--accent)"
    }
  }, value), delta != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-h4)",
      fontWeight: "var(--fw-bold)",
      color: deltaColor
    }
  }, deltaDirection === "down" ? "▾" : "▴", " ", delta)), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-lead)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-strong)"
    }
  }, label), caption && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-caption)",
      color: "var(--text-muted)"
    }
  }, caption));
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Stat.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.Stat = __ds_scope.Stat;

})();
