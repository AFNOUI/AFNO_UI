import fs from "fs";
import path from "path";

type RegistrySource = {
    name: string;
    dependencies?: string[];
    devDependencies?: string[];
    registryDependencies?: string[];
    files: { src: string; target: string }[];
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
        name: "radio-group",
        registryDependencies: ["utils"],
        dependencies: ["@radix-ui/react-radio-group", "lucide-react"],
        files: [{ src: "app/components/ui/radio-group.tsx", target: "components/ui/radio-group.tsx" }],
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

function buildRegistry() {
    if (!fs.existsSync(REGISTRY_PATH)) fs.mkdirSync(REGISTRY_PATH, { recursive: true });
    const index: string[] = [];

    for (const component of components) {
        const registryItem = {
            name: component.name,
            dependencies: component.dependencies || [],
            registryDependencies: component.registryDependencies || [],
            files: component.files.map((file) => ({
                path: file.target,
                type: "registry:component",
                content: fs.readFileSync(path.join(process.cwd(), file.src), "utf8"),
            })),
        };

        fs.writeFileSync(path.join(REGISTRY_PATH, `${component.name}.json`), JSON.stringify(registryItem, null, 2));
        index.push(component.name);
    }

    fs.writeFileSync(path.join(REGISTRY_PATH, "index.json"), JSON.stringify(index, null, 2));
    console.log("🚀 Registry Built!");
}

buildRegistry();

console.log("🚀 Afnoui Registry Built Successfully!");
