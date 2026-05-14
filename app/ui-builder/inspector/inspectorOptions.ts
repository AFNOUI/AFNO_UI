/**
 * Tailwind class option sets used by `InspectorPanel` dropdowns. Kept as
 * plain string arrays so that downstream consumers can render them directly
 * inside `<Select>` / `<StyleSelect>` primitives without transformation.
 *
 * Extracted out of `InspectorPanel.tsx` to keep that file focused on the
 * actual editor UI. Adding a new option is a purely additive change here.
 */

export const FONT_SIZES = [
    "text-xs",
    "text-sm",
    "text-base",
    "text-lg",
    "text-xl",
    "text-2xl",
    "text-3xl",
    "text-4xl",
    "text-5xl",
];

export const FONT_WEIGHTS = [
    "font-thin",
    "font-light",
    "font-normal",
    "font-medium",
    "font-semibold",
    "font-bold",
    "font-extrabold",
];

export const TEXT_ALIGNS = ["text-start", "text-center", "text-end"];

export const TEXT_COLORS = [
    "text-foreground",
    "text-muted-foreground",
    "text-primary",
    "text-destructive",
    "text-secondary-foreground",
];

export const BG_COLORS = [
    "bg-background",
    "bg-card",
    "bg-muted",
    "bg-primary",
    "bg-secondary",
    "bg-accent",
    "bg-destructive",
    "bg-primary/5",
    "bg-primary/10",
    "bg-primary/20",
];

export const JUSTIFY = [
    "justify-start",
    "justify-center",
    "justify-end",
    "justify-between",
    "justify-around",
];

export const ALIGN_ITEMS = [
    "items-start",
    "items-center",
    "items-end",
    "items-stretch",
];

export const GAPS = [
    "gap-0",
    "gap-1",
    "gap-2",
    "gap-3",
    "gap-4",
    "gap-6",
    "gap-8",
    "gap-10",
    "gap-12",
];

export const GRID_COLS = [
    "grid-cols-1",
    "grid-cols-2",
    "grid-cols-3",
    "grid-cols-4",
    "grid-cols-5",
    "grid-cols-6",
];

export const BORDER_RADIUS = [
    "rounded-none",
    "rounded",
    "rounded-md",
    "rounded-lg",
    "rounded-xl",
    "rounded-2xl",
    "rounded-full",
];

export const SHADOWS = [
    "shadow-none",
    "shadow-sm",
    "shadow",
    "shadow-md",
    "shadow-lg",
    "shadow-xl",
    "shadow-2xl",
    "shadow-inner",
];

export const BORDER_WIDTHS = ["border-0", "border", "border-2", "border-4"];

export const BORDER_COLORS = [
    "border-border",
    "border-primary",
    "border-primary/20",
    "border-primary/50",
    "border-destructive",
    "border-muted",
];

export const DISPLAYS = ["block", "flex", "grid", "inline", "inline-flex", "hidden"];

export const OVERFLOW = [
    "overflow-visible",
    "overflow-hidden",
    "overflow-scroll",
    "overflow-auto",
];

export const POSITIONS = ["static", "relative", "absolute", "fixed", "sticky"];
export const Z_INDEX = ["z-0", "z-10", "z-20", "z-30", "z-40", "z-50"];

export const FLEX_DIRECTION = [
    "flex-row",
    "flex-col",
    "flex-row-reverse",
    "flex-col-reverse",
];

export const FLEX_WRAP = ["flex-wrap", "flex-nowrap", "flex-wrap-reverse"];

export const OPACITY = [
    "opacity-100",
    "opacity-90",
    "opacity-80",
    "opacity-70",
    "opacity-60",
    "opacity-50",
    "opacity-40",
    "opacity-30",
    "opacity-20",
    "opacity-10",
    "opacity-0",
];

export const WIDTH_PRESETS = [
    { label: "Auto", value: "w-auto" },
    { label: "Full", value: "w-full" },
    { label: "Screen", value: "w-screen" },
    { label: "Fit", value: "w-fit" },
    { label: "Min", value: "w-min" },
    { label: "Max", value: "w-max" },
    { label: "50%", value: "w-1/2" },
    { label: "33%", value: "w-1/3" },
    { label: "67%", value: "w-2/3" },
    { label: "25%", value: "w-1/4" },
    { label: "75%", value: "w-3/4" },
    { label: "20%", value: "w-1/5" },
    { label: "80%", value: "w-4/5" },
    { label: "64px", value: "w-16" },
    { label: "128px", value: "w-32" },
    { label: "192px", value: "w-48" },
    { label: "256px", value: "w-64" },
    { label: "320px", value: "w-80" },
    { label: "384px", value: "w-96" },
];

export const HEIGHT_PRESETS = [
    { label: "Auto", value: "h-auto" },
    { label: "Full", value: "h-full" },
    { label: "Screen", value: "h-screen" },
    { label: "Fit", value: "h-fit" },
    { label: "Min", value: "h-min" },
    { label: "Max", value: "h-max" },
    { label: "32px", value: "h-8" },
    { label: "48px", value: "h-12" },
    { label: "64px", value: "h-16" },
    { label: "96px", value: "h-24" },
    { label: "128px", value: "h-32" },
    { label: "160px", value: "h-40" },
    { label: "192px", value: "h-48" },
    { label: "256px", value: "h-64" },
    { label: "320px", value: "h-80" },
    { label: "384px", value: "h-96" },
];

export const MIN_WIDTH_PRESETS = [
    { label: "0", value: "min-w-0" },
    { label: "Full", value: "min-w-full" },
    { label: "Min", value: "min-w-min" },
    { label: "Max", value: "min-w-max" },
    { label: "Fit", value: "min-w-fit" },
];

export const MAX_WIDTH_PRESETS = [
    { label: "None", value: "max-w-none" },
    { label: "XS", value: "max-w-xs" },
    { label: "SM", value: "max-w-sm" },
    { label: "MD", value: "max-w-md" },
    { label: "LG", value: "max-w-lg" },
    { label: "XL", value: "max-w-xl" },
    { label: "2XL", value: "max-w-2xl" },
    { label: "3XL", value: "max-w-3xl" },
    { label: "4XL", value: "max-w-4xl" },
    { label: "5XL", value: "max-w-5xl" },
    { label: "6XL", value: "max-w-6xl" },
    { label: "7XL", value: "max-w-7xl" },
    { label: "Full", value: "max-w-full" },
    { label: "Screen SM", value: "max-w-screen-sm" },
    { label: "Screen MD", value: "max-w-screen-md" },
    { label: "Screen LG", value: "max-w-screen-lg" },
    { label: "Screen XL", value: "max-w-screen-xl" },
];

export const MIN_HEIGHT_PRESETS = [
    { label: "0", value: "min-h-0" },
    { label: "Full", value: "min-h-full" },
    { label: "Screen", value: "min-h-screen" },
    { label: "Min", value: "min-h-min" },
    { label: "Max", value: "min-h-max" },
    { label: "Fit", value: "min-h-fit" },
];

export const MAX_HEIGHT_PRESETS = [
    { label: "None", value: "max-h-none" },
    { label: "Full", value: "max-h-full" },
    { label: "Screen", value: "max-h-screen" },
    { label: "Min", value: "max-h-min" },
    { label: "Max", value: "max-h-max" },
    { label: "Fit", value: "max-h-fit" },
    { label: "48px", value: "max-h-12" },
    { label: "96px", value: "max-h-24" },
    { label: "256px", value: "max-h-64" },
    { label: "384px", value: "max-h-96" },
];
