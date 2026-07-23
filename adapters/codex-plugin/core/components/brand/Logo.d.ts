import React from "react";

/**
 * Which official lockup to render, sizing and asset path.
 * @startingPoint section="Brand" subtitle="Official logo lockup" viewport="360x120"
 */
export interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Which official lockup to render. `mono` is a tintable-black SVG. */
  variant?: "color" | "white" | "mono";
  /** Rendered height in px. Floored at 22px (brand-book minimum). */
  height?: number;
  /** Path to the assets folder, relative to the consuming page. */
  basePath?: string;
  alt?: string;
}

/**
 * Official La Sabana horizontal logo. Use `color` on light backgrounds,
 * `white` on dark/photographic backgrounds. Never recolour, stretch or
 * reposition the mark.
 */
export function Logo(props: LogoProps): JSX.Element;
