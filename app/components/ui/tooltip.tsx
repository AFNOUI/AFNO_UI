import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipProvider = TooltipPrimitive.Provider;

const TooltipArrow = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Arrow>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Arrow>
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Arrow
    ref={ref}
    width={16}
    height={8}
    className={cn(
      "fill-popover stroke-border stroke-[1.5] -translate-y-[0.5px]",
      className
    )}
    {...props}
  />
));
TooltipArrow.displayName = "TooltipArrow";

interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  showArrow?: boolean;
  arrowClassName?: string;
}

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, sideOffset = 4, showArrow = false, arrowClassName, children, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-tooltip-radius border border-border bg-popover px-tooltip-padding-x py-tooltip-padding-y text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      // "z-50 overflow-hidden rounded-(--tooltip-radius) border border-border bg-popover px-(--tooltip-padding-x) py-(--tooltip-padding-y) text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  >
    {children}
    {showArrow && (
      <TooltipArrow className={arrowClassName} />
    )}
  </TooltipPrimitive.Content>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TooltipArrow };

// /* Add these to your global CSS file (e.g., globals.css) */
// @layer base {
//   :root {
//     /* --- Colors --- */
//     --popover: ...;
//     --popover-foreground: ...;
//     --border: ...;

//     /* --- Spacing/Layout --- */
//     --tooltip-radius: 0.25rem;
//     --tooltip-padding-x: 0.75rem;
//     --tooltip-padding-y: 0.375rem;
//   }
// }
