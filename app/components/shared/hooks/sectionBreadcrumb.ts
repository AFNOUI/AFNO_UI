/**
 * Pure helper that maps a `pathname` to a breadcrumb trail for any lab section
 * whose subroutes match the sidebar items in `pages-layout.tsx`.
 *
 * Single helper for `/charts`, `/dnd`, etc. — the section just supplies its
 * root path, the index label, and the relevant sidebar items.
 */

export type SectionBreadcrumbItem = { label: string; href?: string };

export type SectionNavItem = {
  /** Sidebar route, e.g. `/charts/bar` or `/dnd/sortable-list`. */
  path: string;
  /** Human-readable label shown in the breadcrumb leaf. */
  name: string;
};

export function buildSectionBreadcrumbItems({
  pathname,
  rootPath,
  rootLabel,
  indexLabel,
  navItems,
}: {
  /** Raw `usePathname()` value — trailing slashes / query strings are tolerated. */
  pathname: string;
  /** Section root, e.g. `/charts` or `/dnd`. Must start with a leading slash. */
  rootPath: string;
  /** Label for the section root crumb when on a child route (e.g. "Charts"). */
  rootLabel: string;
  /** Label used as the single crumb on the section root (e.g. "Chart variants"). */
  indexLabel: string;
  /** Sidebar entries whose `path` matches `rootPath/<slug>`. */
  navItems: readonly SectionNavItem[];
}): SectionBreadcrumbItem[] {
  const path = (pathname.replace(/\/+$/, "") || rootPath).split("?")[0];

  if (path === rootPath) {
    return [{ label: indexLabel }];
  }

  const escapedRoot = rootPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`^${escapedRoot}/([^/]+)$`).exec(path);
  if (!match) {
    return [{ label: rootLabel, href: rootPath }, { label: rootLabel }];
  }

  const slug = match[1];
  const nav = navItems.find((item) => item.path === path);
  if (nav) {
    return [{ label: rootLabel, href: rootPath }, { label: nav.name }];
  }

  return [
    { label: rootLabel, href: rootPath },
    { label: humanizeSlug(slug) },
  ];
}

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
