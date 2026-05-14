"use client";

import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/accordion/accordion-multiple";

export function AccordionMultiple() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<Accordion type="multiple" collapsible>
  {data.map((item) => (
     <AccordionItem key={item.value} value={item.value}>
       <AccordionTrigger>{item.trigger}</AccordionTrigger>
       <AccordionContent>{item.content}</AccordionContent>
     </AccordionItem>
  ))}
</Accordion>`;

  return (
    <ComponentInstall
      category="accordion"
      variant="accordion-multiple"
      title="Multiple Selection"
      code={snippet}
      fullCode={code}
    >
      <Accordion type="multiple" className="w-full max-w-lg">
        {data.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>{item.trigger}</AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ComponentInstall>
  );
}
