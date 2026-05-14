export const data = [
  { title: "Total Revenue", value: "$45,231.89", change: "+20.1%", trend: "up", icon: "DollarSign" },
  { title: "Subscriptions", value: "+2,350", change: "+180.1%", trend: "up", icon: "Users" },
  { title: "Sales", value: "+12,234", change: "-4.5%", trend: "down", icon: "ShoppingCart" },
  { title: "Active Now", value: "+573", change: "+201", trend: "up", icon: "Activity" },
];

export const code = `import React from "react";
import { DollarSign, Users, ShoppingCart, Activity, TrendingUp, TrendingDown } from "lucide-react";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
} from "@/components/ui/card";

const data = ${JSON.stringify(data, null, 2)};

export default function CardStatsExample() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {data.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            {item.icon === "DollarSign" && <DollarSign className="h-4 w-4 text-muted-foreground" />}
            {item.icon === "Users" && <Users className="h-4 w-4 text-muted-foreground" />}
            {item.icon === "ShoppingCart" && <ShoppingCart className="h-4 w-4 text-muted-foreground" />}
            {item.icon === "Activity" && <Activity className="h-4 w-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {item.trend === "up" ? (
                <>
                  <TrendingUp className="h-3 w-3 text-[hsl(var(--progress-success))]" />
                  <span className="text-[hsl(var(--progress-success))]">{item.change}</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-destructive" />
                  <span className="text-destructive">{item.change}</span>
                </>
              )}
              from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
`;