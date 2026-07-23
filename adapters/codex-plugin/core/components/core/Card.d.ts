import React from "react";

/**
 * Content surface — white, restrained corners, soft shadow, optional accent rule.
 * @startingPoint section="Core" subtitle="Content card with optional accent rule" viewport="380x200"
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accent rule placement. */
  accent?: "none" | "top" | "left";
  /** Inner padding in px. */
  padding?: number;
  children?: React.ReactNode;
}

/** Content surface — white, restrained corners, soft shadow, optional accent rule. */
export function Card(props: CardProps): JSX.Element;
