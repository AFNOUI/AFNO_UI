/**
 * Variable order + section comments for Export tab output (aligned with `app/globals.css`).
 * When you add tokens to globals.css, add them here so exports stay structured.
 *
 * - `darkTitle: false` — no section comment in `.dark` (matches globals.css).
 * - `darkTitle: "…"` — alternate comment for `.dark`.
 * - `omitInDark` on a var — skip that line in `.dark` (e.g. `--radius` inherits from `:root`).
 */
export type GlobalsExportPlanEntry =
  | { kind: "section"; title: string; darkTitle?: string | false }
  | { kind: "var"; name: string; omitInDark?: boolean };

export const GLOBALS_EXPORT_PLAN: GlobalsExportPlanEntry[] = [
  { kind: "section", title: "Core palette", darkTitle: false },
  { kind: "var", name: "--background" },
  { kind: "var", name: "--foreground" },
  { kind: "var", name: "--card" },
  { kind: "var", name: "--card-foreground" },
  { kind: "var", name: "--popover" },
  { kind: "var", name: "--popover-foreground" },
  { kind: "section", title: "Primary - Emerald accent", darkTitle: "Primary - Emerald glow" },
  { kind: "var", name: "--primary" },
  { kind: "var", name: "--primary-foreground" },
  { kind: "section", title: "Secondary" },
  { kind: "var", name: "--secondary" },
  { kind: "var", name: "--secondary-foreground" },
  { kind: "section", title: "Muted" },
  { kind: "var", name: "--muted" },
  { kind: "var", name: "--muted-foreground" },
  { kind: "section", title: "Accent" },
  { kind: "var", name: "--accent" },
  { kind: "var", name: "--accent-foreground" },
  { kind: "var", name: "--destructive" },
  { kind: "var", name: "--destructive-foreground" },
  { kind: "var", name: "--border" },
  { kind: "var", name: "--input" },
  { kind: "var", name: "--ring" },
  { kind: "var", name: "--ring-offset" },
  { kind: "var", name: "--radius", omitInDark: true },
  { kind: "section", title: "Component Sizing Variables" },
  { kind: "var", name: "--btn-height-sm" },
  { kind: "var", name: "--btn-height-md" },
  { kind: "var", name: "--btn-height-lg" },
  { kind: "var", name: "--btn-padding-x-sm" },
  { kind: "var", name: "--btn-padding-x-md" },
  { kind: "var", name: "--btn-padding-x-lg" },
  { kind: "var", name: "--btn-font-size-sm" },
  { kind: "var", name: "--btn-font-size-md" },
  { kind: "var", name: "--btn-font-size-lg" },
  { kind: "var", name: "--input-height-sm" },
  { kind: "var", name: "--input-height-md" },
  { kind: "var", name: "--input-height-lg" },
  { kind: "var", name: "--input-padding-x" },
  { kind: "var", name: "--card-padding" },
  { kind: "var", name: "--card-gap" },
  { kind: "var", name: "--badge-padding-x" },
  { kind: "var", name: "--badge-padding-y" },
  { kind: "var", name: "--badge-font-size" },
  { kind: "section", title: "Custom Lab tokens" },
  { kind: "var", name: "--surface-elevated" },
  { kind: "var", name: "--surface-sunken" },
  { kind: "var", name: "--editor-bg" },
  { kind: "var", name: "--preview-bg" },
  { kind: "var", name: "--glow-primary" },
  { kind: "section", title: "Tooltip tokens" },
  { kind: "var", name: "--tooltip-bg" },
  { kind: "var", name: "--tooltip-foreground" },
  { kind: "var", name: "--tooltip-arrow-size" },
  { kind: "var", name: "--tooltip-padding-x" },
  { kind: "var", name: "--tooltip-padding-y" },
  { kind: "var", name: "--tooltip-radius" },
  { kind: "section", title: "Progress tokens" },
  { kind: "var", name: "--progress-height" },
  { kind: "var", name: "--progress-radius" },
  { kind: "var", name: "--progress-track" },
  { kind: "var", name: "--progress-indicator" },
  { kind: "var", name: "--progress-success" },
  { kind: "var", name: "--progress-warning" },
  { kind: "var", name: "--progress-error" },
  { kind: "section", title: "Sidebar" },
  { kind: "var", name: "--sidebar-background" },
  { kind: "var", name: "--sidebar-foreground" },
  { kind: "var", name: "--sidebar-primary" },
  { kind: "var", name: "--sidebar-primary-foreground" },
  { kind: "var", name: "--sidebar-accent" },
  { kind: "var", name: "--sidebar-accent-foreground" },
  { kind: "var", name: "--sidebar-border" },
  { kind: "var", name: "--sidebar-ring" },
];

const PLANNED_NAMES = new Set(
  GLOBALS_EXPORT_PLAN.filter((e): e is { kind: "var"; name: string } => e.kind === "var").map((e) => e.name),
);

export type GlobalsExportVariant = "light" | "dark";

export function resolveSectionHeading(
  entry: Extract<GlobalsExportPlanEntry, { kind: "section" }>,
  variant: GlobalsExportVariant,
): string | null {
  if (variant === "light") return entry.title;
  if (entry.darkTitle === false) return null;
  if (typeof entry.darkTitle === "string") return entry.darkTitle;
  return entry.title;
}

export function shouldIncludePlannedVar(
  entry: Extract<GlobalsExportPlanEntry, { kind: "var" }>,
  variant: GlobalsExportVariant,
): boolean {
  if (variant === "dark" && entry.omitInDark) return false;
  return true;
}

/** Names in `vars` not covered by {@link GLOBALS_EXPORT_PLAN} (e.g. new Lab tokens). */
export function listUnplannedVariables(vars: { name: string }[]): { name: string }[] {
  return vars.filter((v) => !PLANNED_NAMES.has(v.name));
}
