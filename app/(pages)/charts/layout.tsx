"use client";

import { usePathname } from "next/navigation";

import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { ChartsLabPrereqBanner } from "@/components/lab/charts/ChartsLabPrereqBanner";
import { CHARTS_SIDEBAR_ITEMS } from "@/(pages)/pages-layout";

type BreadcrumbItem = { label: string; href?: string };

function getChartSectionBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const path = (pathname.replace(/\/+$/, "") || "/charts").split("?")[0];

  if (path === "/charts") {
    return [{ label: "Chart variants" }];
  }

  const match = /^\/charts\/([^/]+)$/.exec(path);
  if (!match) {
    return [{ label: "Charts", href: "/charts" }, { label: "Charts" }];
  }

  const nav = CHARTS_SIDEBAR_ITEMS.find((item) => item.path === path);
  if (nav) {
    return [{ label: "Charts", href: "/charts" }, { label: nav.name }];
  }

  return [
    { label: "Charts", href: "/charts" },
    { label: humanizeChartSlug(match[1]) },
  ];
}

function humanizeChartSlug(slug: string): string {
  return (
    slug
      .split("-")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") + " chart"
  );
}

export default function ChartsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const items = getChartSectionBreadcrumbItems(pathname);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageBreadcrumb items={items} />
      <ChartsLabPrereqBanner />
      <div className="mt-6 min-w-0">{children}</div>
    </div>
  );
}
