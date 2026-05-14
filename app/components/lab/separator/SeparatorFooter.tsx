"use client";

import React from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/separator/separator-footer";

export function SeparatorFooter() {
  return (
    <ComponentInstall
      category="separator"
      variant="separator-footer"
      title="Footer Links"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n// Footer with vertical separators`}
      fullCode={code}
    >
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
        {data.links.map((link, i) => (
          <React.Fragment key={link}>
            {i > 0 && <Separator orientation="vertical" className="h-4" />}
            <Link href="#" className="hover:text-foreground transition-colors">
              {link}
            </Link>
          </React.Fragment>
        ))}
      </div>
    </ComponentInstall>
  );
}
