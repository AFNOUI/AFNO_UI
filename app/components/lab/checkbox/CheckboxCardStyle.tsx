"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/checkbox/checkbox-card-style";

export function CheckboxCardStyle() {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    const snippet = `const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);

const data = ${JSON.stringify(data, null, 2)} as const;

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
      <Button variant={plan.buttonVariant as ButtonVariant} className="w-full mt-4">
        {plan.buttonText}
      </Button>
    </label>
  ))}
</div>`;

    return (
        <ComponentInstall category="checkbox" variant="checkbox-card-style" title="Card Style Selection" code={snippet} fullCode={code}>
            <div className="grid gap-4 md:grid-cols-3 max-w-2xl">
                {data.map((plan, index) => (
                    <label
                        key={index}
                        onClick={() => setSelectedPlan(plan.name)}
                        className={`relative flex flex-col gap-4 p-4 border border-border rounded-lg transition-all hover:border-primary/50 ${selectedPlan === plan.name ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : ''}`}
                    >
                        <div className="flex flex-col gap-2">
                            <h3 className="font-semibold">{plan.name}</h3>
                            <div className="text-4xl font-bold">{plan.price}<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                        </div>
                        <ul className="space-y-2 text-sm">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`plan-${index}-${i}`}
                                        className="pointer-events-none"
                                        checked={selectedPlan === plan.name}
                                    />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Button variant={plan.buttonVariant as ButtonVariant} className="w-full mt-4 cursor-pointer" type="button">
                            {plan.buttonText}
                        </Button>
                    </label>
                ))}
            </div>
        </ComponentInstall>
    );
}