import fs from "fs";
import path from "path";

// Define all your components here
const components = [
    {
        name: "button",
        devDependencies: [],
        sourcePath: "app/components/ui/button.tsx",
        dependencies: ["@radix-ui/react-slot", "class-variance-authority", "lucide-react"],
    },
    // When you add tooltip:
    // { name: "tooltip", sourcePath: "app/components/ui/tooltip.tsx", dependencies: ["@radix-ui/react-tooltip"] }
];

const registryPath = path.join(process.cwd(), "public/registry");
if (!fs.existsSync(registryPath)) fs.mkdirSync(registryPath, { recursive: true });

components.forEach((component) => {
    const content = fs.readFileSync(path.join(process.cwd(), component.sourcePath), "utf8");

    const registryItem = {
        type: "registry:ui",
        name: component.name,
        dependencies: component.dependencies,
        devDependencies: component.devDependencies,
        files: [
            {
                content: content,
                type: "registry:component",
                path: `components/ui/${component.name}.tsx`,
            },
        ],
    };

    fs.writeFileSync(
        path.join(registryPath, `${component.name}.json`),
        JSON.stringify(registryItem, null, 2)
    );
});

console.log("🚀 Afnoui Registry Built Successfully!");
