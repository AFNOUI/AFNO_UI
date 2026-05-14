"use client";

import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarSeparator,
} from "@/components/ui/menubar";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/menubar/menubar-simple";

export function MenubarSimple() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<Menubar className={data.className}>
  {data.menus.map((menu) => (
    <MenubarMenu key={menu.trigger}>
      <MenubarTrigger>{menu.trigger}</MenubarTrigger>
      <MenubarContent>...</MenubarContent>
    </MenubarMenu>
  ))}
</Menubar>`;

  return (
    <ComponentInstall category="menubar" variant="menubar-simple" title="Simple Navigation" code={snippet} fullCode={code}>
      <Menubar className={data.className}>
        {data.menus.map((menu) => (
          <MenubarMenu key={menu.trigger}>
            <MenubarTrigger>{menu.trigger}</MenubarTrigger>
            <MenubarContent>
              {menu.items.map((item, i) =>
                item.type === "label" ? (
                  <MenubarLabel key={i}>{item.label}</MenubarLabel>
                ) : item.type === "separator" ? (
                  <MenubarSeparator key={i} />
                ) : (
                  <MenubarItem key={i}>{item.label}</MenubarItem>
                )
              )}
            </MenubarContent>
          </MenubarMenu>
        ))}
      </Menubar>
    </ComponentInstall>
  );
}
