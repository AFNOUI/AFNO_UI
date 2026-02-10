"use client";

import { usePathname } from "next/navigation";

import LanguageSelector from "@/components/lab/LanguageSelector";

import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";

export function LayoutHeader() {
    const pathname = usePathname();
    const isRootPage = pathname === "/components";
    const componentId = pathname.split("/").pop();

    const componentName = !isRootPage && componentId
        ? componentId
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        : null;

    return (
        <>
            <div className="flex justify-between">
                <PageBreadcrumb
                    items={isRootPage
                        ? [{ label: "Components" }]
                        : [
                            { label: "Components", href: "/components" },
                            { label: componentName || "" }
                        ]}
                />

                <LanguageSelector />
            </div>

            <div className="space-y-2">
                <h1 className="text-2xl font-bold">{componentName}</h1>

                <p className="text-muted-foreground">
                    Explore different variants and configurations of the {componentName} component.
                </p>
            </div>
        </>
    );
}
