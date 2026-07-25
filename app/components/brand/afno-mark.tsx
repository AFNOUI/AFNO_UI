/**
 * AfnoUI brand mark — "Block-Layers".
 *
 * An assembled, modular "A" coloured as stacked layers: a cyan apex block, a
 * violet mid row, and an indigo base — merging the "visual builders" (modules)
 * and "layered design system" (colour stack) ideas.
 *
 * SINGLE SOURCE OF TRUTH for the logo. The favicon (app/icon.tsx), Apple icon,
 * Open Graph image, and in-app headers all derive from `MARK_INNER` here, so
 * the logo can never drift between surfaces.
 */

export const BRAND = {
  cyan: "#22d3ee",
  violet: "#8b5cf6",
  indigo: "#6366f1",
} as const;

export const MARK_VIEWBOX = "0 0 120 120";

/** The 8 rounded modules that form the Block-Layers "A" (transparent bg). */
export const MARK_INNER = [
  // apex — cyan
  `<rect x="52.5" y="26" width="15" height="15" rx="3.5" fill="${BRAND.cyan}"/>`,
  // mid row — violet
  `<rect x="41" y="44" width="15" height="15" rx="3.5" fill="${BRAND.violet}"/>`,
  `<rect x="64" y="44" width="15" height="15" rx="3.5" fill="${BRAND.violet}"/>`,
  // crossbar — indigo
  `<rect x="41" y="62" width="15" height="15" rx="3.5" fill="${BRAND.indigo}"/>`,
  `<rect x="52.5" y="62" width="15" height="15" rx="3.5" fill="${BRAND.indigo}"/>`,
  `<rect x="64" y="62" width="15" height="15" rx="3.5" fill="${BRAND.indigo}"/>`,
  // feet — indigo
  `<rect x="33" y="80" width="15" height="15" rx="3.5" fill="${BRAND.indigo}"/>`,
  `<rect x="72" y="80" width="15" height="15" rx="3.5" fill="${BRAND.indigo}"/>`,
].join("");

/**
 * Single-colour version of the modules (fills inherit `currentColor`), for
 * places that need the mark in one ink — print, embroidery, disabled states,
 * or a monochrome favicon.
 */
export const MARK_INNER_MONO = MARK_INNER.replace(
  /fill="#[0-9a-fA-F]{6}"/g,
  'fill="currentColor"',
);

/** Full standalone SVG markup string (transparent background). */
export function markSvgString(size = 120): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_VIEWBOX}" width="${size}" height="${size}">${MARK_INNER}</svg>`;
}

/** SVG mark as a data URI — used by next/og routes via <img src=…>. */
export function markDataUri(size = 120): string {
  return `data:image/svg+xml,${encodeURIComponent(markSvgString(size))}`;
}

/** React SVG component for in-app use (header, sidebar, anywhere). */
export function AfnoMark({
  size = 28,
  className,
  title = "AfnoUI",
  monochrome = false,
}: {
  size?: number;
  className?: string;
  title?: string;
  /** Render in a single ink (inherits `currentColor`) instead of full colour. */
  monochrome?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={MARK_VIEWBOX}
      className={className}
      role="img"
      aria-label={title}
      dangerouslySetInnerHTML={{
        __html: monochrome ? MARK_INNER_MONO : MARK_INNER,
      }}
    />
  );
}
