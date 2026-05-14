"use client";

import { Settings, ChevronDown } from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/collapsible/collapsible-settings";

export function CollapsibleSettings() {
    const snippet = `const data = ${JSON.stringify(data, null, 2)};

<div className="max-w-md space-y-2">
  {data.map((section, index) => (
    <Collapsible key={index} defaultOpen={index === 0} className="border rounded-lg">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent/50">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="font-medium">{section.title}</span>
        </div>
        <ChevronDown className="h-4 w-4 transition-transform [[data-state=closed]>&]:-rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-4 space-y-3">
          {section.items.map((item, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-sm">{item.label}</span>
              <span className="text-sm text-muted-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  ))}
</div>`;

    return (
        <ComponentInstall category="collapsible" variant="collapsible-settings" title="Settings Sections" code={snippet} fullCode={code}>
            <div className="max-w-md space-y-2">
                {data.map((section, index) => (
                    <Collapsible key={index} defaultOpen={index === 0} className="border rounded-lg">
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent/50">
                            <div className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                <span className="font-medium">{section.title}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 transition-transform [[data-state=closed]>&]:-rotate-90" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="px-4 pb-4 space-y-3">
                                {section.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <span className="text-sm">{item.label}</span>
                                        <span className="text-sm text-muted-foreground">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                ))}
            </div>
        </ComponentInstall>
    );
}