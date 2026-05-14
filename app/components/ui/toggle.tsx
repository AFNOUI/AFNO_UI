import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        lg: "h-11 px-5",
        sm: "h-9 px-2.5",
        default: "h-10 px-3",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  },
);

const Toggle = React.forwardRef<
  React.ComponentRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root ref={ref} className={cn(toggleVariants({ variant, size, className }))} {...props} />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };

/*
 * ============================================
 * TAILWIND CSS VARIABLES DOCUMENTATION
 * ============================================
 * This component uses Tailwind CSS variables defined in app/globals.css
 *
 * Variables Used:
 * --------------
 * Colors:
 *   - hsl(var(--accent))          Line: 8 - Toggle class "data-[state=on]:bg-accent hover:bg-accent"
 *                                 ON and outline hover background
 *   - hsl(var(--accent-foreground)) Line: 8 - Toggle class "data-[state=on]:text-accent-foreground
 *                                 hover:text-accent-foreground"
 *   - hsl(var(--muted))           Line: 8 - Toggle class "hover:bg-muted"
 *                                 Default hover background
 *   - hsl(var(--muted-foreground)) Line: 8 - Toggle class "hover:text-muted-foreground"
 *                                 Default hover text color
 *   - hsl(var(--input))           Line: 13 - Toggle outline variant "border-input"
 *                                 Outline border color
 *   - hsl(var(--ring))            Line: 8 - Toggle class "focus-visible:ring-ring"
 *                                 Focus ring color
 *
 * Layout:
 *   - border-radius: var(--radius) Line: 8 - Toggle class "rounded-md"
 */
