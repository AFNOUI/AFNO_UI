"use client";

import { useState } from "react";
import { Copy, Check, FileDown, Code2 } from "lucide-react";

import { formatColor } from "@/utils/colorUtils";
import { useTheme } from "@/contexts/ThemeContext";

import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ExportPanel() {
  const [copied, setCopied] = useState(false);
  const { theme, lightVariables, darkVariables, colorFormat } = useTheme();

  const colorComments: Record<string, string> = {
    "--background": "Main page background color",
    "--foreground": "Default text color used across the app",
    "--primary": "Brand color for buttons, links, and key interactive elements",
    "--primary-foreground": "Text color on primary-colored backgrounds",
    "--secondary": "Subtle background for secondary buttons and less prominent UI",
    "--secondary-foreground": "Text color on secondary-colored backgrounds",
    "--muted": "Background for muted/subtle sections (e.g., disabled states, sidebars)",
    "--muted-foreground": "Subdued text for hints, placeholders, and secondary info",
    "--accent": "Highlight color for hover states and active indicators",
    "--accent-foreground": "Text color on accent-colored backgrounds",
    "--destructive": "Error and danger states (delete buttons, error messages)",
    "--destructive-foreground": "Text on destructive-colored backgrounds",
    "--border": "Default border color for cards, inputs, and dividers",
    "--input": "Border color specifically for form inputs",
    "--ring": "Focus ring color for accessibility (keyboard navigation)",
    "--ring-offset": "Background behind focus ring for better visibility",
    "--card": "Background color for card components",
    "--card-foreground": "Text color inside cards",
    "--popover": "Background for dropdowns, tooltips, and floating panels",
    "--popover-foreground": "Text color inside popovers",
  };

  const generateThemeCSS = (vars: typeof lightVariables, selector: string) => {
    const colorVars = vars.filter((v) => v.category === "color");
    const otherVars = vars.filter((v) => v.category !== "color");

    const colorString = colorVars
      .map((v) => {
        const formattedValue = formatColor(v.value, colorFormat);
        const comment = colorComments[v.name] ? ` /* ${colorComments[v.name]} */` : "";
        return `    ${v.name}: ${formattedValue};${comment}`;
      })
      .join("\n");

    const otherString = otherVars
      .map((v) => `    ${v.name}: ${v.value}${v.unit || ""};`)
      .join("\n");

    return `  ${selector} {
    /* =============================================
       COLOR TOKENS (${colorFormat.toUpperCase()})
       
       These semantic colors create a consistent design system.
       
       USAGE GUIDE:
       - background/foreground: Base page colors
       - primary: Main brand/action color
       - secondary: Less prominent actions
       - muted: Disabled or subdued elements
       - accent: Hover states, highlights
       - destructive: Errors, delete actions
       - border/input: Borders and form elements
       - ring/ring-offset: Focus states for accessibility
       - card/popover: Elevated surface colors
       ============================================= */
${colorString}

    /* =============================================
       SIZING & EFFECTS
       
       These tokens control component dimensions,
       spacing, border radius, and shadows.
       ============================================= */
${otherString}
  }`;
  };

  const generateGlobalCSS = () => {
    const lightCSS = generateThemeCSS(lightVariables, ":root");
    const darkCSS = generateThemeCSS(darkVariables, ".dark");

    return `/* ============================================
   Global CSS Variables - Light & Dark Themes
   Color Format: ${colorFormat.toUpperCase()}
   Generated: ${new Date().toISOString()}
   ============================================ */

@layer base {
${lightCSS}

${darkCSS}
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`;
  };

  const generateCurrentCSS = () => {
    const variables = theme === "dark" ? darkVariables : lightVariables;
    const colorVars = variables.filter((v) => v.category === "color");
    const otherVars = variables.filter((v) => v.category !== "color");

    const colorString = colorVars
      .map((v) => {
        const formattedValue = formatColor(v.value, colorFormat);
        const comment = colorComments[v.name] ? ` /* ${colorComments[v.name]} */` : "";
        return `    ${v.name}: ${formattedValue};${comment}`;
      })
      .join("\n");

    const otherString = otherVars
      .map((v) => `    ${v.name}: ${v.value}${v.unit || ""};`)
      .join("\n");

    const selector = theme === "dark" ? ".dark" : ":root";
    return `/* =============================================
   Generated CSS Variables - ${theme.toUpperCase()} Theme
   Color Format: ${colorFormat.toUpperCase()}
   
   SEMANTIC COLOR TOKENS EXPLAINED:
   
   --background / --foreground
   Base colors for page background and default text.
   
   --primary / --primary-foreground  
   Your brand color for CTAs, links, and key actions.
   
   --secondary / --secondary-foreground
   For less prominent UI elements and secondary actions.
   
   --muted / --muted-foreground
   Subdued backgrounds and placeholder/hint text.
   Use for disabled states or sidebar backgrounds.
   
   --accent / --accent-foreground
   Highlights, hover states, and active indicators.
   
   --destructive / --destructive-foreground
   Error states, delete buttons, and warning actions.
   
   --border / --input
   Border colors for cards, dividers, and form inputs.
   
   --ring / --ring-offset
   Focus ring for keyboard navigation accessibility.
   Ring-offset provides background contrast for the ring.
   
   --card / --popover
   Elevated surface backgrounds for cards and dropdowns.
   ============================================= */

@layer base {
  ${selector} {
${colorString}

    /* Sizing & Effects */
${otherString}
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`;
  };

  const generateTailwind = () => {
    const colorVars = lightVariables.filter((v) => v.category === "color");
    const colorConfig: Record<string, string> = {};

    // Generate tailwind config based on selected format
    colorVars.forEach((v) => {
      const name = v.name.replace("--", "");
      if (colorFormat === "hsl") {
        colorConfig[name] = `hsl(var(${v.name}))`;
      } else if (colorFormat === "oklch") {
        colorConfig[name] = `oklch(var(${v.name}))`;
      } else if (colorFormat === "rgb") {
        colorConfig[name] = `rgb(var(${v.name}))`;
      } else {
        // For hex, we still use CSS variables with hsl fallback
        colorConfig[name] = `var(${v.name})`;
      }
    });

    return `// Add this to your tailwind.config.ts
// In the theme.extend section
// Color Format: ${colorFormat.toUpperCase()}

export default {
  theme: {
    extend: {
      colors: ${JSON.stringify(colorConfig, null, 8).replace(/"/g, "'")},
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
}`;
  };

  const generateFullExport = () => {
    return `/* ============================================
   UI Lab Complete Theme Export
   Color Format: ${colorFormat.toUpperCase()}
   Generated: ${new Date().toISOString()}
   ============================================ */

${generateGlobalCSS()}

/* ============================================
   Tailwind Config
   ============================================ */

${generateTailwind()}
`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Code2 size={14} />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] min-w-[320px] max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Export Theme</DialogTitle>
          <DialogDescription>
            Download or copy the generated code to use in your project.
            Colors are exported in <span className="font-semibold text-primary">{colorFormat.toUpperCase()}</span> format.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="global" className="mt-4 flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
            <TabsTrigger value="global" className="text-xs sm:text-sm">Global CSS</TabsTrigger>
            <TabsTrigger value="current" className="text-xs sm:text-sm">Current Theme</TabsTrigger>
            <TabsTrigger value="tailwind" className="text-xs sm:text-sm">Tailwind</TabsTrigger>
            <TabsTrigger value="full" className="text-xs sm:text-sm">Full Export</TabsTrigger>
          </TabsList>

          {/* Global CSS - Both Themes */}
          <TabsContent value="global" className="mt-4 flex-1">
            <div className="relative">
              <ScrollArea className="h-[300px] sm:h-[400px] rounded-lg border bg-muted/30">
                <pre className="p-4 text-xs sm:text-sm font-mono whitespace-pre-wrap wrap-break-word">{generateGlobalCSS()}</pre>
              </ScrollArea>
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={() => downloadFile(generateGlobalCSS(), "theme-global.css")}
                >
                  <FileDown size={14} />
                  <span className="hidden sm:inline">Download</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={() => copyToClipboard(generateGlobalCSS())}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Contains both light and dark theme variables in {colorFormat.toUpperCase()} format. Place in your index.css or globals.css.
            </p>
          </TabsContent>

          {/* Current Theme Only */}
          <TabsContent value="current" className="mt-4">
            <div className="relative">
              <ScrollArea className="h-[300px] sm:h-[400px] rounded-lg border bg-muted/30">
                <pre className="p-4 text-xs sm:text-sm font-mono whitespace-pre-wrap wrap-break-word">{generateCurrentCSS()}</pre>
              </ScrollArea>
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={() => copyToClipboard(generateCurrentCSS())}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Currently viewing: <span className="font-medium">{theme}</span> theme variables in {colorFormat.toUpperCase()} format.
            </p>
          </TabsContent>

          {/* Tailwind Config */}
          <TabsContent value="tailwind" className="mt-4">
            <div className="relative">
              <ScrollArea className="h-[300px] sm:h-[400px] rounded-lg border bg-muted/30">
                <pre className="p-4 text-xs sm:text-sm font-mono whitespace-pre-wrap wrap-break-word">{generateTailwind()}</pre>
              </ScrollArea>
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={() => copyToClipboard(generateTailwind())}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Add these colors to your tailwind.config.ts in the theme.extend section.
            </p>
          </TabsContent>

          {/* Full Export */}
          <TabsContent value="full" className="mt-4">
            <div className="relative">
              <ScrollArea className="h-[300px] sm:h-[400px] rounded-lg border bg-muted/30">
                <pre className="p-4 text-xs sm:text-sm font-mono whitespace-pre-wrap wrap-break-word">{generateFullExport()}</pre>
              </ScrollArea>
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={() => downloadFile(generateFullExport(), `theme-complete.css`)}
                >
                  <FileDown size={14} />
                  <span className="hidden sm:inline">Download</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={() => copyToClipboard(generateFullExport())}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span className="hidden sm:inline">Copy</span>
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Complete export with global CSS (light + dark) and Tailwind configuration in {colorFormat.toUpperCase()} format.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
