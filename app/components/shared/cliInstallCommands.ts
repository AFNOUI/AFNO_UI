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

/** `afnoui add <category>/<variant>` across package managers (matches ComponentInstall). */
export function getAfnouiAddCommand(
  pm: PackageManager,
  category: string,
  variant: string,
  installArgs = "",
): string {
  const componentPath = `${category}/${variant}`;
  return getAfnouiCommand(pm, `add ${componentPath}${installArgs}`);
}

/** Scaffold `afnoui.json` + base AfnoUI primitives the chart snippets assume (`cn`, button, card, …). */
export function getAfnouiInitCommand(pm: PackageManager): string {
  return getAfnouiCommand(pm, "init");
}

/**
 * `afnoui init --dnd` — full project init AND the Pointer DnD primitives
 * (`components/dnd/*`) so DnD lab snippets compile after a single command.
 *
 * Use this on the DnD lab pages so a user who copies code from the Component
 * tab has everything required (DnD lib, `cn`, lucide-react, clsx,
 * tailwind-merge) without having to run `afnoui add dnd/<variant>` first.
 */
export function getAfnouiDndInitCommand(pm: PackageManager): string {
  return getAfnouiCommand(pm, "init --dnd");
}
