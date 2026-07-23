import React from "react";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Colour treatment. */
  tone?: "accent" | "solid" | "neutral" | "cream";
  children?: React.ReactNode;
}

/** Small pill label / category tag. Colour tracks the active accent. */
export function Tag(props: TagProps): JSX.Element;
