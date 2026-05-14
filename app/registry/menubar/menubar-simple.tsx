export const data = {
  className: "border-none bg-transparent",
  menus: [
    {
      trigger: "Products",
      items: [
        { type: "label", label: "Categories" },
        { label: "Electronics" },
        { label: "Clothing" },
        { label: "Books" },
        { label: "Home & Garden" },
        { type: "separator" },
        { label: "All Products" },
      ],
    },
    {
      trigger: "Solutions",
      items: [
        { label: "For Startups" },
        { label: "For Enterprise" },
        { label: "For Developers" },
        { type: "separator" },
        { label: "Case Studies" },
      ],
    },
    {
      trigger: "Resources",
      items: [
        { label: "Documentation" },
        { label: "API Reference" },
        { label: "Tutorials" },
        { type: "separator" },
        { label: "Community" },
        { label: "Blog" },
      ],
    },
    {
      trigger: "Pricing",
      items: [
        { label: "Free Tier" },
        { label: "Pro Plan" },
        { label: "Enterprise" },
        { type: "separator" },
        { label: "Compare Plans" },
      ],
    },
  ],
};

const dataStr = JSON.stringify(data, null, 2);
export const code = `import React from "react";
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarLabel, MenubarSeparator } from "@/components/ui/menubar";

const data = ${dataStr};

export default function MenubarSimpleExample() {
  return (
    <Menubar className={data.className}>
      {data.menus.map((menu) => (
        <MenubarMenu key={menu.trigger}>
          <MenubarTrigger>{menu.trigger}</MenubarTrigger>
          <MenubarContent>
            {menu.items.map((item, i) =>
              item.type === "label" ? <MenubarLabel key={i}>{item.label}</MenubarLabel> :
              item.type === "separator" ? <MenubarSeparator key={i} /> : (
                <MenubarItem key={i}>{item.label}</MenubarItem>
              )
            )}
          </MenubarContent>
        </MenubarMenu>
      ))}
    </Menubar>
  );
}
`;
