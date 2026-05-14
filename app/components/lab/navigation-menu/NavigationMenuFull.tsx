"use client";

import { Blocks, Layers, Code, Palette, Shield, BarChart, Zap, Settings } from "lucide-react";
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
import { code, data } from "@/registry/navigation-menu/navigation-menu-full";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  Blocks,
  Layers,
  Code,
  Palette,
  Shield,
  BarChart,
  Zap,
  Settings,
};

export function NavigationMenuFull() {
  const snippet = "const data = " + JSON.stringify(data, null, 2) + ";\n\n<NavigationMenu>...";

  return (
    <ComponentInstall
      category="navigation-menu"
      variant="navigation-menu-full"
      title="Full Navigation Menu"
      code={snippet}
      fullCode={code}
    >
      <NavigationMenu>
        <NavigationMenuList>
          {data.triggers.map((trigger) => (
            <NavigationMenuItem key={trigger.label}>
              <NavigationMenuTrigger>{trigger.label}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul
                  className={
                    trigger.promo
                      ? "grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]"
                      : "grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]"
                  }
                >
                  {trigger.promo && (
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-linear-to-b from-primary/50 to-primary p-6 no-underline outline-none focus:shadow-md"
                          href="#"
                        >
                          <Blocks className="h-6 w-6 text-primary-foreground" />
                          <div className="mb-2 mt-4 text-lg font-medium text-primary-foreground">
                            {trigger.promo.title}
                          </div>
                          <p className="text-sm leading-tight text-primary-foreground/80">
                            {trigger.promo.description}
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  )}
                  {trigger.listItems.map((item) => {
                    const Icon = icons[item.icon];
                    return (
                      <ListItem
                        key={item.title}
                        href={item.href}
                        title={item.title}
                        icon={Icon ? <Icon className="h-4 w-4" /> : undefined}
                      >
                        {item.description}
                      </ListItem>
                    );
                  })}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ))}
          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} href={data.simpleLink.href}>
              {data.simpleLink.label}
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </ComponentInstall>
  );
}
