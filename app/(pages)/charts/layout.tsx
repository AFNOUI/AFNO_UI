"use client";

import { usePathname } from "next/navigation";

import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { ChartsLabPrereqBanner } from "@/components/lab/charts/ChartsLabPrereqBanner";
import { buildSectionBreadcrumbItems } from "@/components/shared/hooks/sectionBreadcrumb";
import { CHARTS_SIDEBAR_ITEMS } from "@/(pages)/pages-layout";

export default function ChartsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const items = buildSectionBreadcrumbItems({
    pathname,
    rootPath: "/charts",
    rootLabel: "Charts",
    indexLabel: "Chart variants",
    navItems: CHARTS_SIDEBAR_ITEMS,
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageBreadcrumb items={items} />
      <ChartsLabPrereqBanner />
      <div className="mt-6 min-w-0">{children}</div>
    </div>
  );
}
