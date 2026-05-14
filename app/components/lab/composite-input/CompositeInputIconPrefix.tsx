"use client";

import { Search, Mail, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/composite-input/composite-input-icon-prefix";

export function CompositeInputIconPrefix() {
    const snippet = `const data = ${JSON.stringify(data, null, 2)};

const icons = { Search, Mail, Globe };

<div className="max-w-sm space-y-4">
  {data.map((item) => {
    const Icon = icons[item.icon as "Search" | "Mail" | "Globe"];
    return (
      <div key={item.id} className="space-y-2">
        <Label>{item.label}</Label>
        <div className="relative">
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type={item.type || "text"} placeholder={item.placeholder} className="pl-10" />
        </div>
      </div>
    );
  })}
</div>`;

    return (
        <ComponentInstall category="composite-input" variant="composite-input-icon-prefix" title="Input with Icon Prefix" code={snippet} fullCode={code}>
            <div className="max-w-sm space-y-4">
                {data.map((item) => {
                    const Icon = { Search, Mail, Globe }[item.icon as "Search" | "Mail" | "Globe"];
                    return (
                        <div key={item.id} className="space-y-2">
                            <Label>{item.label}</Label>
                            <div className="relative">
                                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type={item.type || "text"} placeholder={item.placeholder} className="pl-10" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </ComponentInstall>
    );
}