import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:ps-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:start-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Alert = React.forwardRef<
  React.ComponentRef<"div">,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 dir="auto" ref={ref} className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
  ),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div dir="auto" ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
  ),
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };

/*
 * ============================================
 * TAILWIND CSS VARIABLES DOCUMENTATION
 * ============================================
 * This component uses Tailwind CSS variables defined in app/globals.css
 * 
 * Variables Used:
 * --------------
 * Colors:
 *   - hsl(var(--background))           Line: 11 - Alert variant="default" class "bg-background"
 *                             Default alert background color
 *
 *   - hsl(var(--foreground))           Line: 11 - Alert variant="default" class "text-foreground"
 *                             Default alert text color
 *
 *   - hsl(var(--border))               Line: 7 - Alert root class "border"
 *                             Alert container border outline
 *
 *   - hsl(var(--destructive))          Line: 12 - Alert variant="destructive" class "border-destructive/50"
 *                             Line: 12 - Alert variant="destructive" class "text-destructive"
 *                             Line: 12 - Alert variant="destructive" class "[&>svg]:text-destructive"
 *                             Destructive variant: semi-transparent border, text color, and SVG icon
 *
 *   - hsl(var(--destructive-foreground)) Line: 12 - Alert variant="destructive" implicit
 *                             Destructive variant contrast text color
 *
 *   - hsl(var(--muted-foreground))     Line: 7 - Alert root class "[&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground"
 *                             SVG icon color styling (text-foreground reference)
 *
 * Layout:
 *   - border-radius: var(--radius)     Line: 7 - Alert root class "rounded-lg"
 *                             reapplied for 10px corner radius via rounded-lg
 *
 * Usage Example:
 * --------------
 * <Alert variant="destructive">
 *   <AlertTitle>Error</AlertTitle>
 *   <AlertDescription>Something went wrong</AlertDescription>
 * </Alert>
 */
