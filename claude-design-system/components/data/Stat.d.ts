import React from "react";

/**
 * Big-figure KPI block — large value in the active accent, label + optional delta and source.
 * @startingPoint section="Data" subtitle="Featured KPI figure" viewport="320x180"
 */
export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The headline figure, e.g. "18%" or "12.4K". */
  value: React.ReactNode;
  /** Short descriptor under the figure. */
  label?: React.ReactNode;
  /** Optional change indicator, e.g. "3.2 pts". */
  delta?: React.ReactNode;
  deltaDirection?: "up" | "down";
  /** Source / period line. */
  caption?: React.ReactNode;
  align?: "left" | "center";
}

/** Big-figure KPI block — large value in the active accent, label + optional delta and source. */
export function Stat(props: StatProps): JSX.Element;
