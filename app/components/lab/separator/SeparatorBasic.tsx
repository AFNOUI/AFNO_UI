"use client";

import { Separator } from "@/components/ui/separator";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/separator/separator-basic";

export function SeparatorBasic() {
  return (
    <ComponentInstall
      category="separator"
      variant="separator-basic"
      title="Basic Separator"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n<Separator /> <Separator orientation="vertical" />`}
      fullCode={code}
    >
      <div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{data.title}</h4>
          <p className="text-sm text-muted-foreground">{data.description}</p>
        </div>
        <Separator className="my-4" />
        <div className="flex h-5 items-center space-x-4 text-sm">
          <div>{data.links[0]}</div>
          <Separator orientation="vertical" />
          <div>{data.links[1]}</div>
          <Separator orientation="vertical" />
          <div>{data.links[2]}</div>
        </div>
      </div>
    </ComponentInstall>
  );
}
