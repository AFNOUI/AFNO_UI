"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/navigation-menu/navigation-menu-simple";

export function NavigationMenuSimple() {
  const snippet = "const data = " + JSON.stringify(data, null, 2) + ";\n\n<NavigationMenu>...";

  return (
    <ComponentInstall
      category="navigation-menu"
      variant="navigation-menu-simple"
      title="Simple Links Navigation"
      code={snippet}
      fullCode={code}
    >
      <NavigationMenu>
        <NavigationMenuList>
          {data.links.map((link) => (
            <NavigationMenuItem key={link.label}>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href={link.href}>
                {link.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </ComponentInstall>
  );
}
