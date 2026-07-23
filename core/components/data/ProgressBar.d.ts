import React from "react";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100. */
  value?: number;
  label?: React.ReactNode;
  /** Show the percentage on the right. */
  showValue?: boolean;
  /** Track height in px. */
  height?: number;
}

/** Labelled progress / share bar in the active accent. */
export function ProgressBar(props: ProgressBarProps): JSX.Element;
