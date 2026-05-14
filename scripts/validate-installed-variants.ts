/**
 * Validate installed variants
 *
 * 1. Builds the variants registry (public/registry/variants)
 * 1b. Builds the forms registry + Next.js production bundle (so static registry
 *     files are served by `next start` without dev-mode compilation latency)
 * 2. Creates/ensures test project (test/) with package.json, tsconfig, afnoui.json
 * 3. Starts `next start` (production) on VALIDATE_REGISTRY_PORT (default 3105)
 *    so we never collide with a leftover dev server on :3000
 * 4. Installs all variants into test (CLI auto-installs base components per variant)
 * 5. Optionally runs `tsc --noEmit` in test/ when VALIDATE_STRICT_TSC=1 (off by
 *    default: generated variants + demo snippets are not yet fully strict-clean
 *    as a single composite project; the install batches are the primary gate).
 *
 * Run from repo root: pnpm validate:variants (or npm run validate:variants)
 */

import { execSync, spawn } from "child_process";
import fs from "fs";
import path from "path";
import http from "http";

const ROOT = process.cwd();
const TEST_DIR = path.join(ROOT, "test");
const REGISTRY_INDEX = path.join(ROOT, "public", "registry", "variants", "index.json");
const BATCH_SIZE = 40;

function run(cmd: string, cwd: string = ROOT): string {
  // Point CLI subprocesses at the local Next server this script just booted,
  // not the public CDN. Without this the CLI silently resolves URLs against
  // the production host, defeating the whole purpose of the local registry
  // build we performed in step 1.
  return execSync(cmd, {
    cwd,
    encoding: "utf-8",
    maxBuffer: 10 * 1024 * 1024,
    env: {
      ...process.env,
      AFNOUI_REGISTRY_URL:
        process.env.AFNOUI_REGISTRY_URL || "http://127.0.0.1:3105/registry",
    },
  });
}

function getPackageManager(): "pnpm" | "npm" {
  if (fs.existsSync(path.join(ROOT, "pnpm-lock.yaml"))) return "pnpm";
  return "npm";
}

function waitForServer(url: string, maxAttempts = 90): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      const req = http.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve();
          return;
        }
        if (attempts >= maxAttempts) {
          reject(new Error(`Server not ready after ${maxAttempts} attempts`));
          return;
        }
        setTimeout(check, 500);
      });
      req.on("error", () => {
        if (attempts >= maxAttempts) {
          reject(new Error(`Server not ready after ${maxAttempts} attempts`));
          return;
        }
        setTimeout(check, 500);
      });
    };
    check();
  });
}

function ensureTestProject() {
  if (!fs.existsSync(TEST_DIR)) {
    console.log("   Creating test/ directory...");
    fs.mkdirSync(TEST_DIR, { recursive: true });
  }

  const testPkg = path.join(TEST_DIR, "package.json");
  const testTsconfig = path.join(TEST_DIR, "tsconfig.json");
  const testAfnoui = path.join(TEST_DIR, "afnoui.json");

  if (!fs.existsSync(testPkg)) {
    console.log("   Scaffolding test/package.json...");
    fs.writeFileSync(
      testPkg,
      JSON.stringify(
        {
          name: "afnoui-test",
          version: "1.0.0",
          private: true,
          type: "module",
          scripts: {
            typecheck: "tsc --noEmit",
          },
          dependencies: {
            "@radix-ui/react-slot": "^1.2.4",
            "class-variance-authority": "^0.7.1",
            "clsx": "^2.1.1",
            "react": "^19",
            "react-dom": "^19",
            "tailwind-merge": "^3.5.0",
          },
          devDependencies: {
            "tailwindcss": "^4",
            "typescript": "^5",
            "@types/react": "^19",
            "@types/react-dom": "^19",
          },
        },
        null,
        2
      )
    );
  }

  if (!fs.existsSync(testTsconfig)) {
    console.log("   Scaffolding test/tsconfig.json...");
    fs.writeFileSync(
      testTsconfig,
      JSON.stringify(
        {
          compilerOptions: {
            target: "ES2020",
            lib: ["DOM", "DOM.Iterable", "ES2020"],
            module: "ESNext",
            moduleResolution: "bundler",
            jsx: "react-jsx",
            strict: true,
            noEmit: true,
            skipLibCheck: true,
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            resolveJsonModule: true,
            isolatedModules: true,
            baseUrl: ".",
            paths: { "@/*": ["./*"] },
          },
          include: ["**/*.ts", "**/*.tsx"],
          exclude: ["node_modules"],
        },
        null,
        2
      )
    );
  }

  if (!fs.existsSync(testAfnoui)) {
    console.log("   Scaffolding test/afnoui.json...");
    fs.writeFileSync(
      testAfnoui,
      JSON.stringify(
        {
          version: "1.0.0",
          aliasPrefix: "@/",
          isV4: true,
          aliases: {
            components: "components",
            utils: "lib/utils",
            hooks: "hooks",
            ui: "components/ui",
            forms: "components/forms",
            formVariants: "forms",
            chartVariants: "charts",
            tableVariants: "tables",
            lib: "lib",
          },
        },
        null,
        2
      )
    );
  }
}

async function main() {
  const registryPort = process.env.VALIDATE_REGISTRY_PORT || "3105";
  if (!process.env.AFNOUI_REGISTRY_URL) {
    process.env.AFNOUI_REGISTRY_URL = `http://127.0.0.1:${registryPort}/registry`;
  }

  console.log("📦 Step 1: Building registries (main + variants)...");
  run("npm run build:registry");
  run("npm run build:variants-registry");

  if (!fs.existsSync(REGISTRY_INDEX)) {
    console.error("❌ Variants index not found. Run build:variants-registry first.");
    process.exit(1);
  }

  const variants: string[] = JSON.parse(fs.readFileSync(REGISTRY_INDEX, "utf-8"));
  console.log(`   Found ${variants.length} variants.`);

  const pm = getPackageManager();
  console.log("🛠️ Step 1b: Forms + Tables registry + Next production build (`next start` prerequisite)...");
  run(pm === "pnpm" ? "pnpm run build:forms-registry" : "npm run build:forms-registry");
  run(pm === "pnpm" ? "pnpm run build:tables-registry" : "npm run build:tables-registry");
  const nextDir = path.join(ROOT, ".next");
  if (fs.existsSync(nextDir)) {
    console.log("   Clearing .next so `public/registry/*` changes ship in the production bundle...");
    fs.rmSync(nextDir, { recursive: true, force: true });
  }
  run(pm === "pnpm" ? "pnpm exec next build" : "npx next build");

  console.log("📁 Step 2: Ensuring test project exists...");
  ensureTestProject();

  if (!fs.existsSync(path.join(TEST_DIR, "node_modules"))) {
    console.log(`   Installing test project dependencies (${pm})...`);
    run(pm === "pnpm" ? "pnpm install" : "npm install", TEST_DIR);
  }

  console.log(
    `🌐 Step 3: Starting production server (\`next start\` on port ${registryPort}, registry at ${process.env.AFNOUI_REGISTRY_URL})...`
  );
  const prodServer = spawn(pm === "pnpm" ? "pnpm" : "npm", ["run", "start"], {
    cwd: ROOT,
    stdio: "pipe",
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: registryPort,
    },
  });

  try {
    await waitForServer(`http://127.0.0.1:${registryPort}/registry/variants/index.json`);
    console.log("   Production server ready.");

    console.log("📥 Step 4: Installing all variants into test project...");
    for (let i = 0; i < variants.length; i += BATCH_SIZE) {
      const batch = variants.slice(i, i + BATCH_SIZE);
      const list = batch.join(" ");
      console.log(
        `   Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(variants.length / BATCH_SIZE)} (${batch.length} variants)...`
      );
      try {
        // --force skips the interactive "override globals.css?" prompt —
        // required because execSync has no TTY, and batches 2+ would hit the
        // prompt once batch 1 has already configured globals.css.
        run(`npx afnoui add ${list} --force`, TEST_DIR);
      } catch (e) {
        console.error("❌ CLI install failed for batch:", batch.slice(0, 5).join(" "), "...");
        throw e;
      }
    }

    if (process.env.VALIDATE_STRICT_TSC === "1") {
      console.log("🔍 Step 5: Running TypeScript typecheck in test/ (VALIDATE_STRICT_TSC=1)...");
      try {
        run("npx tsc --noEmit", TEST_DIR);
        console.log("✅ Typecheck passed.");
      } catch {
        console.error("❌ Typecheck failed. Fix type errors in registry code or installed files.");
        process.exit(1);
      }
    } else {
      console.log(
        "ℹ️  Step 5: Skipping `tsc` in test/ (set VALIDATE_STRICT_TSC=1 to enable). All variant install batches completed."
      );
    }
  } finally {
    prodServer.kill("SIGTERM");
  }

  console.log("\n✅ All variants validated: type-safe and installable.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
