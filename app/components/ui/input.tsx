import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-(--input-height-md) w-full rounded-(--radius) border border-input bg-background px-(--input-padding-x) py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

/*
 * ============================================
 * TAILWIND CSS VARIABLES DOCUMENTATION
 * ============================================
 * This component uses Tailwind CSS variables defined in app/globals.css
 *
 * Variables Used:
 * --------------
 * Colors:
 *   - hsl(var(--input))           Line: 11 - Input class "border-input"
 *                                  Border color
 *   - hsl(var(--background))      Line: 11 - Input class "bg-background"
 *                                  Background color
 *   - hsl(var(--foreground))      Line: 11 - Input class "file:text-foreground"
 *                                  File input text color
 *   - hsl(var(--muted-foreground)) Line: 11 - Input class "placeholder:text-muted-foreground"
 *                                  Placeholder text color
 *   - hsl(var(--ring))            Line: 11 - Input class "focus-visible:ring-ring"
 *                                  Focus ring color
 *
 * Layout (Custom CSS Variables via @theme):
 *   - --height-input-height-md   Line: 11 - Input class "h-(--input-height-md)"
 *   - --spacing-input-padding-x  Line: 11 - Input class "px-(--input-padding-x)"
 *   - border-radius: var(--radius) Line: 11 - Input class "rounded-(--radius)"
 */
