export const data = {
  triggers: [
    {
      label: "Getting started",
      promo: {
        icon: "Blocks",
        title: "UI Components",
        description: "Beautifully designed components built with Radix UI and Tailwind CSS.",
      },
      listItems: [
        { href: "#", title: "Introduction", icon: "Layers", description: "Re-usable components built using Radix UI and Tailwind CSS." },
        { href: "#", title: "Installation", icon: "Code", description: "How to install dependencies and structure your app." },
        { href: "#", title: "Typography", icon: "Palette", description: "Styles for headings, paragraphs, lists, and more." },
      ],
    },
    {
      label: "Components",
      listItems: [
        { href: "#", title: "Alert Dialog", icon: "Shield", description: "A modal dialog that interrupts the user with important content." },
        { href: "#", title: "Hover Card", icon: "Layers", description: "For sighted users to preview content behind a link." },
        { href: "#", title: "Progress", icon: "BarChart", description: "Displays an indicator showing completion progress." },
        { href: "#", title: "Scroll Area", icon: "Zap", description: "Visually or semantically separates content." },
        { href: "#", title: "Tabs", icon: "Settings", description: "A set of layered sections of content—known as tab panels." },
        { href: "#", title: "Tooltip", icon: "Code", description: "A popup that displays information related to an element." },
      ],
    },
  ],
  simpleLink: { label: "Documentation", href: "#" },
};

const dataStr = JSON.stringify(data, null, 2);
export const code =
  'import React from "react";\n' +
  'import { Blocks, Layers, Code, Palette, Shield, BarChart, Zap, Settings } from "lucide-react";\n' +
  'import { ListItem, NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuContent, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";\n\n' +
  "const data = " +
  dataStr +
  ";\n\n" +
  "const iconMap = { Blocks, Layers, Code, Palette, Shield, BarChart, Zap, Settings };\n\n" +
  "export default function NavigationMenuFullExample() {\n" +
  "  return (\n" +
  "    <NavigationMenu>\n" +
  "      <NavigationMenuList>\n" +
  "        {data.triggers.map((t) => (\n" +
  "          <NavigationMenuItem key={t.label}>\n" +
  "            {t.promo ? (\n" +
  "              <NavigationMenuTrigger>{t.label}</NavigationMenuTrigger>\n" +
  "            ) : (\n" +
  "              <NavigationMenuTrigger>{t.label}</NavigationMenuTrigger>\n" +
  "            )}\n" +
  "            <NavigationMenuContent>\n" +
  "              <ul className=\"grid gap-3 p-4 w-[400px] md:w-[500px] lg:w-[600px] lg:grid-cols-2\">\n" +
  "                {t.promo && (\n" +
  "                  <li className=\"row-span-3\">\n" +
  "                    <NavigationMenuLink asChild>\n" +
  "                      <a className=\"flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline\" href=\"#\">\n" +
  "                        <div className=\"mb-2 mt-4 text-lg font-medium\">{t.promo.title}</div>\n" +
  "                        <p className=\"text-sm leading-tight text-muted-foreground\">{t.promo.description}</p>\n" +
  "                      </a>\n" +
  "                    </NavigationMenuLink>\n" +
  "                  </li>\n" +
  "                )}\n" +
  "                {t.listItems?.map((item) => (\n" +
  "                  <ListItem key={item.title} href={item.href} title={item.title}>\n" +
  "                    {item.description}\n" +
  "                  </ListItem>\n" +
  "                ))}\n" +
  "              </ul>\n" +
  "            </NavigationMenuContent>\n" +
  "          </NavigationMenuItem>\n" +
  "        ))}\n" +
  "        <NavigationMenuItem>\n" +
  "          <NavigationMenuLink className={navigationMenuTriggerStyle()} href={data.simpleLink.href}>\n" +
  "            {data.simpleLink.label}\n" +
  "          </NavigationMenuLink>\n" +
  "        </NavigationMenuItem>\n" +
  "      </NavigationMenuList>\n" +
  "    </NavigationMenu>\n" +
  "  );\n" +
  "}\n";
