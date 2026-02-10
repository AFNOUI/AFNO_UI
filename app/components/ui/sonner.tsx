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

// /* Add these to your global CSS file (e.g., globals.css) */
// @layer base {
//   :root {
//     /* --- Colors --- */
//     --background: ...;
//     --foreground: ...;
//     --muted: ...;
//     --muted-foreground: ...;
//     --primary: ...;
//     --primary-foreground: ...;
//     --border: ...;
//   }
// }
