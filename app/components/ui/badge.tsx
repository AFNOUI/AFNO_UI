import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-(--badge-padding-x) py-(--badge-padding-y) text-(--badge-font-size) font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

/*
 * ============================================
 * TAILWIND CSS VARIABLES DOCUMENTATION
 * ============================================
 * This component uses Tailwind CSS variables defined in app/globals.css
 * 
 * Variables Used:
 * --------------
 * Colors - Badges (via badgeVariants):
 *   - hsl(var(--primary))               Line: 11 - Badge variant="default" class "bg-primary"
 *                             Default badge background color
 *   - hsl(var(--primary-foreground))    Line: 11 - Badge variant="default" class "text-primary-foreground"
 *                             Default badge contrast text color
 *   - hsl(var(--secondary))             Line: 12 - Badge variant="secondary" class "bg-secondary"
 *                             Secondary variant background color
 *   - hsl(var(--secondary-foreground))  Line: 12 - Badge variant="secondary" class "text-secondary-foreground"
 *                             Secondary variant text color
 *   - hsl(var(--destructive))           Line: 13 - Badge variant="destructive" class "bg-destructive"
 *                             Destructive variant background color
 *   - hsl(var(--destructive-foreground)) Line: 13 - Badge variant="destructive" class "text-destructive-foreground"
 *                             Destructive variant text color
 *   - hsl(var(--foreground))            Line: 14 - Badge variant="outline" class "text-foreground"
 *                             Outline variant text/icon color
 *   - hsl(var(--ring))                  Line: 7 - Badge root class "focus:ring-2 focus:ring-ring"
 *                             Focus ring color (2px) with ring variable
 *
 * Spacing (Custom CSS Variables via @theme):
 *   - --spacing-badge-padding-x: 0.625rem  Line: 7 - Badge root class "px-(--badge-padding-x)"
 *                             Horizontal padding (10px)
 *   - --spacing-badge-padding-y: 0.125rem  Line: 7 - Badge root class "py-(--badge-padding-y)"
 *                             Vertical padding (2px)
 *
 * Typography (Custom CSS Variables via @theme):
 *   - --font-size-badge-font-size: 0.75rem  Line: 7 - Badge root class "text-(--badge-font-size)"
 *                             Small text size (12px)
 * 
 * Usage Examples:
 * --------------
 * <Badge>Default</Badge>
 * <Badge variant="secondary">Secondary</Badge>
 * <Badge variant="destructive">Destructive</Badge>
 * <Badge variant="outline">Outline</Badge>
 */
