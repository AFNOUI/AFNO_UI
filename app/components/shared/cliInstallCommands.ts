export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export const PACKAGE_MANAGERS: PackageManager[] = ["npm", "pnpm", "yarn", "bun"];

/** How each package manager runs a package binary without installing it. */
const PACKAGE_RUNNERS: Record<PackageManager, string> = {
  npm: "npx",
  pnpm: "pnpm dlx",
  yarn: "yarn dlx",
  bun: "bunx",
};

/**
 * Any `afnoui <args>` command across package managers — the general form the
 * more specific helpers below are built on.
 */
export function getAfnouiCommand(pm: PackageManager, args: string): string {
  return `${PACKAGE_RUNNERS[pm]} afnoui ${args}`;
}

