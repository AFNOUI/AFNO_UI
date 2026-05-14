"use client";

import { Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

import LanguageSelector from "@/components/lab/LanguageSelector";

import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";

export function LayoutHeader({ children }: { children: React.ReactNode }) {
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
                <div className="flex items-center gap-2">
                    <Sparkles size={22} className="text-primary" />
                    <h1 className="text-2xl font-bold">{componentName}</h1>
                </div>

                <p className="text-muted-foreground">
                    Explore different variants and configurations of the {componentName} component.
                </p>
            </div>

            {children}
        </>
    );
}
