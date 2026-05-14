import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");

const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root dir="auto" ref={ref} className={cn(labelVariants(), className)} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };

// /* Add these to your global CSS file (e.g., globals.css) */
/*
 * ============================================
 * TAILWIND CSS VARIABLES DOCUMENTATION
 * ============================================
 * This component uses Tailwind CSS variables defined in app/globals.css
 * 
 * Notes:
 * ------
 * This component is a thin wrapper around Radix UI's Label primitive.
 * It primarily uses hardcoded Tailwind utility classes for styling:
 *   - text-sm (small text size, 14px)
 *   - font-medium (500 font weight)
 *   - leading-none (tight line height)
 *   - peer-disabled classes for disabled state styling
 * 
 * No CSS variables are directly used in this component.
 */
