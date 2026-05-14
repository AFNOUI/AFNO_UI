export const data = [
  {
    name: "Starter",
    icon: "Zap",
    description: "Perfect for individuals",
    price: "$0",
    features: ["5 projects", "Basic analytics", "Community support"],
    buttonText: "Get Started",
    buttonVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Pro",
    icon: "Crown",
    description: "Best for growing teams",
    price: "$29",
    features: ["Unlimited projects", "Advanced analytics", "Priority support", "Custom integrations"],
    buttonText: "Subscribe",
    buttonVariant: "default" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    icon: "Rocket",
    description: "For large organizations",
    price: "$99",
    features: ["Everything in Pro", "Dedicated support", "SLA guarantee", "Custom contracts"],
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
    popular: false,
  },
];

export const code = `import React from "react";
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
import { Button } from "@/components/ui/button";

const data = ${JSON.stringify(data, null, 2)} as const;

export default function CardPricingExample() {
  return (
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
            <Button variant={plan.buttonVariant} className="w-full">
              {plan.buttonText}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
`;