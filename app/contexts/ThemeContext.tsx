import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";

import { ColorFormat } from "@/utils/colorUtils";
import { ThemePreset, themePresets } from "@/data/themePresets";
import { mergeRootColors } from "@/data/globalsThemeDefaults";
import type { CSSVariable } from "@/types/cssVariable";
import { mergeCssVariablesWithDefaults } from "@/utils/mergeCssVariables";

interface ThemeContextType {
  theme: "light" | "dark";
  variables: CSSVariable[];
  colorFormat: ColorFormat;
  resetVariables: () => void;
  darkVariables: CSSVariable[];
  lightVariables: CSSVariable[];
  currentPresetId: string | null;
  getVariableValue: (name: string) => string;
  applyPreset: (preset: ThemePreset) => void;
  setTheme: (theme: "light" | "dark") => void;
  setColorFormat: (format: ColorFormat) => void;
  updateVariable: (name: string, value: string) => void;
}

const createDefaultVariables = (colorValues: Record<string, string>): CSSVariable[] => [
  // Core colors
  { name: "--background", value: colorValues["--background"] || "0 0% 100%", category: "color", label: "Background" },
  { name: "--foreground", value: colorValues["--foreground"] || "220 20% 10%", category: "color", label: "Foreground" },
  { name: "--primary", value: colorValues["--primary"] || "160 84% 39%", category: "color", label: "Primary" },
  { name: "--primary-foreground", value: colorValues["--primary-foreground"] || "0 0% 100%", category: "color", label: "Primary Text" },
  { name: "--secondary", value: colorValues["--secondary"] || "220 14% 96%", category: "color", label: "Secondary" },
  { name: "--secondary-foreground", value: colorValues["--secondary-foreground"] || "220 20% 20%", category: "color", label: "Secondary Text" },
  { name: "--muted", value: colorValues["--muted"] || "220 14% 96%", category: "color", label: "Muted" },
  { name: "--muted-foreground", value: colorValues["--muted-foreground"] || "220 10% 46%", category: "color", label: "Muted Text" },
  { name: "--accent", value: colorValues["--accent"] || "160 60% 95%", category: "color", label: "Accent" },
  { name: "--accent-foreground", value: colorValues["--accent-foreground"] || "160 84% 25%", category: "color", label: "Accent Text" },
  { name: "--destructive", value: colorValues["--destructive"] || "0 72% 51%", category: "color", label: "Destructive" },
  { name: "--destructive-foreground", value: colorValues["--destructive-foreground"] || "0 0% 100%", category: "color", label: "Destructive Text" },
  { name: "--border", value: colorValues["--border"] || "220 13% 91%", category: "color", label: "Border" },
  { name: "--input", value: colorValues["--input"] || "220 13% 91%", category: "color", label: "Input Border" },
  { name: "--ring", value: colorValues["--ring"] || "160 84% 39%", category: "color", label: "Focus Ring" },
  { name: "--ring-offset", value: colorValues["--ring-offset"] || "0 0% 100%", category: "color", label: "Ring Offset" },
  { name: "--card", value: colorValues["--card"] || "0 0% 99%", category: "color", label: "Card" },
  { name: "--card-foreground", value: colorValues["--card-foreground"] || "220 20% 10%", category: "color", label: "Card Text" },
  { name: "--popover", value: colorValues["--popover"] || "0 0% 100%", category: "color", label: "Popover" },
  { name: "--popover-foreground", value: colorValues["--popover-foreground"] || "220 20% 10%", category: "color", label: "Popover Text" },
  // Lab + component color tokens from globals.css
  { name: "--surface-elevated", value: colorValues["--surface-elevated"] || "0 0% 100%", category: "color", label: "Surface Elevated" },
  { name: "--surface-sunken", value: colorValues["--surface-sunken"] || "220 20% 97%", category: "color", label: "Surface Sunken" },
  { name: "--editor-bg", value: colorValues["--editor-bg"] || "220 20% 98%", category: "color", label: "Editor Background" },
  { name: "--preview-bg", value: colorValues["--preview-bg"] || "220 14% 96%", category: "color", label: "Preview Background" },
  { name: "--glow-primary", value: colorValues["--glow-primary"] || "160 84% 39%", category: "color", label: "Glow Primary" },
  { name: "--tooltip-bg", value: colorValues["--tooltip-bg"] || "220 20% 10%", category: "color", label: "Tooltip Background" },
  { name: "--tooltip-foreground", value: colorValues["--tooltip-foreground"] || "0 0% 100%", category: "color", label: "Tooltip Foreground" },
  { name: "--progress-track", value: colorValues["--progress-track"] || "220 14% 90%", category: "color", label: "Progress Track" },
  { name: "--progress-indicator", value: colorValues["--progress-indicator"] || "160 84% 39%", category: "color", label: "Progress Indicator" },
  { name: "--progress-success", value: colorValues["--progress-success"] || "142 76% 36%", category: "color", label: "Progress Success" },
  { name: "--progress-warning", value: colorValues["--progress-warning"] || "38 92% 50%", category: "color", label: "Progress Warning" },
  { name: "--progress-error", value: colorValues["--progress-error"] || "0 72% 51%", category: "color", label: "Progress Error" },
  { name: "--sidebar-background", value: colorValues["--sidebar-background"] || "0 0% 99%", category: "color", label: "Sidebar Background" },
  { name: "--sidebar-foreground", value: colorValues["--sidebar-foreground"] || "220 10% 30%", category: "color", label: "Sidebar Foreground" },
  { name: "--sidebar-primary", value: colorValues["--sidebar-primary"] || "160 84% 39%", category: "color", label: "Sidebar Primary" },
  { name: "--sidebar-primary-foreground", value: colorValues["--sidebar-primary-foreground"] || "0 0% 100%", category: "color", label: "Sidebar Primary Foreground" },
  { name: "--sidebar-accent", value: colorValues["--sidebar-accent"] || "160 60% 95%", category: "color", label: "Sidebar Accent" },
  { name: "--sidebar-accent-foreground", value: colorValues["--sidebar-accent-foreground"] || "160 84% 25%", category: "color", label: "Sidebar Accent Foreground" },
  { name: "--sidebar-border", value: colorValues["--sidebar-border"] || "220 13% 91%", category: "color", label: "Sidebar Border" },
  { name: "--sidebar-ring", value: colorValues["--sidebar-ring"] || "160 84% 39%", category: "color", label: "Sidebar Ring" },
  // Radius
  { name: "--radius", value: "0.625", category: "radius", label: "Border Radius", unit: "rem" },
  // Typography
  { name: "--font-size-base", value: "16", category: "typography", label: "Base Font Size", unit: "px" },
  { name: "--font-size-sm", value: "14", category: "typography", label: "Small Font Size", unit: "px" },
  { name: "--font-size-lg", value: "18", category: "typography", label: "Large Font Size", unit: "px" },
  { name: "--line-height", value: "1.5", category: "typography", label: "Line Height" },
  { name: "--letter-spacing", value: "0", category: "typography", label: "Letter Spacing", unit: "em" },
  // Spacing
  { name: "--spacing-xs", value: "4", category: "spacing", label: "Extra Small", unit: "px" },
  { name: "--spacing-sm", value: "8", category: "spacing", label: "Small", unit: "px" },
  { name: "--spacing-md", value: "16", category: "spacing", label: "Medium", unit: "px" },
  { name: "--spacing-lg", value: "24", category: "spacing", label: "Large", unit: "px" },
  { name: "--spacing-xl", value: "32", category: "spacing", label: "Extra Large", unit: "px" },
  // Effects
  { name: "--shadow-sm", value: "0 1px 2px 0 rgb(0 0 0 / 0.05)", category: "effect", label: "Small Shadow" },
  { name: "--shadow-md", value: "0 4px 6px -1px rgb(0 0 0 / 0.1)", category: "effect", label: "Medium Shadow" },
  { name: "--shadow-lg", value: "0 10px 15px -3px rgb(0 0 0 / 0.1)", category: "effect", label: "Large Shadow" },
  // Component Sizing - Button
  { name: "--btn-height-sm", value: "2.25", category: "component", label: "Button SM Height", unit: "rem" },
  { name: "--btn-height-md", value: "2.5", category: "component", label: "Button MD Height", unit: "rem" },
  { name: "--btn-height-lg", value: "2.75", category: "component", label: "Button LG Height", unit: "rem" },
  { name: "--btn-padding-x-sm", value: "0.75", category: "component", label: "Button SM Padding X", unit: "rem" },
  { name: "--btn-padding-x-md", value: "1", category: "component", label: "Button MD Padding X", unit: "rem" },
  { name: "--btn-padding-x-lg", value: "2", category: "component", label: "Button LG Padding X", unit: "rem" },
  { name: "--btn-font-size-sm", value: "0.75", category: "component", label: "Button SM Font", unit: "rem" },
  { name: "--btn-font-size-md", value: "0.875", category: "component", label: "Button MD Font", unit: "rem" },
  { name: "--btn-font-size-lg", value: "1", category: "component", label: "Button LG Font", unit: "rem" },
  // Component Sizing - Input
  { name: "--input-height-sm", value: "2", category: "component", label: "Input SM Height", unit: "rem" },
  { name: "--input-height-md", value: "2.5", category: "component", label: "Input MD Height", unit: "rem" },
  { name: "--input-height-lg", value: "3", category: "component", label: "Input LG Height", unit: "rem" },
  { name: "--input-padding-x", value: "0.75", category: "component", label: "Input Padding X", unit: "rem" },
  // Component Sizing - Card
  { name: "--card-padding", value: "1.5", category: "component", label: "Card Padding", unit: "rem" },
  { name: "--card-gap", value: "1", category: "component", label: "Card Gap", unit: "rem" },
  // Component Sizing - Badge
  { name: "--badge-padding-x", value: "0.625", category: "component", label: "Badge Padding X", unit: "rem" },
  { name: "--badge-padding-y", value: "0.125", category: "component", label: "Badge Padding Y", unit: "rem" },
  { name: "--badge-font-size", value: "0.75", category: "component", label: "Badge Font Size", unit: "rem" },
  { name: "--progress-height", value: "0.5", category: "component", label: "Progress Height", unit: "rem" },
  { name: "--progress-radius", value: "9999", category: "component", label: "Progress Radius", unit: "px" },
  { name: "--tooltip-arrow-size", value: "0.5", category: "component", label: "Tooltip Arrow Size", unit: "rem" },
  { name: "--tooltip-padding-x", value: "0.75", category: "component", label: "Tooltip Padding X", unit: "rem" },
  { name: "--tooltip-padding-y", value: "0.375", category: "component", label: "Tooltip Padding Y", unit: "rem" },
  { name: "--tooltip-radius", value: "0.375", category: "component", label: "Tooltip Radius", unit: "rem" },
];

const defaultLightColors = mergeRootColors("light", themePresets[0].light);
const defaultDarkColors = mergeRootColors("dark", themePresets[0].dark);

const defaultLightVariables = createDefaultVariables(defaultLightColors);
const defaultDarkVariables = createDefaultVariables(defaultDarkColors);

/** Canonical variable lists aligned with `app/globals.css` — use for export merge / migrations. */
export { defaultLightVariables, defaultDarkVariables };

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function ThemeVariablesProvider({ children }: { children: React.ReactNode }) {
  const {
    resolvedTheme,
    // theme: nextTheme,
    setTheme: setNextTheme,
  } = useNextTheme();

  const currentTheme = (resolvedTheme === "dark" ? "dark" : "light") as "light" | "dark";

  const [lightVariables, setLightVariables] = useState<CSSVariable[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ui-lab-light-vars");
      if (saved) {
        try {
          return mergeCssVariablesWithDefaults(JSON.parse(saved) as CSSVariable[], defaultLightVariables);
        } catch {
          return defaultLightVariables;
        }
      }
    }
    return defaultLightVariables;
  });

  const [darkVariables, setDarkVariables] = useState<CSSVariable[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ui-lab-dark-vars");
      if (saved) {
        try {
          return mergeCssVariablesWithDefaults(JSON.parse(saved) as CSSVariable[], defaultDarkVariables);
        } catch {
          return defaultDarkVariables;
        }
      }
    }
    return defaultDarkVariables;
  });

  const [currentPresetId, setCurrentPresetId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ui-lab-preset-id") || "default";
    }
    return "default";
  });

  const [colorFormat, setColorFormatState] = useState<ColorFormat>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("ui-lab-color-format") as ColorFormat) || "hsl";
    }
    return "hsl";
  });

  const setColorFormat = useCallback((format: ColorFormat) => {
    setColorFormatState(format);
    localStorage.setItem("ui-lab-color-format", format);
  }, []);

  const variables = currentTheme === "light" ? lightVariables : darkVariables;

  const setTheme = useCallback((newTheme: "light" | "dark") => {
    setNextTheme(newTheme);
  }, [setNextTheme]);

  const updateVariable = useCallback((name: string, value: string) => {
    const updateFn = (vars: CSSVariable[]) =>
      vars.map((v) => (v.name === name ? { ...v, value } : v));

    if (currentTheme === "light") {
      setLightVariables(updateFn);
    } else {
      setDarkVariables(updateFn);
    }
    // Clear preset when manually editing
    setCurrentPresetId(null);
  }, [currentTheme]);

  const resetVariables = useCallback(() => {
    if (currentTheme === "light") {
      setLightVariables(defaultLightVariables);
      localStorage.removeItem("ui-lab-light-vars");
    } else {
      setDarkVariables(defaultDarkVariables);
      localStorage.removeItem("ui-lab-dark-vars");
    }
    setCurrentPresetId("default");
  }, [currentTheme]);

  const applyPreset = useCallback((preset: ThemePreset) => {
    const lightVars = createDefaultVariables(mergeRootColors("light", preset.light));
    const darkVars = createDefaultVariables(mergeRootColors("dark", preset.dark));

    setLightVariables(lightVars);
    setDarkVariables(darkVars);
    setCurrentPresetId(preset.id);

    localStorage.setItem("ui-lab-preset-id", preset.id);
  }, []);

  const getVariableValue = useCallback((name: string) => {
    const v = variables.find((v) => v.name === name);
    return v?.value || "";
  }, [variables]);

  // Apply CSS variables to root
  useEffect(() => {
    const root = document.documentElement;
    variables.forEach((v) => {
      if (v.category === "color") {
        root.style.setProperty(v.name, v.value);
      } else if (v.unit) {
        root.style.setProperty(v.name, `${v.value}${v.unit}`);
      } else {
        root.style.setProperty(v.name, v.value);
      }
    });
  }, [variables]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("ui-lab-light-vars", JSON.stringify(lightVariables));
  }, [lightVariables]);

  useEffect(() => {
    localStorage.setItem("ui-lab-dark-vars", JSON.stringify(darkVariables));
  }, [darkVariables]);

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        setTheme,
        variables,
        updateVariable,
        resetVariables,
        getVariableValue,
        applyPreset,
        currentPresetId,
        lightVariables,
        darkVariables,
        colorFormat,
        setColorFormat,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
    >
      <ThemeVariablesProvider>{children}</ThemeVariablesProvider>
    </NextThemesProvider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
