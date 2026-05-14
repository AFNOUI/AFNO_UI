import { buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

export const data = [
  {
    name: "Free",
    price: "$0",
    features: ["Basic features", "Community support"],
    buttonText: "Get Started",
    buttonVariant: "outline" as ButtonVariant,
    selected: false,
  },
  {
    name: "Pro",
    price: "$29",
    features: ["Advanced analytics", "Priority support", "Custom integrations"],
    buttonText: "Subscribe",
    buttonVariant: "default" as ButtonVariant,
    selected: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    features: ["Everything in Pro", "Dedicated support", "SLA guarantee"],
    buttonText: "Contact Sales",
    buttonVariant: "outline" as ButtonVariant,
    selected: false,
  },
];

export const code = `import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const data = ${JSON.stringify(data, null, 2)} as const;

interface Plan {
  name: string;
  price: string;
  features: string[];
  buttonText: string;
  selected?: boolean;
  buttonVariant: "default" | "outline";
}

export default function CheckboxCardStyleExample() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div className="grid gap-4 md:grid-cols-3 max-w-2xl">
      {data.map((plan, index) => (
        <label
          key={index}
          className={\`relative flex flex-col p-4 border border-border rounded-lg cursor-pointer transition-all hover:border-primary/50 \${selectedPlan === plan.name ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : ''}\`}
        >
          {selectedPlan === plan.name && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary">Most Popular</Badge>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">{plan.name}</h3>
            <div className="text-4xl font-bold">{plan.price}<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
          </div>
          <ul className="space-y-2 text-sm">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2">
                <Checkbox
                  id={\`plan-\${index}-\${i}\`}
                  checked={selectedPlan === plan.name}
                />
                {feature}
              </li>
            ))}
          </ul>
          <Button variant={plan.buttonVariant} className="w-full mt-4">
            {plan.buttonText}
          </Button>
        </label>
      ))}
    </div>
  );
}
`;