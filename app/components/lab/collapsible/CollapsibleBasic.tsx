"use client";

import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/collapsible/collapsible-basic";

export function CollapsibleBasic() {
    const [isOpen, setIsOpen] = useState(false);

    const snippet = `const [isOpen, setIsOpen] = useState(false);

const data = ${JSON.stringify(data, null, 2)};

<Collapsible open={isOpen} onOpenChange={setIsOpen}>
  <CollapsibleTrigger asChild>
    <Button variant="outline" className="w-full justify-between">
      <span>@peduarte starred {data.length} repositories</span>
      <ChevronsUpDown className="h-4 w-4" />
    </Button>
  </CollapsibleTrigger>
  <CollapsibleContent className="space-y-2 mt-2">
    {data.map((repo, index) => (
      <div key={index} className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
        {repo.name}
      </div>
    ))}
  </CollapsibleContent>
</Collapsible>`;

    return (
        <ComponentInstall category="collapsible" variant="collapsible-basic" title="Basic Collapsible" code={snippet} fullCode={code}>
            <div className="max-w-sm">
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                            <span>@peduarte starred {data.length} repositories</span>
                            <ChevronsUpDown className="h-4 w-4" />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2">
                        {data.map((repo, index) => (
                            <div key={index} className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
                                {repo.name}
                            </div>
                        ))}
                    </CollapsibleContent>
                </Collapsible>
            </div>
        </ComponentInstall>
    );
}