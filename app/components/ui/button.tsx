import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-(--radius) font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        icon: "h-(--btn-height-md) w-(--btn-height-md)",
        default: "h-(--btn-height-md) px-(--btn-padding-x-md) py-2 text-(--btn-font-size-md)",
        sm: "h-(--btn-height-sm) rounded-(--radius) px-(--btn-padding-x-sm) text-(--btn-font-size-sm)",
        lg: "h-(--btn-height-lg) rounded-(--radius) px-(--btn-padding-x-lg) text-(--btn-font-size-lg)",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  },
);

/** Union of allowed `variant` values for `<Button />` (use when binding JSON/config strings). */
export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

/*
 * ============================================
 * TAILWIND CSS VARIABLES DOCUMENTATION
 * ============================================
 * This component uses Tailwind CSS variables defined in app/globals.css
 * 
 * Variables Used:
 * --------------
 * Layout & Border:
 *   - --radius-radius: 0.625rem          Line: 8 - Button root class "rounded-(--radius)"
 *                             Standard corner radius
 *
 * Button Sizes (Height, Padding, Font-size):
 *   - --height-btn-height-sm: 2.25rem     Line: 22 - Button size="sm" class "h-(--btn-height-sm)"
 *                             Small button height (36px)
 *   - --height-btn-height-md: 2.5rem      Line: 21 - Button size="icon"/"default" class "h-(--btn-height-md)"
 *                             Medium/default button height (40px)
 *   - --height-btn-height-lg: 2.75rem     Line: 23 - Button size="lg" class "h-(--btn-height-lg)"
 *                             Large button height (44px)
 *
 *   - --spacing-btn-padding-x-sm: 0.75rem Line: 22 - Button size="sm" class "px-(--btn-padding-x-sm)"
 *                             Small button horizontal padding (12px)
 *   - --spacing-btn-padding-x-md: 1rem    Line: 21 - Button size="default" class "px-(--btn-padding-x-md)"
 *                             Medium button horizontal padding (16px)
 *   - --spacing-btn-padding-x-lg: 2rem    Line: 23 - Button size="lg" class "px-(--btn-padding-x-lg)"
 *                             Large button horizontal padding (32px)
 *
 *   - --font-size-btn-font-size-sm: 0.75rem   Line: 22 - Button size="sm" class "text-(--btn-font-size-sm)"
 *                             Small button text (12px)
 *   - --font-size-btn-font-size-md: 0.875rem  Line: 21 - Button size="default" class "text-(--btn-font-size-md)"
 *                             Medium button text (14px)
 *   - --font-size-btn-font-size-lg: 1rem      Line: 23 - Button size="lg" class "text-(--btn-font-size-lg)"
 *                             Large button text (16px)
 *
 * Colors - Used in Button Variants:
 *   - hsl(var(--background))              Line: 17 - Button variant="ghost" class "hover:bg-accent"
 *                             Line: 18 - Button variant="link" class "text-primary"
 *                             Line: 17 - Button variant="ghost" class "hover:text-accent-foreground"
 *                             Background and text colors
 *   - hsl(var(--foreground))              Line: 18 - Button variant="link" class "text-primary"
 *                             Line: 17 - Button variant="outline" class "hover:text-accent-foreground"
 *                             Text color
 *   - hsl(var(--primary))                 Line: 14 - Button variant="default" class "bg-primary"
 *                             Line: 8 - Button root class "focus-visible:ring-ring"
 *                             Primary background and ring color
 *   - hsl(var(--primary-foreground))      Line: 14 - Button variant="default" class "text-primary-foreground"
 *                             Primary button text color
 *   - hsl(var(--secondary))               Line: 15 - Button variant="secondary" class "bg-secondary"
 *                             Secondary button background
 *   - hsl(var(--secondary-foreground))    Line: 15 - Button variant="secondary" class "text-secondary-foreground"
 *                             Secondary button text color
 *   - hsl(var(--destructive))             Line: 16 - Button variant="destructive" class "bg-destructive"
 *                             Destructive button background
 *   - hsl(var(--destructive-foreground))  Line: 16 - Button variant="destructive" class "text-destructive-foreground"
 *                             Destructive button text color
 *   - hsl(var(--accent))                  Line: 17 - Button variant="ghost" class "hover:bg-accent"
 *                             Line: 17 - Button variant="link" class "hover:text-primary"
 *                             Line: 17 - Button variant="outline" class "hover:bg-accent"
 *                             Hover/active state background
 *   - hsl(var(--accent-foreground))       Line: 17 - Button variant="ghost" class "hover:text-accent-foreground"
 *                             Line: 17 - Button variant="outline" class "hover:text-accent-foreground"
 *                             Hover/active state text color
 *   - hsl(var(--ring))                    Line: 8 - Button root class "focus-visible:ring-ring"
 *                             2px focus ring border color
 *   - hsl(var(--ring-offset))             Line: 8 - Button root class "ring-offset-background"
 *                             Focus ring offset background color
 *   - hsl(var(--input))                   Line: 17 - Button variant="outline" class "border border-input"
 *                             Outline button border color
 * 
 * Usage Examples:
 * --------------
 * <Button>Default</Button>
 * <Button variant="outline">Outline</Button>
 * <Button variant="destructive">Delete</Button>
 * <Button size="sm">Small</Button>
 * <Button size="lg">Large</Button>
 */
