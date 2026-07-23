// Punto de entrada único de core/components/.
// Convención ya esperada por claude-design-system/_adherence.oxlintrc.json
// ("Import design-system components from 'index.js', not component internals").
// Los .jsx de este directorio son copias byte-idénticas de
// claude-design-system/components/**/*.jsx (Hito 1) — no se modificó ningún componente.

export { Eyebrow } from "./brand/Eyebrow.jsx";
export type { EyebrowProps } from "./brand/Eyebrow.d.ts";
export { Logo } from "./brand/Logo.jsx";
export type { LogoProps } from "./brand/Logo.d.ts";

export { Button } from "./core/Button.jsx";
export type { ButtonProps } from "./core/Button.d.ts";
export { Card } from "./core/Card.jsx";
export type { CardProps } from "./core/Card.d.ts";
export { Tag } from "./core/Tag.jsx";
export type { TagProps } from "./core/Tag.d.ts";

export { Stat } from "./data/Stat.jsx";
export type { StatProps } from "./data/Stat.d.ts";
export { ProgressBar } from "./data/ProgressBar.jsx";
export type { ProgressBarProps } from "./data/ProgressBar.d.ts";
