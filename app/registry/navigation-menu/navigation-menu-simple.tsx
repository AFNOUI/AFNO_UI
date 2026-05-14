export const data = {
  links: [
    { label: "Home", href: "#" },
    { label: "About", href: "#" },
    { label: "Services", href: "#" },
    { label: "Contact", href: "#" },
  ],
};

const dataStr = JSON.stringify(data, null, 2);
export const code =
  'import React from "react";\n' +
  'import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";\n\n' +
  "const data = " +
  dataStr +
  ";\n\n" +
  "export default function NavigationMenuSimpleExample() {\n" +
  "  return (\n" +
  "    <NavigationMenu>\n" +
  "      <NavigationMenuList>\n" +
  "        {data.links.map((link) => (\n" +
  "          <NavigationMenuItem key={link.label}>\n" +
  "            <NavigationMenuLink className={navigationMenuTriggerStyle()} href={link.href}>\n" +
  "              {link.label}\n" +
  "            </NavigationMenuLink>\n" +
  "          </NavigationMenuItem>\n" +
  "        ))}\n" +
  "      </NavigationMenuList>\n" +
  "    </NavigationMenu>\n" +
  "  );\n" +
  "}\n";
