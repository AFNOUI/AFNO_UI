
export const data = [
  {
    value: "item-1",
    trigger: "Can I open multiple items?",
    content: "Yes! This version uses type='multiple' so you don't have to close one to open another.",
  },
  {
    value: "item-2",
    trigger: "Is it still accessible?",
    content: "Absolutely. It maintains all WAI-ARIA standards for screen readers.",
  },
];

export const code = `import React from "react";
    
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";

const data = ${JSON.stringify(data, null, 2)};

export default function AccordionMultipleExample() {
  return (
    <div className="flex justify-center p-8 w-full">
      <Accordion type="multiple" className="w-full max-w-lg">
        {data.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>{item.trigger}</AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}`;
