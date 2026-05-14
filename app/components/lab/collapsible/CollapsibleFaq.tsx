"use client";

import { Plus, Minus } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/collapsible/collapsible-faq";

export function CollapsibleFaq() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<div className="max-w-lg space-y-2">
  {data.map((faq, index) => (
    <Collapsible key={index} className="border rounded-lg">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-start hover:bg-accent/50">
        <span className="font-medium">{faq.question}</span>
        <Plus className="h-4 w-4 shrink-0 ms-2 [[data-state=open]>&]:hidden" />
        <Minus className="h-4 w-4 shrink-0 ms-2 [[data-state=closed]>&]:hidden" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-4 text-muted-foreground">
          {faq.answer}
        </div>
      </CollapsibleContent>
    </Collapsible>
  ))}
</div>`;

  return (
    <ComponentInstall
      category="collapsible"
      variant="collapsible-faq"
      title="FAQ Style"
      code={snippet}
      fullCode={code}
    >
      <div className="max-w-lg space-y-2">
        {data.map((faq, index) => (
          <Collapsible key={index} className="border rounded-lg">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-start hover:bg-accent/50">
              <span className="font-medium">{faq.question}</span>
              <Plus className="h-4 w-4 shrink-0 ms-2 [[data-state=open]>&]:hidden" />
              <Minus className="h-4 w-4 shrink-0 ms-2 [[data-state=closed]>&]:hidden" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 text-muted-foreground">
                {faq.answer}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </ComponentInstall>
  );
}
