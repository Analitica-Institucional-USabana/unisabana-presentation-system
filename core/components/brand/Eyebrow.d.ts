import React from "react";

export interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Show the short accent rule before the label. */
  rule?: boolean;
  /** Override colour (defaults to the active accent). */
  color?: string;
  children?: React.ReactNode;
}

/**
 * Uppercase tracked kicker above a title — the institutional eyebrow.
 */
export function Eyebrow(props: EyebrowProps): JSX.Element;
