import React from "react";

const FILES = {
  color: "logo-horizontal-color.png",
  white: "logo-horizontal-white.png",
  mono: "logo-horizontal-mono.svg",
};

/**
 * Official Universidad de La Sabana horizontal logo lockup.
 * Renders the supplied brand asset — never a redrawn mark.
 * Enforces the brand-book minimum symbol height (22px) via a floor on `height`.
 */
export function Logo({
  variant = "color",
  height = 48,
  basePath = "assets",
  alt = "Universidad de La Sabana",
  style,
  ...rest
}) {
  const h = Math.max(22, height); // brand-book minimum symbol height
  const file = FILES[variant] || FILES.color;
  return (
    <img
      src={`${basePath}/${file}`}
      alt={alt}
      style={{ height: h, width: "auto", display: "block", ...style }}
      {...rest}
    />
  );
}
