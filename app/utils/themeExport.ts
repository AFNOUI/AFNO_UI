import type { ColorFormat } from "@/utils/colorUtils";
import { formatCssVariableColorValue } from "@/utils/colorUtils";
import type { CSSVariable } from "@/types/cssVariable";
import {
  GLOBALS_EXPORT_PLAN,
  listUnplannedVariables,
  resolveSectionHeading,
  shouldIncludePlannedVar,
  type GlobalsExportVariant,
} from "@/data/globalsCssExportPlan";

/** Optional keyframes bundled with v4 @theme (matches `app/globals.css`). */
export const V4_THEME_OPTIONAL_ANIMATIONS = `
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  --animation-fade-in-up: fade-in-up 0.4s ease-out forwards;

  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px -5px hsl(var(--glow-primary) / 0.4); }
    50% { box-shadow: 0 0 30px -5px hsl(var(--glow-primary) / 0.6); }
  }
  --animation-pulse-glow: pulse-glow 2s ease-in-out infinite;

  @keyframes logo-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  --animation-logo-spin: logo-spin 20s linear infinite;`.trimEnd();

/**
 * Maps a :root custom property to a Tailwind v4 `@theme` line (non-color tokens).
 * Convention mirrors `app/globals.css`: spacing-, height-, font-size-, radius-*.
 * New variables follow the same naming patterns to appear automatically.
 */
export function inferTailwindV4DimensionLine(cssVarName: string): string | null {
  if (cssVarName === "--radius") {
    return `  --radius-radius: var(${cssVarName});`;
  }
  // e.g. --tooltip-radius → --radius-tooltip-radius (--radius handled above)
  if (/^--[a-z0-9]+(?:-[a-z0-9]+)*-radius$/i.test(cssVarName)) {
    return `  --radius-${cssVarName.slice(2)}: var(${cssVarName});`;
  }
  if (
    /-padding-|[-]padding$/i.test(cssVarName) ||
    /-gap$/i.test(cssVarName) ||
    /-arrow-size$/i.test(cssVarName)
  ) {
    return `  --spacing-${cssVarName.slice(2)}: var(${cssVarName});`;
  }
  if (
    /^--(btn|input)-height-/i.test(cssVarName) ||
    cssVarName === "--progress-height" ||
    /^--[a-z0-9]+-height-[a-z0-9]/i.test(cssVarName)
  ) {
    return `  --height-${cssVarName.slice(2)}: var(${cssVarName});`;
  }
  if (
    (/^--[a-z0-9-]+-font-size-/i.test(cssVarName) || cssVarName === "--badge-font-size") &&
    !/^--font-size-/i.test(cssVarName)
  ) {
    return `  --font-size-${cssVarName.slice(2)}: var(${cssVarName});`;
  }
  return null;
}

/**
 * One `:root` or `.dark` block for Global CSS export — variable order and section comments
 * follow `app/data/globalsCssExportPlan.ts` (aligned with `app/globals.css`).
 */
export function buildGlobalsRootSelectorBlock(
  vars: CSSVariable[],
  selector: string,
  colorFormat: ColorFormat,
  opts: {
    variant: GlobalsExportVariant;
    describeColor?: (v: CSSVariable) => string | undefined;
  },
): string {
  const map = new Map(vars.map((v) => [v.name, v]));
  const { variant, describeColor } = opts;
  const lines: string[] = [];

  for (const entry of GLOBALS_EXPORT_PLAN) {
    if (entry.kind === "section") {
      const heading = resolveSectionHeading(entry, variant);
      if (heading) lines.push(`    /* ${heading} */`);
      continue;
    }
    if (!shouldIncludePlannedVar(entry, variant)) continue;
    const v = map.get(entry.name);
    if (!v) continue;
    if (v.category === "color") {
      const formattedValue = formatCssVariableColorValue(v.value, colorFormat);
      const hint = describeColor?.(v);
      const comment = hint ? ` /* ${hint} */` : "";
      lines.push(`    ${v.name}: ${formattedValue};${comment}`);
    } else {
      lines.push(`    ${v.name}: ${v.value}${v.unit || ""};`);
    }
  }

  const unplanned = listUnplannedVariables(vars)
    .map((u) => map.get(u.name))
    .filter((v): v is CSSVariable => Boolean(v))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (unplanned.length > 0) {
    lines.push(
      `    /* Additional tokens (extend globalsCssExportPlan.ts to group like globals.css) */`,
    );
    for (const v of unplanned) {
      if (v.category === "color") {
        const formattedValue = formatCssVariableColorValue(v.value, colorFormat);
        const hint = describeColor?.(v);
        const comment = hint ? ` /* ${hint} */` : "";
        lines.push(`    ${v.name}: ${formattedValue};${comment}`);
      } else {
        lines.push(`    ${v.name}: ${v.value}${v.unit || ""};`);
      }
    }
  }

  const body = lines.join("\n");
  return `  ${selector} {\n${body}\n  }`;
}

export function buildTailwindV4ColorLines(vars: CSSVariable[], colorFormat: ColorFormat): string {
  return vars
    .filter((v) => v.category === "color")
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((v) => {
      const key = v.name.slice(2);
      if (colorFormat === "hsl") {
        return `  --color-${key}: hsl(var(${v.name}));`;
      }
      return `  --color-${key}: var(${v.name});`;
    })
    .join("\n");
}

export function buildTailwindV4DimensionLines(vars: CSSVariable[]): string {
  const known = new Set(vars.map((v) => v.name));
  const lines = new Set<string>();
  for (const v of vars) {
    if (v.category === "color") continue;
    const line = inferTailwindV4DimensionLine(v.name);
    if (line && known.has(v.name)) lines.add(line);
  }
  return Array.from(lines).sort().join("\n");
}

export function buildTailwindV4ThemeBlock(
  lightVars: CSSVariable[],
  colorFormat: ColorFormat,
  options?: { includeAnimations?: boolean },
): string {
  const includeAnimations = options?.includeAnimations !== false;
  const colorLines = buildTailwindV4ColorLines(lightVars, colorFormat);
  const dimensionLines = buildTailwindV4DimensionLines(lightVars);
  const formatNote =
    colorFormat === "hsl"
      ? "Matches app/globals.css: :root holds HSL channels; @theme wraps with hsl(var(...))."
      : "AfnoUI defaults assume HSL channels in :root. For HEX/RGB/OKLCH, adjust @theme wrappers to match how each variable is stored.";

  const tail = includeAnimations ? `\n\n${V4_THEME_OPTIONAL_ANIMATIONS}` : "";

  return `/* Tailwind CSS v4 — merge into globals.css after @import "tailwindcss" and @layer base tokens.
   ${formatNote}
*/
@theme {
${colorLines}

${dimensionLines}${tail}
}`;
}

/** Tailwind v3.x / v2 — `theme.extend` when `@theme` is not available. */
export function buildTailwindV3ConfigSnippet(lightVars: CSSVariable[], colorFormat: ColorFormat): string {
  const colors: Record<string, string> = {};
  for (const v of lightVars.filter((x) => x.category === "color").sort((a, b) => a.name.localeCompare(b.name))) {
    const k = v.name.replace(/^--/, "");
    if (colorFormat === "hsl") {
      colors[k] = `hsl(var(${v.name}) / <alpha-value>)`;
    } else {
      colors[k] = `var(${v.name})`;
    }
  }

  const colorsJson = JSON.stringify(colors, null, 6).replace(/"/g, "'");

  return `// tailwind.config.ts — Tailwind CSS v3.x (no @theme)
// Merge into theme.extend (preserve your content, plugins, etc.)
// Requires CSS variables on :root (see Global CSS export). Color format: ${colorFormat.toUpperCase()}
// For hsl + opacity modifiers, Tailwind v3.4+ uses the "/ <alpha-value>" form below.
// Adjust "content" globs to match your project.

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: ${colorsJson},
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
`;
}
