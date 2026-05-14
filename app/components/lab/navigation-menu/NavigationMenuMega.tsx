"use client";

import { Zap, Shield, Code } from "lucide-react";
import {
  ListItem,
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuContent,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/navigation-menu/navigation-menu-mega";

const solutionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Shield,
  Code,
};

export function NavigationMenuMega() {
  const snippet = "const data = " + JSON.stringify(data, null, 2) + ";\n\n// Products mega + Solutions";

  return (
    <ComponentInstall
      category="navigation-menu"
      variant="navigation-menu-mega"
      title="Products Mega Menu"
      code={snippet}
      fullCode={code}
    >
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid gap-3 p-4 w-[600px] grid-cols-3">
                {data.productCategories.map((category) => (
                  <div key={category.title} className="space-y-3">
                    <h4 className="font-medium text-sm text-primary">{category.title}</h4>
                    <ul className="space-y-2">
                      {category.items.map((item) => (
                        <li key={item}>
                          <NavigationMenuLink asChild>
                            <a
                              href="#"
                              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {item}
                            </a>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4">
                {data.solutions.map((item) => {
                  const Icon = solutionIcons[item.icon];
                  return (
                    <ListItem
                      key={item.title}
                      href="#"
                      title={item.title}
                      icon={Icon ? <Icon className="h-4 w-4 text-primary" /> : undefined}
                    >
                      {item.description}
                    </ListItem>
                  );
                })}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} href={data.pricingLink.href}>
              {data.pricingLink.label}
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </ComponentInstall>
  );
}
