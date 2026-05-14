export const data = [
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise customers."
  },
  {
    question: "Can I cancel my subscription?",
    answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 30-day money-back guarantee on all plans. Contact support if you'd like to request a refund."
  },
];

export const code = `import React from "react";
import { Plus, Minus } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const data = ${JSON.stringify(data, null, 2)};

export default function CollapsibleFAQExample() {
  return (
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
  );
}
`;