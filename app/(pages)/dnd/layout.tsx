"use client";

import { usePathname } from "next/navigation";

import { DndProvider } from "@/components/ui/dnd";
import "@/components/ui/dnd/dnd.css";

import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { DndLabPrereqBanner } from "@/components/lab/dnd/DndLabPrereqBanner";
import { buildSectionBreadcrumbItems } from "@/components/shared/hooks/sectionBreadcrumb";
import { DND_SIDEBAR_ITEMS } from "@/(pages)/pages-layout";

/**
 * Shared chrome for every `/dnd/*` route:
 *   - Single `DndProvider` mounts the pointer-event listeners once for the
 *     whole section so dragging across sibling routes stays consistent.
 *   - Breadcrumb is derived from `DND_SIDEBAR_ITEMS` — sidebar and crumbs
 *     can never drift.
 *   - `DndLabPrereqBanner` mirrors the charts pattern (one `afnoui init`
 *     reminder per section).
 */
export default function DndLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const items = buildSectionBreadcrumbItems({
    pathname,
    rootPath: "/dnd",
    rootLabel: "DnD",
    indexLabel: "DnD variants",
    navItems: DND_SIDEBAR_ITEMS,
  });

  return (
    <DndProvider>
      <div className="p-4 md:p-6 lg:p-8">
        <PageBreadcrumb items={items} />
        <DndLabPrereqBanner />
        <div className="mt-6 min-w-0">{children}</div>
      </div>
    </DndProvider>
  );
}
