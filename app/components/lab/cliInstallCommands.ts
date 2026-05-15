export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export const PACKAGE_MANAGERS: PackageManager[] = ["npm", "pnpm", "yarn", "bun"];

/** `afnoui add <category>/<variant>` across package managers (matches ComponentInstall). */
export function getAfnouiAddCommand(
  pm: PackageManager,
  category: string,
  variant: string,
  installArgs = "",
): string {
  const componentPath = `${category}/${variant}`;
  const tail = `${componentPath}${installArgs}`;
  switch (pm) {
    case "npm":
      return `npx afnoui add ${tail}`;
    case "pnpm":
      return `pnpm dlx afnoui add ${tail}`;
    case "yarn":
      return `yarn dlx afnoui add ${tail}`;
    case "bun":
      return `bunx afnoui add ${tail}`;
  }
}

/** Scaffold `afnoui.json` + base shadcn-style UI the chart snippets assume (`cn`, button, card, …). */
export function getAfnouiInitCommand(pm: PackageManager): string {
  switch (pm) {
    case "npm":
      return "npx afnoui init";
    case "pnpm":
      return "pnpm dlx afnoui init";
    case "yarn":
      return "yarn dlx afnoui init";
    case "bun":
      return "bunx afnoui init";
  }
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
  switch (pm) {
    case "npm":
      return "npx afnoui init --dnd";
    case "pnpm":
      return "pnpm dlx afnoui init --dnd";
    case "yarn":
      return "yarn dlx afnoui init --dnd";
    case "bun":
      return "bunx afnoui init --dnd";
  }
}
