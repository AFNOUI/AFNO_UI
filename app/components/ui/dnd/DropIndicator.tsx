/**
 * Visual slot indicator rendered at the computed insertion index inside a zone.
 * Stable identity — same element, same key, no animation churn — eliminates the
 * "indicator flicker" that pure HTML5 DnD produces. Smoothly fades + scales in
 * so reorder feels animated even though we never re-mount items.
 */
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  /** Layout axis of the parent zone. Affects shape (horizontal bar vs vertical bar). */
  axis?: "x" | "y";
  /** When provided, the indicator renders as a real-sized "ghost slot" matching
   *  the dragged item's dimensions instead of a thin bar. */
  size?: { width: number; height: number };
  /** Disable the fade/zoom animation (used in reduce-motion mode). */
  animated?: boolean;
}

export function DropIndicator({ className, axis = "y", size, animated = true }: Props) {
  // Sized ghost slot — opens a real gap matching the dragged card. This is
  // what gives the board the "card slides into place" feel from the demo.
  if (size && size.width > 0 && size.height > 0) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "rounded-md border-2 border-dashed border-primary/50 bg-primary/10",
          animated && "animate-in fade-in zoom-in-95 duration-150",
          className,
        )}
        style={{ width: size.width, height: size.height }}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={cn(
        axis === "y" && "h-2 w-full rounded-sm border border-dashed border-primary/60 bg-primary/15",
        axis === "x" && "h-full min-h-8 w-2 rounded-sm border border-dashed border-primary/60 bg-primary/15 self-stretch",
        animated && "animate-in fade-in zoom-in-95 duration-150",
        className,
      )}
    />
  );
}