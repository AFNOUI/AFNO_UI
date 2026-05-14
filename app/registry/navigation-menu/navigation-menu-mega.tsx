export const data = {
  productCategories: [
    { title: "Electronics", items: ["Laptops", "Phones", "Tablets", "Accessories"] },
    { title: "Clothing", items: ["Men", "Women", "Kids", "Sports"] },
    { title: "Home", items: ["Furniture", "Decor", "Kitchen", "Garden"] },
  ],
  solutions: [
    { title: "For Startups", icon: "Zap", description: "Affordable plans designed for growing businesses." },
    { title: "For Enterprise", icon: "Shield", description: "Enterprise-grade security and scalability." },
    { title: "For Developers", icon: "Code", description: "APIs and tools to build custom integrations." },
  ],
  pricingLink: { label: "Pricing", href: "#" },
};

const dataStr = JSON.stringify(data, null, 2);
export const code =
  'import React from "react";\n' +
  'import { Zap, Shield, Code } from "lucide-react";\n' +
  'import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuContent, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";\n\n' +
  "const data = " +
  dataStr +
  ";\n\n" +
  "const solutionIcons = { Zap, Shield, Code };\n\n" +
  "export default function NavigationMenuMegaExample() {\n" +
  "  return (\n" +
  "    <NavigationMenu>\n" +
  "      <NavigationMenuList className=\"flex flex-col lg:flex-row gap-2\">\n" +
  "        {data.productCategories.map((cat) => (\n" +
  "          <NavigationMenuItem key={cat.title}>\n" +
  "            <NavigationMenuTrigger>{cat.title}</NavigationMenuTrigger>\n" +
  "            <NavigationMenuContent>\n" +
  "              <ul className=\"grid w-[400px] gap-3 p-4\">\n" +
  "                {cat.items.map((item) => (\n" +
  "                  <li key={item}>\n" +
  "                    <NavigationMenuLink href=\"#\">{item}</NavigationMenuLink>\n" +
  "                  </li>\n" +
  "                ))}\n" +
  "              </ul>\n" +
  "            </NavigationMenuContent>\n" +
  "          </NavigationMenuItem>\n" +
  "        ))}\n" +
  "        {data.solutions.map((s) => (\n" +
  "          <NavigationMenuItem key={s.title}>\n" +
  "            <NavigationMenuTrigger>{s.title}</NavigationMenuTrigger>\n" +
  "            <NavigationMenuContent>\n" +
  "              <ul className=\"grid w-[400px] gap-3 p-4\">\n" +
  "                <li>\n" +
  "                  <NavigationMenuLink asChild>\n" +
  "                    <a href=\"#\" className=\"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none hover:bg-accent\">\n" +
  "                      <div className=\"text-sm font-medium leading-none\">{s.title}</div>\n" +
  "                      <p className=\"line-clamp-2 text-sm text-muted-foreground\">{s.description}</p>\n" +
  "                    </a>\n" +
  "                  </NavigationMenuLink>\n" +
  "                </li>\n" +
  "              </ul>\n" +
  "            </NavigationMenuContent>\n" +
  "          </NavigationMenuItem>\n" +
  "        ))}\n" +
  "        <NavigationMenuItem>\n" +
  "          <NavigationMenuLink className={navigationMenuTriggerStyle()} href={data.pricingLink.href}>\n" +
  "            {data.pricingLink.label}\n" +
  "          </NavigationMenuLink>\n" +
  "        </NavigationMenuItem>\n" +
  "      </NavigationMenuList>\n" +
  "    </NavigationMenu>\n" +
  "  );\n" +
  "}\n";
