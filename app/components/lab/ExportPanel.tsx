"use client";

import { useState } from "react";
import { Copy, Check, FileDown, Code2 } from "lucide-react";

import {
  buildGlobalsRootSelectorBlock,
  buildTailwindV3ConfigSnippet,
  buildTailwindV4ThemeBlock,
} from "@/utils/themeExport";
import { useTheme, defaultLightVariables, defaultDarkVariables } from "@/contexts/ThemeContext";
import type { CSSVariable } from "@/types/cssVariable";
import { mergeCssVariablesWithDefaults } from "@/utils/mergeCssVariables";

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

/** Optional human-readable hints; unknown tokens fall back to {@link CSSVariable.label}. */
const COLOR_COMMENTS: Partial<Record<string, string>> = {
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
  "--surface-elevated": "Raised surfaces (panels, modals)",
  "--surface-sunken": "Inset / recessed surfaces",
  "--editor-bg": "Editor / code surface background",
  "--preview-bg": "Preview pane background",
  "--glow-primary": "Primary glow accent (animations, focus)",
  "--tooltip-bg": "Tooltip background",
  "--tooltip-foreground": "Tooltip text",
  "--progress-track": "Progress bar track",
  "--progress-indicator": "Progress bar fill",
  "--progress-success": "Progress success state",
  "--progress-warning": "Progress warning state",
  "--progress-error": "Progress error state",
  "--sidebar-background": "Sidebar background",
  "--sidebar-foreground": "Sidebar default text",
  "--sidebar-primary": "Sidebar primary accent",
  "--sidebar-primary-foreground": "Text on sidebar primary",
  "--sidebar-accent": "Sidebar hover / active surface",
  "--sidebar-accent-foreground": "Text on sidebar accent",
  "--sidebar-border": "Sidebar borders",
  "--sidebar-ring": "Sidebar focus ring",
};

function colorComment(v: CSSVariable): string | undefined {
  return COLOR_COMMENTS[v.name] ?? (v.label ? v.label : undefined);
}

export default function ExportPanel() {
  const [copied, setCopied] = useState(false);
  const { theme, lightVariables, darkVariables, colorFormat } = useTheme();

  const exportLight = mergeCssVariablesWithDefaults(lightVariables, defaultLightVariables);
  const exportDark = mergeCssVariablesWithDefaults(darkVariables, defaultDarkVariables);

  const generateThemeCSS = (vars: CSSVariable[], selector: string) => {
    const variant = selector === ".dark" ? "dark" : "light";
    return buildGlobalsRootSelectorBlock(vars, selector, colorFormat, {
      variant,
      describeColor: colorComment,
    });
  };

  const generateGlobalCSS = () => {
    const lightCSS = generateThemeCSS(exportLight, ":root");
    const darkCSS = generateThemeCSS(exportDark, ".dark");

    return `/* ============================================
   Global CSS Variables - Light & Dark Themes
   Color Format: ${colorFormat.toUpperCase()}
   Generated: ${new Date().toISOString()}
   ============================================ */

@layer base {
${lightCSS}

${darkCSS}

  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}`;
  };

  const generateGlobalTokensOnly = () => {
    const lightCSS = generateThemeCSS(exportLight, ":root");
    const darkCSS = generateThemeCSS(exportDark, ".dark");
    return `@layer base {
${lightCSS}

${darkCSS}
}`;
  };

  const generateGlobalsFooter = () => {
    return `@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

@layer utilities {
  /* Custom scrollbar */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: hsl(var(--muted-foreground) / 0.3);
    border-radius: 3px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--muted-foreground) / 0.5);
  }

  /* Glow effects */
  .glow-primary {
    box-shadow: 0 0 20px -5px hsl(var(--glow-primary) / 0.4);
  }

  /* Glass morphism */
  .glass {
    background: hsl(var(--background) / 0.8);
    backdrop-filter: blur(12px);
    border: 1px solid hsl(var(--border) / 0.5);
  }

  .dark .glass {
    background: hsl(var(--background) / 0.6);
  }

  /* Mono text utility */
  .font-mono-display {
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
    font-feature-settings: "liga" 0;
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.4s ease-out forwards;
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}`;
  };

  const generateCurrentCSS = () => {
    const variables = theme === "dark" ? exportDark : exportLight;
    const selector = theme === "dark" ? ".dark" : ":root";
    const variant = theme === "dark" ? "dark" : "light";
    const themeBlock = buildGlobalsRootSelectorBlock(variables, selector, colorFormat, {
      variant,
      describeColor: colorComment,
    });
    return `/* =============================================
   Generated CSS Variables - ${theme.toUpperCase()} Theme
   Color Format: ${colorFormat.toUpperCase()}
   ============================================= */

@layer base {
${themeBlock}

  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}`;
  };

  const tailwindV4Block = () => buildTailwindV4ThemeBlock(exportLight, colorFormat);
  const tailwindV3Block = () => buildTailwindV3ConfigSnippet(exportLight, colorFormat);

  const generateFullExport = () => {
    return `/* ============================================
   UI Lab Complete Theme Export
   Color Format: ${colorFormat.toUpperCase()}
   Generated: ${new Date().toISOString()}
   ============================================
   In a real project: keep @import "tailwindcss" FIRST (see app/globals.css).
   ============================================ */

@import "tailwindcss";

${generateGlobalTokensOnly()}

${tailwindV4Block()}

${generateGlobalsFooter()}
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
          <TabsList className="flex w-full flex-wrap gap-1 h-auto justify-start">
            <TabsTrigger value="global" className="text-xs sm:text-sm shrink-0">
              Global CSS
            </TabsTrigger>
            <TabsTrigger value="current" className="text-xs sm:text-sm shrink-0">
              Current
            </TabsTrigger>
            <TabsTrigger value="tailwind-v4" className="text-xs sm:text-sm shrink-0">
              TW v4 @theme
            </TabsTrigger>
            <TabsTrigger value="tailwind-v3" className="text-xs sm:text-sm shrink-0">
              TW v3 config
            </TabsTrigger>
            <TabsTrigger value="full" className="text-xs sm:text-sm shrink-0">
              Full
            </TabsTrigger>
          </TabsList>

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
              Light and dark <code className="bg-muted px-1 rounded">:root</code> /{" "}
              <code className="bg-muted px-1 rounded">.dark</code> — merge into{" "}
              <code className="bg-muted px-1 rounded">globals.css</code>. Order and section comments follow{" "}
              <code className="bg-muted px-1 rounded">app/data/globalsCssExportPlan.ts</code> (missing tokens are merged
              from defaults; unlisted variables append under “Additional tokens”).
            </p>
          </TabsContent>

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
              Active <span className="font-medium">{theme}</span> tokens only.
            </p>
          </TabsContent>

          <TabsContent value="tailwind-v4" className="mt-4">
            <div className="relative">
              <ScrollArea className="h-[300px] sm:h-[400px] rounded-lg border bg-muted/30">
                <pre className="p-4 text-xs sm:text-sm font-mono whitespace-pre-wrap wrap-break-word">{tailwindV4Block()}</pre>
              </ScrollArea>
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={() => copyToClipboard(tailwindV4Block())}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Tailwind v4 <code className="bg-muted px-1 rounded">@theme</code>. Colors: every{" "}
              <code className="bg-muted px-1 rounded">category: color</code> variable. Dimensions: inferred from names (
              <code className="bg-muted px-1 rounded">*-padding-*</code>, <code className="bg-muted px-1 rounded">*-height-*</code>,{" "}
              <code className="bg-muted px-1 rounded">*-font-size-*</code>, <code className="bg-muted px-1 rounded">*-radius</code>, etc.) — extend{" "}
              <code className="bg-muted px-1 rounded">inferTailwindV4DimensionLine</code> in{" "}
              <code className="bg-muted px-1 rounded">utils/themeExport.ts</code> for new patterns.
            </p>
          </TabsContent>

          <TabsContent value="tailwind-v3" className="mt-4">
            <div className="relative">
              <ScrollArea className="h-[300px] sm:h-[400px] rounded-lg border bg-muted/30">
                <pre className="p-4 text-xs sm:text-sm font-mono whitespace-pre-wrap wrap-break-word">{tailwindV3Block()}</pre>
              </ScrollArea>
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={() => downloadFile(tailwindV3Block(), "tailwind.config.export.ts")}
                >
                  <FileDown size={14} />
                  <span className="hidden sm:inline">Download</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={() => copyToClipboard(tailwindV3Block())}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              For Tailwind <strong>v3.x</strong> (no <code className="bg-muted px-1 rounded">@theme</code>): merge{" "}
              <code className="bg-muted px-1 rounded">theme.extend.colors</code> and adjust{" "}
              <code className="bg-muted px-1 rounded">content</code> paths. HSL uses the v3.4{" "}
              <code className="bg-muted px-1 rounded">/ &lt;alpha-value&gt;</code> form for opacity utilities.
            </p>
          </TabsContent>

          <TabsContent value="full" className="mt-4">
            <div className="relative">
              <ScrollArea className="h-[320px] sm:h-[480px] rounded-lg border bg-muted/30">
                <pre className="p-4 text-xs sm:text-sm font-mono whitespace-pre-wrap wrap-break-word">{generateFullExport()}</pre>
              </ScrollArea>
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={() => downloadFile(generateFullExport(), "theme-complete.css")}
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
              Valid CSS only (<code className="bg-muted px-1 rounded">@import</code>, <code className="bg-muted px-1 rounded">@layer base</code>,{" "}
              <code className="bg-muted px-1 rounded">@theme</code>). Use the <strong>TW v3 config</strong> tab for a separate{" "}
              <code className="bg-muted px-1 rounded">tailwind.config.ts</code> file.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
