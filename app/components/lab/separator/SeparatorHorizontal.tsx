"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/separator/separator-horizontal";

export function SeparatorHorizontal() {
  return (
    <ComponentInstall
      category="separator"
      variant="separator-horizontal"
      title="Horizontal Separator"
      code={`const sections = ${JSON.stringify(data, null, 2)};\n\n<Separator />`}
      fullCode={code}
    >
      <div className="max-w-md space-y-4">
        {data.map((section, i) => (
          <React.Fragment key={i}>
            <div>
              <h3 className="font-semibold">{section.title}</h3>
              <p className="text-sm text-muted-foreground">{section.desc}</p>
            </div>
            {i < data.length - 1 && <Separator />}
          </React.Fragment>
        ))}
      </div>
    </ComponentInstall>
  );
}
