# AfnoUI — Brand assets

The AfnoUI mark is **"Block-Layers"**: an assembled, modular "A" coloured as
stacked layers (cyan apex → violet mid → indigo base). It fuses the product's
two core ideas — the **visual builders** (modules) and the **layered design
system** (colour stack).

> **Source of truth:** `app/components/brand/afno-mark.tsx`. The favicon
> (`app/icon.tsx`), Apple icon, Open Graph card (`app/opengraph-image.tsx`), and
> in-app headers all derive from it. The SVGs in this folder are exports for
> external use (social, docs, npm) — regenerate them if the mark changes.

## Files

| File | Use |
| --- | --- |
| `afno-mark.svg` | Full-colour mark, transparent background |
| `afno-mark-mono-dark.svg` | Single-ink mark (#0a0a0c) for light backgrounds |
| `afno-mark-mono-light.svg` | Single-ink mark (#ffffff) for dark backgrounds |
| `afno-lockup.svg` | Horizontal lockup: mark + "AfnoUI" wordmark |
| `afno-avatar.svg` | 1024×1024 square avatar (dark tile) — Reddit / Instagram profile |
| `afno-banner.svg` | 1280×640 banner — README / npm / social header |

## Colours

| Token | Hex | Role |
| --- | --- | --- |
| Cyan | `#22d3ee` | Apex module |
| Violet | `#8b5cf6` | Mid row |
| Indigo | `#6366f1` | Base + primary brand colour |
| Ink | `#0a0a0c` | Dark background |

Wordmark: `Afno` in foreground, `UI` in indigo (`#6366f1`).

## Getting PNGs (for social uploads)

Reddit and Instagram need raster images. Two easy ways:

1. **Use the live routes** (already rendered as PNG by the site):
   - Square icon (512×512): `https://afnoui.com/icon` — works as a profile avatar.
   - Social card (1200×630): `https://afnoui.com/opengraph-image`.
2. **Convert an SVG here** to PNG with any tool, e.g.:
   ```bash
   # avatar → 1024px PNG (using rsvg-convert or resvg / an online converter)
   rsvg-convert -w 1024 -h 1024 brand/afno-avatar.svg -o afno-avatar.png
   ```
   or open the `.svg` in a browser and export/screenshot at 2× for crisp output.

## Clear space & minimum size

- Keep clear space around the mark equal to one module (~⅛ of the mark width).
- Minimum favicon size is **16 px** — the mark is designed to stay legible there.
- Never recolour individual modules, stretch, or add effects; use the mono
  variants when a single ink is required.
