"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/collapsible/collapsible-animated";

export function CollapsibleAnimated() {
    const snippet = `const data = ${JSON.stringify(data, null, 2)};

<Card>
  <Collapsible defaultOpen>
    <CardHeader className="pb-2">
      <CollapsibleTrigger className="flex items-center justify-between w-full">
        <CardTitle className="text-base">Activity Log</CardTitle>
        <ChevronDown className="h-4 w-4 transition-transform duration-200 [[data-state=closed]>&]:-rotate-90" />
      </CollapsibleTrigger>
    </CardHeader>
    <CollapsibleContent className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
      <CardContent className="pt-0">
        <div className="space-y-3">
          {data.map((log, index) => (
            <div key={index} className="flex justify-between text-sm border-b pb-2 last:border-0">
              <span>{log.action}</span>
              <span className="text-muted-foreground">{log.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </CollapsibleContent>
  </Collapsible>
</Card>`;

    return (
        <ComponentInstall category="collapsible" variant="collapsible-animated" title="Animated Content" code={snippet} fullCode={code}>
            <div className="max-w-md">
                <Card>
                    <Collapsible defaultOpen>
                        <CardHeader className="pb-2">
                            <CollapsibleTrigger className="flex items-center justify-between w-full">
                                <CardTitle className="text-base">Activity Log</CardTitle>
                                <ChevronDown className="h-4 w-4 transition-transform duration-200 [[data-state=closed]>&]:-rotate-90" />
                            </CollapsibleTrigger>
                        </CardHeader>
                        <CollapsibleContent className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                            <CardContent className="pt-0">
                                <div className="space-y-3">
                                    {data.map((log, index) => (
                                        <div key={index} className="flex justify-between text-sm border-b pb-2 last:border-0">
                                            <span>{log.action}</span>
                                            <span className="text-muted-foreground">{log.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </CollapsibleContent>
                    </Collapsible>
                </Card>
            </div>
        </ComponentInstall>
    );
}