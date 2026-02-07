#!/usr/bin/env node
import path from "path";
import fs from "fs-extra";
import { execa } from "execa";
import fetch from "node-fetch";
import { Command } from "commander";
const program = new Command();
const REGISTRY_URL = "https://afnoui.aniketrouniyar.com.np/registry";
program.name("afnoui").description("AfnoUI CLI");
program
    .command("add <component>")
    .action(async (component) => {
    console.log(`🚀 Adding ${component} from AfnoUI...`);
    // 1. Get the JSON from your Next.js public/r/ folder
    const response = await fetch(`${REGISTRY_URL}/${component}.json`);
    if (!response.ok) {
        console.error("Component not found in registry.");
        return;
    }
    const data = (await response.json());
    // 2. Install dependencies (e.g., Radix) in the user's project
    if (data.dependencies?.length) {
        console.log(`📦 Installing dependencies: ${data.dependencies.join(", ")}`);
        await execa("npm", ["install", ...data.dependencies], { stdio: "inherit" });
    }
    // 3. Write the file into the user's project
    for (const file of data.files) {
        // User project path (usually src/components/ui or components/ui)
        const targetPath = path.join(process.cwd(), file.path);
        await fs.ensureDir(path.dirname(targetPath));
        await fs.writeFile(targetPath, file.content);
        console.log(`✅ Created: ${file.path}`);
    }
});
program.parse();
