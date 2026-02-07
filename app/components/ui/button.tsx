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

// /* Add these to your global CSS file (e.g., globals.css) */
// @layer base {
//   :root {
//     /* --- Layout & Border --- */
//     --radius: 0.5rem;               /* Used for rounded-(--radius) */

//     /* --- Button Sizes (Used in size variants) --- */
//     /* Small Size */
//     --btn-height-sm: 2rem;
//     --btn-padding-x-sm: 0.75rem;
//     --btn-font-size-sm: 0.875rem;

//     /* Default/Medium Size */
//     --btn-height-md: 2.5rem;
//     --btn-padding-x-md: 1rem;
//     --btn-font-size-md: 0.875rem;

//     /* Large Size */
//     --btn-height-lg: 2.75rem;
//     --btn-padding-x-lg: 2rem;
//     --btn-font-size-lg: 1rem;

//     /* --- Colors (Used in variant colors) --- */
//     --background: 0 0% 100%;
//     --foreground: 222.2 84% 4.9%;

//     --primary: 222.2 47.4% 11.2%;
//     --primary-foreground: 210 40% 98%;

//     --secondary: 210 40% 96.1%;
//     --secondary-foreground: 222.2 47.4% 11.2%;

//     --destructive: 0 84.2% 60.2%;
//     --destructive-foreground: 210 40% 98%;

//     --accent: 210 40% 96.1%;
//     --accent-foreground: 222.2 47.4% 11.2%;

//     --ring: 222.2 84% 4.9%;
//     --input: 214.3 31.8% 91.4%;
//   }
// }
