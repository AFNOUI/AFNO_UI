"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          description: "group-[.toast]:text-muted-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };

/*
 * ============================================
 * TAILWIND CSS VARIABLES DOCUMENTATION
 * ============================================
 * This component uses Tailwind CSS variables defined in app/globals.css
 *
 * Variables Used (via toastOptions.classNames):
 * --------------
 * Colors:
 *   - hsl(var(--background))      Line: 21 - toast class "group-[.toaster]:bg-background"
 *                                 Toast background
 *   - hsl(var(--foreground))      Line: 21 - toast class "group-[.toaster]:text-foreground"
 *                                 Toast text color
 *   - hsl(var(--border))          Line: 21 - toast class "group-[.toaster]:border-border"
 *                                 Toast border color
 *   - hsl(var(--muted-foreground)) Line: 17 - description "group-[.toast]:text-muted-foreground"
 *   - hsl(var(--muted))           Line: 18 - cancelButton "group-[.toast]:bg-muted"
 *   - hsl(var(--primary))         Line: 19 - actionButton "group-[.toast]:bg-primary"
 *   - hsl(var(--primary-foreground)) Line: 19 - actionButton "group-[.toast]:text-primary-foreground"
 */
