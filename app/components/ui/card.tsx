import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-(--radius) border bg-card text-card-foreground shadow-(--shadow-sm)", className)} {...props} />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-(--card-gap) p-(--card-padding)", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 dir="auto" ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p dir="auto" ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-(--card-padding) pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-(--card-padding) pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

/*
 * ============================================
 * TAILWIND CSS VARIABLES DOCUMENTATION
 * ============================================
 * This component uses Tailwind CSS variables defined in app/globals.css
 * 
 * Variables Used:
 * --------------
 * Colors:
 *   - hsl(var(--card))                 Line: 6  - Card root class "bg-card"
 *                                      Card container background color
 *   - hsl(var(--card-foreground))      Line: 6  - Card root class "text-card-foreground"
 *                                      Card title and content text color
 *   - hsl(var(--muted-foreground))     Line: 26 - CardDescription class "text-muted-foreground"
 *                                      Description text with reduced opacity
 *   - hsl(var(--border))               Line: 6  - Card root class "border"
 *                                      Card container border outline
 *
 * Spacing (Custom CSS Variables via @theme):
 *   - --spacing-card-padding: 1.5rem  Line: 12 - CardHeader class "p-(--card-padding)"
 *                                      Default padding inside card header (24px)
 *                                      Line: 32 - CardContent class "p-(--card-padding)"
 *                                      Content padding
 *                                      Line: 38 - CardFooter class "p-(--card-padding)"
 *                                      Footer padding
 *   - --spacing-card-gap: 1rem        Line: 12 - CardHeader class "space-y-(--card-gap)"
 *                                      Spacing between title and description (16px)
 *
 * Layout:
 *   - border-radius: var(--radius)    Line: 6  - Card root class "rounded-(--radius)"
 *                                      Overall card rounding (10px radius)
 *   - box-shadow: var(--shadow-sm)    Line: 6  - Card root class "shadow-(--shadow-sm)"
 *                                      Subtle elevated shadow effect
 * 
 * Position Breakdown:
 *   - Card root: rounded-(--radius) - uses variable radius
 *               border - adds border outline
 *               bg-card - uses card background variable
 *               text-card-foreground - uses card foreground color
 *               shadow-(--shadow-sm) - applies elevated shadow
 *   - CardHeader: flex flex-col - vertical stacking
 *                 space-y-(--card-gap) - uses variable gap for children spacing
 *                 p-(--card-padding) - uses variable padding
 *                 text-center sm:text-left - center on mobile, left on desktop
 *   - CardTitle: text-2xl - large heading font size (24px)
 *                 font-semibold - 600 font weight
 *                 leading-none - tight line height
 *                 tracking-tight - reduced letter spacing
 *   - CardDescription: text-sm - small text size (14px)
 *                      text-muted-foreground - uses muted foreground color
 *   - CardContent: p-(--card-padding) - uses variable padding
 *                  pt-0 - removes top padding for seamless header transition
 *   - CardFooter: p-(--card-padding) - uses variable padding
 *                  pt-0 - removes top padding
 *                  flex items-center - horizontal alignment
 *                  flex-col-reverse sm:flex-row - stack on mobile, row on desktop
 *                  sm:justify-end - right-aligned on desktop
 *                  sm:space-x-2 - 8px horizontal spacing on desktop
 * 
 * Usage Examples:
 * --------------
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *     <CardDescription>Description</CardDescription>
 *   </CardHeader>
 *   <CardContent>Content</CardContent>
 *   <CardFooter>Footer actions</CardFooter>
 * </Card>
 */
