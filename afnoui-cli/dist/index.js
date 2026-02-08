#!/usr/bin/env node
import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { execa } from "execa";
import fetch from "node-fetch";
import { Command } from "commander";
const program = new Command();
const REGISTRY_URL = "https://afnoui.aniketrouniyar.com.np/registry";
/**
 * Checks package.json for existing dependencies before attempting to install them.
 */
async function safeInstall(dependencies, isDev = false) {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    if (!fs.existsSync(packageJsonPath)) {
        console.error(chalk.red("❌ No package.json found. Run this in your project root."));
        return;
    }
    try {
        const packageJson = await fs.readJSON(packageJsonPath);
        const allDeps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies,
        };
        const missingDeps = dependencies.filter((dep) => !allDeps[dep]);
        if (missingDeps.length > 0) {
            const args = ["install", ...missingDeps];
            if (isDev)
                args.push("-D");
            console.log(chalk.gray(`📦 Installing ${isDev ? 'dev ' : ''}dependencies: ${missingDeps.join(", ")}...`));
            await execa("npm", args, { stdio: "inherit" });
        }
        else {
            console.log(chalk.blue("ℹ️  Required dependencies already present."));
        }
    }
    catch (error) {
        console.error(chalk.red("❌ Error checking dependencies:"), error);
    }
}
program.name("afnoui").description("AfnoUI CLI");
// --- 1. INIT COMMAND ---
program
    .command("init")
    .description("Initialize AfnoUI and install base dependencies")
    .action(async () => {
    console.log(chalk.blue("🛠️  Initializing AfnoUI..."));
    await safeInstall(["tailwind-merge", "clsx"]);
    const config = {
        style: "default",
        aliases: { utils: "@/lib/utils", components: "@/components" },
        tailwind: { config: "tailwind.config.js", css: "app/globals.css" },
    };
    const configPath = path.join(process.cwd(), "afnoui.json");
    if (!fs.existsSync(configPath)) {
        await fs.writeJSON(configPath, config, { spaces: 2 });
        console.log(chalk.green("✅ Created afnoui.json"));
    }
    const utilsPath = path.join(process.cwd(), "lib/utils.ts");
    if (!fs.existsSync(utilsPath)) {
        await fs.ensureDir(path.dirname(utilsPath));
        await fs.writeFile(utilsPath, `import { clsx, type ClassValue } from "clsx";\nimport { twMerge } from "tailwind-merge";\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs));\n}`);
        console.log(chalk.green("✅ Created lib/utils.ts"));
    }
});
// --- 2. LIST COMMAND ---
program
    .command("list")
    .description("List all available components in AfnoUI")
    .action(async () => {
    console.log(chalk.blue("🔍 Fetching available components..."));
    try {
        const response = await fetch(`${REGISTRY_URL}/index.json`);
        if (!response.ok)
            throw new Error("Failed to fetch component list");
        const components = (await response.json());
        console.log(chalk.white("\nAvailable components:"));
        components.forEach(c => console.log(chalk.cyan(` - ${c}`)));
        console.log(chalk.gray(`\nRun 'npx afnoui add <name>' to install one.`));
    }
    catch (error) {
        console.error(chalk.red("❌ Could not fetch component list. Ensure registry/index.json exists.", error));
    }
});
// --- 3. ADD COMMAND ---
program
    .command("add [components...]")
    .description("Add components to your project")
    .action(async (components) => {
    if (components.length === 0) {
        console.log(chalk.yellow("Please provide component names: npx afnoui add button tooltip"));
        return;
    }
    for (const name of components) {
        console.log(chalk.blue(`🚀 Adding ${name}...`));
        try {
            const response = await fetch(`${REGISTRY_URL}/${name}.json`);
            if (!response.ok) {
                console.log(chalk.red(`❌ Component "${name}" not found.`));
                continue;
            }
            const data = (await response.json());
            if (data.dependencies && data.dependencies.length > 0) {
                await safeInstall(data.dependencies);
            }
            if (data.devDependencies && data.devDependencies.length > 0) {
                await safeInstall(data.devDependencies, true);
            }
            for (const file of data.files) {
                const targetPath = path.join(process.cwd(), file.path);
                if (fs.existsSync(targetPath)) {
                    console.log(chalk.yellow(`⏭️  ${file.path} already exists. Skipping...`));
                    continue;
                }
                await fs.ensureDir(path.dirname(targetPath));
                await fs.writeFile(targetPath, file.content);
                console.log(chalk.green(`✅ Created: ${file.path}`));
            }
        }
        catch (error) {
            console.error(chalk.red(`❌ Error processing ${name}:`), error);
        }
    }
});
program.parse();
