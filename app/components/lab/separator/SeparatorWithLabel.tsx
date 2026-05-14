"use client";

import { Separator } from "@/components/ui/separator";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/separator/separator-with-label";

export function SeparatorWithLabel() {
  return (
    <ComponentInstall
      category="separator"
      variant="separator-with-label"
      title="With Label"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n// Centered label`}
      fullCode={code}
    >
      <div className="max-w-md">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">{data.label}</span>
          </div>
        </div>
      </div>
    </ComponentInstall>
  );
}
