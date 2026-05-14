"use client";

import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { code, data } from "@/registry/accordion/accordion-single";
import { ComponentInstall } from "@/components/lab/ComponentInstall";

export function AccordionSingle() {

  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<AccordionDemo data={data} />`;

  return (
    <ComponentInstall
      category="accordion"
      variant="accordion-single"
      title="Accordion Component"
      code={snippet}
      fullCode={code}
    >
      <Accordion type="single" collapsible className="w-full max-w-lg">
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
