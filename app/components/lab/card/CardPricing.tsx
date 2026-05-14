"use client";

import { Zap, Crown, Rocket, Check } from "lucide-react";
import {
    Card,
    CardTitle,
    CardFooter,
    CardHeader,
    CardContent,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/card/card-pricing";

export function CardPricing() {
    const snippet = `const data = ${JSON.stringify(data, null, 2)};

<div className="grid gap-6 md:grid-cols-3 max-w-4xl">
  {data.map((plan, index) => (
    <Card key={index} className={plan.popular ? "border-primary shadow-lg relative" : ""}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary">Most Popular</Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {plan.icon === "Zap" && <Zap className="h-5 w-5" />}
          {plan.icon === "Crown" && <Crown className="h-5 w-5 text-primary" />}
          {plan.icon === "Rocket" && <Rocket className="h-5 w-5" />}
          {plan.name}
        </CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-4xl font-bold">
          {plan.price}<span className="text-lg font-normal text-muted-foreground">/mo</span>
        </div>
        <ul className="space-y-2 text-sm">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button variant={plan.buttonVariant as any} className="w-full">
          {plan.buttonText}
        </Button>
      </CardFooter>
    </Card>
  ))}
</div>`;

    return (
        <ComponentInstall category="card" variant="card-pricing" title="Pricing Cards" code={snippet} fullCode={code}>
            <div className="grid gap-6 md:grid-cols-3 max-w-4xl">
                {data.map((plan, index) => (
                    <Card key={index} className={plan.popular ? "border-primary shadow-lg relative" : ""}>
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <Badge className="bg-primary">Most Popular</Badge>
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {plan.icon === "Zap" && <Zap className="h-5 w-5" />}
                                {plan.icon === "Crown" && <Crown className="h-5 w-5 text-primary" />}
                                {plan.icon === "Rocket" && <Rocket className="h-5 w-5" />}
                                {plan.name}
                            </CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-4xl font-bold">
                                {plan.price}<span className="text-lg font-normal text-muted-foreground">/mo</span>
                            </div>
                            <ul className="space-y-2 text-sm">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button variant={plan.buttonVariant as ButtonVariant} className="w-full">
                                {plan.buttonText}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </ComponentInstall>
    );
}