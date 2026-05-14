import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };

/*
 * ============================================
 * TAILWIND CSS VARIABLES DOCUMENTATION
 * ============================================
 * This component uses Tailwind CSS variables defined in app/globals.css
 *
 * Variables Used:
 * --------------
 * Colors:
 *   - hsl(var(--secondary)) Line: 15 - SliderTrack class "bg-secondary"
 *                             Track background color
 *   - hsl(var(--primary))   Line: 16 - SliderRange class "bg-primary"
 *                             Filled range color
 *   - hsl(var(--primary))   Line: 18 - SliderThumb class "border-primary"
 *                             Thumb border color
 *   - hsl(var(--background)) Line: 18 - SliderThumb class "bg-background"
 *                             Thumb background
 *   - hsl(var(--ring))      Line: 18 - SliderThumb class "focus-visible:ring-ring"
 *                             Focus ring color
 */
