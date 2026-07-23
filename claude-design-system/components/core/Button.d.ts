import React from "react";

/**
 * Institutional button — solid accent (primary), outline (secondary) or text (ghost).
 * @startingPoint section="Core" subtitle="Primary / secondary / ghost button" viewport="360x120"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight. */
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * Institutional button. Colour follows the active `--accent`, so it adapts inside a `data-faculty` scope.
 */
export function Button(props: ButtonProps): JSX.Element;
