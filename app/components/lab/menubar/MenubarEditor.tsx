"use client";

import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarShortcut,
  MenubarSeparator,
} from "@/components/ui/menubar";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/menubar/menubar-editor";

export function MenubarEditor() {
  const snippet = "const data = " + JSON.stringify(data, null, 2) + ";\n\n<Menubar className={data.className}>...";

  return (
    <ComponentInstall category="menubar" variant="menubar-editor" title="Text Editor Menubar" code={snippet} fullCode={code}>
      <Menubar className={data.className}>
        {data.menus.map((menu) => (
          <MenubarMenu key={menu.trigger}>
            <MenubarTrigger className={"triggerClassName" in menu ? menu.triggerClassName : undefined}>
              {menu.trigger}
            </MenubarTrigger>
            <MenubarContent>
              {menu.items.map((item, i) =>
                item.type === "separator" ? (
                  <MenubarSeparator key={i} />
                ) : (
                  <MenubarItem key={i}>
                    {item.label}
                    {"shortcut" in item && item.shortcut && <MenubarShortcut>{item.shortcut}</MenubarShortcut>}
                  </MenubarItem>
                )
              )}
            </MenubarContent>
          </MenubarMenu>
        ))}
      </Menubar>
    </ComponentInstall>
  );
}
