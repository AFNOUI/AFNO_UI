import fs from "fs";
import path from "path";

/**
 * Build Registry Script
 * 
 * Generates component and theme registry files for Afnoui CLI.
 * 
 * For detailed documentation, see: docs/build-registry.md
 */

// Tailwind categories supported by the registry
export type TailwindCategory =
    | "colors"
    | "spacing"
    | "fontSize"
    | "animation"
    | "keyframes"
    | "borderRadius"
    | "width"
    | "height"
    | "gap"
    | "zIndex"
    | "boxShadow"
    | "fontFamily"
    | "lineHeight"
    | "letterSpacing"
    | "opacity"
    | "transitionDuration"
    | "transitionTimingFunction";

export type TailwindExtend = Partial<Record<TailwindCategory, Record<string, string | Record<string, unknown>>>>;

export type ThemeRegistry = {
    version: string;
    v4: { css: string };
    v3: {
        variables: string;
        config: {
            plugins: string[];
            darkMode: string[];
            theme: {
                extend: TailwindExtend
            };
        };
    };
};

export type RegistryItem = {
    name: string;
    files: Array<{
        path: string;
        type: string;
        content: string;
    }>;
    dependencies: string[];
    devDependencies: string[];
    registryDependencies: string[];
};

type RegistrySource = {
    name: string;
    dependencies?: string[];
    devDependencies?: string[];
    registryDependencies?: string[];
    files: Array<{ src: string; target: string; }>;
};

const components: RegistrySource[] = [
    // UTILS
    {
        name: "utils",
        dependencies: ["tailwind-merge", "clsx"],
        files: [{ src: "app/lib/utils.ts", target: "lib/utils.ts" }],
    },
    // HOOKS
    {
        name: "use-toast",
        registryDependencies: ["toast"],
        files: [{ src: "app/hooks/use-toast.ts", target: "hooks/use-toast.ts" }],
    },
    // {
    //     name: "use-theme",
    //     files: [{ src: "app/hooks/use-theme.ts", target: "hooks/use-theme.ts" }],
    // },
    // COMPONENTS
    {
        name: "accordion",
        registryDependencies: ["utils"],
        dependencies: ["@radix-ui/react-accordion", "lucide-react"],
        files: [{ src: "app/components/ui/accordion.tsx", target: "components/ui/accordion.tsx" }],
    },
    {
        name: "alert-dialog",
        registryDependencies: ["utils", "button"],
        dependencies: ["@radix-ui/react-alert-dialog"],
        files: [{ src: "app/components/ui/alert-dialog.tsx", target: "components/ui/alert-dialog.tsx" }],
    },
    {
        name: "alert",
        registryDependencies: ["utils"],
        dependencies: ["class-variance-authority"],
        files: [{ src: "app/components/ui/alert.tsx", target: "components/ui/alert.tsx" }],
    },
    {
        name: "avatar",
        registryDependencies: ["utils"],
        dependencies: ["@radix-ui/react-avatar"],
        files: [{ src: "app/components/ui/avatar.tsx", target: "components/ui/avatar.tsx" }],
    },
    {
        name: "badge",
        registryDependencies: ["utils"],
        dependencies: ["class-variance-authority"],
        files: [{ src: "app/components/ui/badge.tsx", target: "components/ui/badge.tsx" }],
    },
    {
        name: "breadcrumb",
        registryDependencies: ["utils"],
        dependencies: ["@radix-ui/react-slot", "lucide-react"],
        files: [{ src: "app/components/ui/breadcrumb.tsx", target: "components/ui/breadcrumb.tsx" }],
    },
    {
        name: "button",
        registryDependencies: ["utils"],
        dependencies: ["@radix-ui/react-slot", "class-variance-authority"],
        files: [{ src: "app/components/ui/button.tsx", target: "components/ui/button.tsx" }],
    },
    {
        name: "calendar",
        registryDependencies: ["utils", "button"],
        dependencies: ["react-day-picker", "lucide-react"],
        files: [{ src: "app/components/ui/calendar.tsx", target: "components/ui/calendar.tsx" }],
    },
    {
        name: "card",
        dependencies: [],
        registryDependencies: ["utils"],
        files: [{ src: "app/components/ui/card.tsx", target: "components/ui/card.tsx" }],
    },
    {
        name: "chart-primitives",
        registryDependencies: ["utils"],
        files: [{ src: "app/components/ui/chart-primitives.tsx", target: "components/ui/chart-primitives.tsx" }],
    },
    {
        name: "charts-bar",
        registryDependencies: ["utils", "chart-primitives"],
        files: [{ src: "app/components/ui/charts/bar.tsx", target: "components/charts/bar.tsx" }],
    },
    {
        name: "charts-line",
        registryDependencies: ["utils", "chart-primitives"],
        files: [{ src: "app/components/ui/charts/line.tsx", target: "components/charts/line.tsx" }],
    },
    {
        name: "charts-pie",
        registryDependencies: ["utils", "chart-primitives"],
        files: [{ src: "app/components/ui/charts/pie.tsx", target: "components/charts/pie.tsx" }],
    },
    {
        name: "charts-area",
        registryDependencies: ["utils", "chart-primitives"],
        files: [{ src: "app/components/ui/charts/area.tsx", target: "components/charts/area.tsx" }],
    },
    {
        name: "charts-radar",
        registryDependencies: ["utils", "chart-primitives"],
        files: [{ src: "app/components/ui/charts/radar.tsx", target: "components/charts/radar.tsx" }],
    },
    {
        name: "charts-scatter",
        registryDependencies: ["utils", "chart-primitives"],
        files: [{ src: "app/components/ui/charts/scatter.tsx", target: "components/charts/scatter.tsx" }],
    },
    {
        name: "charts-gauge",
        registryDependencies: ["utils", "chart-primitives"],
        files: [{ src: "app/components/ui/charts/gauge.tsx", target: "components/charts/gauge.tsx" }],
    },
    {
        name: "charts-funnel",
        registryDependencies: ["utils", "chart-primitives"],
        files: [{ src: "app/components/ui/charts/funnel.tsx", target: "components/charts/funnel.tsx" }],
    },
    {
        name: "charts-treemap",
        registryDependencies: ["utils", "chart-primitives"],
        files: [{ src: "app/components/ui/charts/treemap.tsx", target: "components/charts/treemap.tsx" }],
    },
    {
        name: "charts-candlestick",
        registryDependencies: ["utils", "chart-primitives"],
        files: [{ src: "app/components/ui/charts/candlestick.tsx", target: "components/charts/candlestick.tsx" }],
    },
    {
        name: "charts-waterfall",
        registryDependencies: ["utils", "chart-primitives"],
        files: [{ src: "app/components/ui/charts/waterfall.tsx", target: "components/charts/waterfall.tsx" }],
    },
    {
        name: "charts-heatmap",
        registryDependencies: ["utils", "chart-primitives"],
        files: [{ src: "app/components/ui/charts/heatmap.tsx", target: "components/charts/heatmap.tsx" }],
    },
    {
        name: "charts-polar-area",
        registryDependencies: ["utils", "chart-primitives"],
        files: [{ src: "app/components/ui/charts/polar-area.tsx", target: "components/charts/polar-area.tsx" }],
    },
    {
        name: "charts-radial-bar",
        registryDependencies: ["utils", "chart-primitives"],
        files: [{ src: "app/components/ui/charts/radial-bar.tsx", target: "components/charts/radial-bar.tsx" }],
    },
    {
        name: "charts-bump",
        registryDependencies: ["utils", "chart-primitives"],
        files: [{ src: "app/components/ui/charts/bump.tsx", target: "components/charts/bump.tsx" }],
    },
    {
        name: "charts-donut-progress",
        registryDependencies: ["utils", "chart-primitives"],
        files: [{ src: "app/components/ui/charts/donut-progress.tsx", target: "components/charts/donut-progress.tsx" }],
    },
    {
        name: "charts-sankey",
        registryDependencies: ["utils", "chart-primitives"],
        files: [{ src: "app/components/ui/charts/sankey.tsx", target: "components/charts/sankey.tsx" }],
    },
    {
        name: "carousel",
        registryDependencies: ["utils", "button"],
        dependencies: ["embla-carousel-react", "lucide-react"],
        files: [{ src: "app/components/ui/carousel.tsx", target: "components/ui/carousel.tsx" }],
    },
    {
        name: "checkbox",
        registryDependencies: ["utils"],
        dependencies: ["@radix-ui/react-checkbox", "lucide-react"],
        files: [{ src: "app/components/ui/checkbox.tsx", target: "components/ui/checkbox.tsx" }],
    },
    {
        name: "collapsible",
        registryDependencies: [],
        dependencies: ["@radix-ui/react-collapsible"],
        files: [{ src: "app/components/ui/collapsible.tsx", target: "components/ui/collapsible.tsx" }],
    },
    {
        name: "combobox",
        dependencies: ["lucide-react"],
        registryDependencies: ["utils", "command", "popover", "button"],
        files: [{ src: "app/components/ui/combobox.tsx", target: "components/ui/combobox.tsx" }],
    },
    {
        name: "command",
        dependencies: ["cmdk", "lucide-react"],
        registryDependencies: ["utils", "dialog"],
        files: [{ src: "app/components/ui/command.tsx", target: "components/ui/command.tsx" }],
    },
    {
        name: "dialog",
        registryDependencies: ["utils"],
        dependencies: ["@radix-ui/react-dialog", "lucide-react"],
        files: [{ src: "app/components/ui/dialog.tsx", target: "components/ui/dialog.tsx" }],
    },
    {
        name: "dropdown-menu",
        registryDependencies: ["utils"],
        dependencies: ["@radix-ui/react-dropdown-menu", "lucide-react"],
        files: [{ src: "app/components/ui/dropdown-menu.tsx", target: "components/ui/dropdown-menu.tsx" }],
    },
    {
        name: "form",
        registryDependencies: ["utils", "label"],
        dependencies: ["@radix-ui/react-label", "@radix-ui/react-slot", "react-hook-form"],
        files: [{ src: "app/components/ui/form.tsx", target: "components/ui/form.tsx" }],
    },
    {
        name: "input",
        dependencies: [],
        registryDependencies: ["utils"],
        files: [{ src: "app/components/ui/input.tsx", target: "components/ui/input.tsx" }],
    },
    {
        name: "label",
        registryDependencies: ["utils"],
        dependencies: ["@radix-ui/react-label", "class-variance-authority"],
        files: [{ src: "app/components/ui/label.tsx", target: "components/ui/label.tsx" }],
    },
    {
        name: "menubar",
        registryDependencies: ["utils"],
        dependencies: ["@radix-ui/react-menubar", "lucide-react"],
        files: [{ src: "app/components/ui/menubar.tsx", target: "components/ui/menubar.tsx" }],
    },
    {
        name: "navigation-menu",
        registryDependencies: ["utils"],
        dependencies: ["@radix-ui/react-navigation-menu", "lucide-react", "class-variance-authority"],
        files: [{ src: "app/components/ui/navigation-menu.tsx", target: "components/ui/navigation-menu.tsx" }],
    },
    {
        name: "popover",
        registryDependencies: ["utils"],
        dependencies: ["@radix-ui/react-popover"],
        files: [{ src: "app/components/ui/popover.tsx", target: "components/ui/popover.tsx" }],
    },
    {
        name: "progress",
        registryDependencies: ["utils"],
        dependencies: ["@radix-ui/react-progress"],
        files: [{ src: "app/components/ui/progress.tsx", target: "components/ui/progress.tsx" }],
    },
    {
        name: "progress-shared",
        registryDependencies: ["utils"],
        dependencies: ["lucide-react"],
        files: [{ src: "app/components/lab/progress/progress-shared.tsx", target: "components/ui/progress-shared.tsx" }],
    },
    {
        name: "radio-group",
        registryDependencies: ["utils"],
        dependencies: ["@radix-ui/react-radio-group", "lucide-react"],
        files: [{ src: "app/components/ui/radio-group.tsx", target: "components/ui/radio-group.tsx" }],
    },
    {
        name: "resizable",
        registryDependencies: ["utils"],
        dependencies: ["lucide-react", "react-resizable-panels"],
        files: [{ src: "app/components/ui/resizable.tsx", target: "components/ui/resizable.tsx" }],
    },
    {
        name: "scroll-area",
        registryDependencies: ["utils"],
        dependencies: ["@radix-ui/react-scroll-area"],
        files: [{ src: "app/components/ui/scroll-area.tsx", target: "components/ui/scroll-area.tsx" }],
    },
    {
        name: "select",
        registryDependencies: ["utils"],
        dependencies: ["@radix-ui/react-select", "lucide-react"],
        files: [{ src: "app/components/ui/select.tsx", target: "components/ui/select.tsx" }],
    },
    {
        name: "separator",
        registryDependencies: ["utils"],
        dependencies: ["@radix-ui/react-separator"],
        files: [{ src: "app/components/ui/separator.tsx", target: "components/ui/separator.tsx" }],
    },
    {
        name: "skeleton",
        registryDependencies: ["utils"],
        files: [{ src: "app/components/ui/skeleton.tsx", target: "components/ui/skeleton.tsx" }],
    },
    {
        name: "sheet",
        registryDependencies: ["utils"],
        files: [{ src: "app/components/ui/sheet.tsx", target: "components/ui/sheet.tsx" }],
        dependencies: ["@radix-ui/react-dialog", "lucide-react", "class-variance-authority"],
    },
    {
        name: "slider",
        registryDependencies: ["utils"],
        dependencies: ["@radix-ui/react-slider"],
        files: [{ src: "app/components/ui/slider.tsx", target: "components/ui/slider.tsx" }],
    },
    {
        name: "sonner",
        registryDependencies: ["utils"],
        dependencies: ["sonner", "next-themes"],
        files: [{ src: "app/components/ui/sonner.tsx", target: "components/ui/sonner.tsx" }],
    },
    {
        name: "switch",
        registryDependencies: ["utils"],
        dependencies: ["@radix-ui/react-switch"],
        files: [{ src: "app/components/ui/switch.tsx", target: "components/ui/switch.tsx" }],
    },
    {
        name: "tabs",
        registryDependencies: ["utils"],
        dependencies: ["@radix-ui/react-tabs"],
        files: [{ src: "app/components/ui/tabs.tsx", target: "components/ui/tabs.tsx" }],
    },
    {
        name: "table",
        registryDependencies: ["utils"],
        dependencies: [],
        files: [{ src: "app/components/ui/table.tsx", target: "components/ui/table.tsx" }],
    },
    {
        name: "textarea",
        registryDependencies: ["utils"],
        files: [{ src: "app/components/ui/textarea.tsx", target: "components/ui/textarea.tsx" }],
    },
    {
        name: "toast",
        registryDependencies: ["utils"],
        files: [{ src: "app/components/ui/toast.tsx", target: "components/ui/toast.tsx" }],
        dependencies: ["@radix-ui/react-toast", "lucide-react", "class-variance-authority"],
    },
    {
        name: "toaster",
        registryDependencies: ["toast", "use-toast"],
        files: [{ src: "app/components/ui/toaster.tsx", target: "components/ui/toaster.tsx" }],
    },
    {
        name: "toggle-group",
        registryDependencies: ["toggle", "utils"],
        dependencies: ["@radix-ui/react-toggle-group", "class-variance-authority"],
        files: [{ src: "app/components/ui/toggle-group.tsx", target: "components/ui/toggle-group.tsx" }],
    },
    {
        name: "toggle",
        registryDependencies: ["utils"],
        dependencies: ["@radix-ui/react-toggle", "class-variance-authority"],
        files: [{ src: "app/components/ui/toggle.tsx", target: "components/ui/toggle.tsx" }],
    },
    {
        name: "tooltip",
        registryDependencies: ["utils"],
        dependencies: ["@radix-ui/react-tooltip"],
        files: [{ src: "app/components/ui/tooltip.tsx", target: "components/ui/tooltip.tsx" }],
    },
];

const REGISTRY_PATH = path.join(process.cwd(), "public/registry");
const MASTER_CSS_PATH = path.join(process.cwd(), "app/globals.css");

// Variable pattern configuration - see docs/build-registry.md for details
type ValueTransformer = (matchGroups: RegExpMatchArray) => string;

interface VariablePattern {
    prefix: string;
    category: TailwindCategory;
    regex: RegExp;
    transformValue?: ValueTransformer;
    mergeIntoSpacing?: boolean;
}

const createVarTransformer = (): ValueTransformer => (match) => `var(--${match[2]})`;
const createHslTransformer = (): ValueTransformer => (match) => `hsl(var(--${match[2]}))`;

// Variable patterns - add new patterns here (see docs/build-registry.md)
const VARIABLE_PATTERNS: VariablePattern[] = [
    { prefix: "--color-", category: "colors", regex: /--color-([a-zA-Z0-9_-]+):\s*hsl\(var\(--([a-zA-Z0-9_-]+)\)\)/g, transformValue: createHslTransformer() },
    { prefix: "--font-size-", category: "fontSize", regex: /--font-size-([a-zA-Z0-9_-]+):\s*var\(--([a-zA-Z0-9_-]+)\)/g, transformValue: createVarTransformer() },
    { prefix: "--radius-", category: "borderRadius", regex: /--radius-([a-zA-Z0-9_-]+):\s*var\(--([a-zA-Z0-9_-]+)\)/g, transformValue: createVarTransformer() },
    { prefix: "--animation-", category: "animation", regex: /--animation-([a-zA-Z0-9_-]+):\s*([^;]+?);/g, transformValue: (match) => match[2] ? match[2].trim() : "" },
    { prefix: "--spacing-", category: "spacing", regex: /--spacing-([a-zA-Z0-9_-]+):\s*var\(--([a-zA-Z0-9_-]+)\)/g, transformValue: createVarTransformer() },
    { prefix: "--height-", category: "spacing", regex: /--height-([a-zA-Z0-9_-]+):\s*var\(--([a-zA-Z0-9_-]+)\)/g, transformValue: createVarTransformer(), mergeIntoSpacing: true },
    { prefix: "--width-", category: "spacing", regex: /--width-([a-zA-Z0-9_-]+):\s*var\(--([a-zA-Z0-9_-]+)\)/g, transformValue: createVarTransformer(), mergeIntoSpacing: true },
    { prefix: "--gap-", category: "spacing", regex: /--gap-([a-zA-Z0-9_-]+):\s*var\(--([a-zA-Z0-9_-]+)\)/g, transformValue: createVarTransformer(), mergeIntoSpacing: true },
    { prefix: "--z-", category: "zIndex", regex: /--z-([a-zA-Z0-9_-]+):\s*var\(--([a-zA-Z0-9_-]+)\)/g, transformValue: createVarTransformer() },
    { prefix: "--shadow-", category: "boxShadow", regex: /--shadow-([a-zA-Z0-9_-]+):\s*var\(--([a-zA-Z0-9_-]+)\)/g, transformValue: createVarTransformer() },
    { prefix: "--font-", category: "fontFamily", regex: /--font-(?!size-)([a-zA-Z0-9_-]+):\s*var\(--([a-zA-Z0-9_-]+)\)/g, transformValue: createVarTransformer() },
    { prefix: "--leading-", category: "lineHeight", regex: /--leading-([a-zA-Z0-9_-]+):\s*var\(--([a-zA-Z0-9_-]+)\)/g, transformValue: createVarTransformer() },
    { prefix: "--tracking-", category: "letterSpacing", regex: /--tracking-([a-zA-Z0-9_-]+):\s*var\(--([a-zA-Z0-9_-]+)\)/g, transformValue: createVarTransformer() },
    { prefix: "--opacity-", category: "opacity", regex: /--opacity-([a-zA-Z0-9_-]+):\s*var\(--([a-zA-Z0-9_-]+)\)/g, transformValue: createVarTransformer() },
];

// Extract @keyframes definitions from theme block
function extractKeyframes(themeBlock: string): Record<string, Record<string, unknown>> {
    const keyframes: Record<string, Record<string, unknown>> = {};

    // Match all @keyframes blocks with improved regex to handle nested braces
    const keyframesRegex = /@keyframes\s+([a-zA-Z0-9_-]+)\s*\{([\s\S]*?)\n\s*\}/gi;
    let match;

    while ((match = keyframesRegex.exec(themeBlock)) !== null) {
        const keyframeName = match[1];
        const keyframeContent = match[2].trim();

        // Skip if content is empty
        if (!keyframeContent) continue;

        // Parse keyframe content (from/to or percentage-based)
        const keyframeObj: Record<string, unknown> = {};

        // Match from/to blocks with improved regex
        const fromToRegex = /(from|to)\s*\{([^}]+)\}/gi;
        let fromToMatch;
        while ((fromToMatch = fromToRegex.exec(keyframeContent)) !== null) {
            const key = fromToMatch[1];
            const properties = fromToMatch[2].trim();
            if (properties) {
                keyframeObj[key] = parseCSSProperties(properties);
            }
        }

        // Match percentage-based blocks (e.g., 0%, 50%, 100%)
        const percentRegex = /(\d+%)\s*\{([^}]+)\}/gi;
        let percentMatch;
        while ((percentMatch = percentRegex.exec(keyframeContent)) !== null) {
            const key = percentMatch[1];
            const properties = percentMatch[2].trim();
            if (properties) {
                keyframeObj[key] = parseCSSProperties(properties);
            }
        }

        // Only add if we have valid keyframe data
        if (Object.keys(keyframeObj).length > 0) {
            keyframes[keyframeName] = keyframeObj;
        }
    }

    return keyframes;
}

// Parse CSS properties string into an object
function parseCSSProperties(propertiesStr: string): Record<string, string> {
    const properties: Record<string, string> = {};

    // Handle empty or whitespace-only strings
    if (!propertiesStr || !propertiesStr.trim()) {
        return properties;
    }

    // Split by semicolon and parse each property
    const propertyPairs = propertiesStr.split(';').filter(p => p.trim());
    for (const pair of propertyPairs) {
        // Find the first colon that's not inside a function (e.g., linear-gradient(90deg, red, blue))
        let colonIndex = -1;
        let inFunction = 0;

        for (let i = 0; i < pair.length; i++) {
            const char = pair[i];
            if (char === '(') inFunction++;
            else if (char === ')') inFunction--;
            else if (char === ':' && inFunction === 0) {
                colonIndex = i;
                break;
            }
        }

        if (colonIndex > 0) {
            const key = pair.substring(0, colonIndex).trim();
            const value = pair.substring(colonIndex + 1).trim();
            if (key && value) {
                properties[key] = value;
            }
        }
    }

    return properties;
}

/** Installed at `components/charts/*.tsx` (not `components/ui/charts/`); primitives live in `components/ui/chart-primitives.tsx`. */
function rewriteChartPrimitivesImportForRegistryTarget(content: string, targetPath: string): string {
    const norm = targetPath.replace(/\\/g, "/");
    if (!norm.includes("components/charts/") || norm.includes("/ui/charts/")) return content;
    return content.replace(/from\s+(["'])\.\.\/chart-primitives\1/g, "from $1../ui/chart-primitives$1");
}

function buildRegistry() {
    if (!fs.existsSync(REGISTRY_PATH)) fs.mkdirSync(REGISTRY_PATH, { recursive: true });
    const index: string[] = [];
    const errors: string[] = [];

    for (const component of components) {
        try {
            // Validate component files exist
            let missing = false;
            for (const file of component.files) {
                const filePath = path.join(process.cwd(), file.src);
                if (!fs.existsSync(filePath)) {
                    errors.push(`Component "${component.name}": File not found - ${file.src}`);
                    console.warn(`⚠️  Skipping ${component.name}: ${file.src} not found`);
                    missing = true;
                }
            }
            if (missing) continue;

            const registryItem = {
                name: component.name,
                dependencies: component.dependencies || [],
                devDependencies: component.devDependencies || [],
                registryDependencies: component.registryDependencies || [],
                files: component.files.map((file) => {
                    const filePath = path.join(process.cwd(), file.src);
                    const raw = fs.readFileSync(filePath, "utf8");
                    const content = rewriteChartPrimitivesImportForRegistryTarget(raw, file.target);
                    return {
                        content,
                        path: file.target,
                        type: "registry:component",
                    };
                }),
            };

            // Validate registry item before writing
            if (!validateRegistryItem(registryItem)) {
                errors.push(`Component "${component.name}": Validation failed`);
                continue;
            }

            fs.writeFileSync(path.join(REGISTRY_PATH, `${component.name}.json`), JSON.stringify(registryItem, null, 2));
            index.push(component.name);
        } catch (error) {
            const errorMsg = `Component "${component.name}": ${error instanceof Error ? error.message : String(error)}`;
            errors.push(errorMsg);
            console.error(`❌ Error building ${component.name}:`, error);
        }
    }

    fs.writeFileSync(path.join(REGISTRY_PATH, "index.json"), JSON.stringify(index, null, 2));

    if (errors.length > 0) {
        console.warn(`⚠️  Registry built with ${errors.length} error(s):`);
        errors.forEach(err => console.warn(`  - ${err}`));
    }

    console.log(`🚀 Registry Built! (${index.length} components)`);
}

// Parse theme variables using configured patterns
function parseThemeVariables(themeBlock: string): TailwindExtend {
    const v3Extend: TailwindExtend = {
        colors: {},
        spacing: {},
        fontSize: {},
        animation: {},
        keyframes: {},
        borderRadius: {},
    };

    // Process each pattern configuration
    for (const pattern of VARIABLE_PATTERNS) {
        const targetCategory = pattern.mergeIntoSpacing ? "spacing" : pattern.category;
        const target = v3Extend[targetCategory] || {};

        // Reset regex lastIndex to ensure fresh matching
        pattern.regex.lastIndex = 0;

        let match;
        while ((match = pattern.regex.exec(themeBlock)) !== null) {
            const key = match[1]; // Variable name without prefix

            // Transform value using custom transformer or default
            let value: string;
            if (pattern.transformValue) {
                value = pattern.transformValue(match);
            } else {
                // Default: use var() wrapper with second capture group
                const originalVar = match[2] || "";
                value = originalVar ? `var(--${originalVar})` : "";
            }

            // Only add if we have a valid value
            if (value && key) {
                target[key] = value;
            }
        }

        // Update the extend object
        if (!v3Extend[targetCategory]) {
            v3Extend[targetCategory] = target;
        } else {
            Object.assign(v3Extend[targetCategory]!, target);
        }
    }

    // Extract keyframes from theme block
    const keyframes = extractKeyframes(themeBlock);
    if (Object.keys(keyframes).length > 0) {
        v3Extend.keyframes = keyframes;
    }

    return v3Extend;
}

// Extract CSS variables from :root and .dark blocks
function extractCSSVariables(cssContent: string): string {
    const variableBlocks = cssContent.match(/(:root|\.dark)\s*{[\s\S]*?}/g) || [];
    return variableBlocks.join("\n\n");
}

// Validate generated registry item structure
function validateRegistryItem(item: RegistryItem): boolean {
    if (!item.name || typeof item.name !== 'string') {
        console.error(`❌ Invalid registry item: missing or invalid name`);
        return false;
    }

    if (!Array.isArray(item.files) || item.files.length === 0) {
        console.error(`❌ Invalid registry item "${item.name}": missing or empty files array`);
        return false;
    }

    for (const file of item.files) {
        if (!file.path || !file.type || !file.content) {
            console.error(`❌ Invalid file in "${item.name}": missing required fields`);
            return false;
        }
    }

    return true;
}

// Validate theme registry structure
function validateThemeRegistry(theme: ThemeRegistry): boolean {
    if (!theme.version || typeof theme.version !== 'string') {
        console.error(`❌ Invalid theme registry: missing or invalid version`);
        return false;
    }

    if (!theme.v4 || !theme.v4.css) {
        console.error(`❌ Invalid theme registry: missing v4.css`);
        return false;
    }

    if (!theme.v3 || !theme.v3.variables || !theme.v3.config) {
        console.error(`❌ Invalid theme registry: missing v3 structure`);
        return false;
    }

    if (!theme.v3.config.theme || !theme.v3.config.theme.extend) {
        console.error(`❌ Invalid theme registry: missing v3.theme.extend`);
        return false;
    }

    return true;
}

// Build theme registry from CSS file (see docs/build-registry.md for details)
function buildThemeRegistry() {
    try {
        if (!fs.existsSync(REGISTRY_PATH)) {
            fs.mkdirSync(REGISTRY_PATH, { recursive: true });
        }

        // Check if CSS file exists
        if (!fs.existsSync(MASTER_CSS_PATH)) {
            console.error(`❌ CSS file not found: ${MASTER_CSS_PATH}`);
            return;
        }

        const cssContent = fs.readFileSync(MASTER_CSS_PATH, "utf8");

        // Extract @theme block, handling nested braces (e.g., @keyframes)
        // Match from @theme { to the matching closing brace
        const themeStart = cssContent.indexOf("@theme");
        if (themeStart === -1) {
            console.warn("⚠️  No @theme block found in CSS file");
            return;
        }

        let braceCount = 0;
        let inTheme = false;
        let themeEnd = themeStart;

        for (let i = themeStart; i < cssContent.length; i++) {
            if (cssContent[i] === '{') {
                braceCount++;
                inTheme = true;
            } else if (cssContent[i] === '}') {
                braceCount--;
                if (inTheme && braceCount === 0) {
                    themeEnd = i;
                    break;
                }
            }
        }

        const themeBlock = cssContent.substring(
            cssContent.indexOf('{', themeStart) + 1,
            themeEnd
        );

        if (!themeBlock || !themeBlock.trim()) {
            console.warn("⚠️  Empty @theme block found in CSS file");
            return;
        }

        // Parse all variables using the generic parser
        const v3Extend = parseThemeVariables(themeBlock);

        // Extract CSS variables for v3 compatibility
        const variables = extractCSSVariables(cssContent);

        const themeRegistry: ThemeRegistry = {
            version: "1.0.0",
            v4: { css: cssContent },
            v3: {
                variables,
                config: {
                    darkMode: ["class"],
                    theme: { extend: v3Extend },
                    plugins: ['require("tailwindcss-animate")']
                }
            }
        };

        // Validate theme registry before writing
        if (!validateThemeRegistry(themeRegistry)) {
            console.error("❌ Theme registry validation failed");
            return;
        }

        fs.writeFileSync(
            path.join(REGISTRY_PATH, "theme.json"),
            JSON.stringify(themeRegistry, null, 2));

        // Log statistics
        const stats = Object.entries(v3Extend).map(([cat, vars]) =>
            `${cat}: ${Object.keys(vars || {}).length}`
        ).join(", ");
        console.log(`🎨 Theme Registry Built! (${stats})`);
    } catch (error) {
        console.error("❌ Theme build failed:", error instanceof Error ? error.message : String(error));
        throw error;
    }
}

buildRegistry();
buildThemeRegistry();

console.log("🚀 Afnoui Registry Built Successfully!");
