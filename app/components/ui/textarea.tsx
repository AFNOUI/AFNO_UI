import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };

/*
 * ============================================
 * TAILWIND CSS VARIABLES DOCUMENTATION
 * ============================================
 * This component uses Tailwind CSS variables defined in app/globals.css
 *
 * Variables Used:
 * --------------
 * Colors:
 *   - hsl(var(--input))           Line: 11 - Textarea class "border-input"
 *                                  Border color
 *   - hsl(var(--background))      Line: 11 - Textarea class "bg-background"
 *                                  Background color
 *   - hsl(var(--muted-foreground)) Line: 11 - Textarea class "placeholder:text-muted-foreground"
 *                                  Placeholder text color
 *   - hsl(var(--ring))            Line: 11 - Textarea class "focus-visible:ring-ring"
 *                                  Focus ring color
 *
 * Layout:
 *   - border-radius: var(--radius) Line: 11 - Textarea class "rounded-md"
 *                                  Corner radius
 */
