import Link from "next/link";

import { ArrowRight, Box } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { COMPONENT_PAGES } from "@/lib/nav/componentPages";

export default function ComponentsPage() {
  return (
    <div className="min-h-screen">
      <div className="mb-4 flex items-center gap-2 font-medium text-primary">
        <Box size={20} />
        <span>Library Registry</span>
      </div>
      <p className="mb-8 max-w-2xl text-sm text-muted-foreground">
        {COMPONENT_PAGES.length} components, each with a dedicated page showing
        every variant and state, plus the command to install it.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {COMPONENT_PAGES.map((component) => (
          <Link key={component.id} href={component.path} className="group">
            <Card className="h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary group-hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex min-w-0 items-center gap-2 text-xl">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {component.icon}
                    </span>
                    <span className="truncate">{component.name}</span>
                  </CardTitle>

                  <ArrowRight
                    className="shrink-0 -translate-x-2 text-primary opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                    size={18}
                  />
                </div>

                <CardDescription className="line-clamp-2">
                  {component.desc}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
