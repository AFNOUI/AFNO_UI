"use client";

import { useState } from "react";
import {
  Menubar,
  MenubarSub,
  MenubarItem,
  MenubarMenu,
  MenubarContent,
  MenubarTrigger,
  MenubarShortcut,
  MenubarSeparator,
  MenubarRadioItem,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarRadioGroup,
  MenubarCheckboxItem,
} from "@/components/ui/menubar";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/menubar/menubar-application";

type Menu = (typeof data.menus)[number];
type CheckboxItem = NonNullable<Extract<Menu, { checkboxItems?: unknown }>["checkboxItems"]>[number];
type RadioGroup = NonNullable<Extract<Menu, { radioGroup?: unknown }>["radioGroup"]>;
type SubMenuEntry = { label: string } | { type: "separator" };
type MenuItem =
  | { type: "item"; label: string; shortcut?: string; disabled?: boolean; inset?: boolean }
  | { type: "separator" }
  | { type: "sub"; trigger: string; items: readonly SubMenuEntry[] };

function renderMenuItems(items: readonly MenuItem[]) {
  return items.map((item, i) => {
    if (item.type === "separator") return <MenubarSeparator key={i} />;
    if (item.type === "sub") {
      return (
        <MenubarSub key={i}>
          <MenubarSubTrigger>{item.trigger}</MenubarSubTrigger>
          <MenubarSubContent>
            {item.items.map((sub, j) =>
              "type" in sub && sub.type === "separator" ? (
                <MenubarSeparator key={j} />
              ) : (
                <MenubarItem key={j}>{"label" in sub ? sub.label : null}</MenubarItem>
              )
            )}
          </MenubarSubContent>
        </MenubarSub>
      );
    }
    return (
      <MenubarItem key={i} disabled={item.disabled} inset={item.inset}>
        {item.label}
        {item.shortcut && <MenubarShortcut>{item.shortcut}</MenubarShortcut>}
      </MenubarItem>
    );
  });
}

export function MenubarApplication() {
  const [showBookmarks, setShowBookmarks] = useState(true);
  const [showFullUrls, setShowFullUrls] = useState(false);
  const [person, setPerson] = useState("andy");

  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<Menubar>
  {data.menus.map((menu) => (
    <MenubarMenu key={menu.trigger}>
      <MenubarTrigger>{menu.trigger}</MenubarTrigger>
      <MenubarContent>...</MenubarContent>
    </MenubarMenu>
  ))}
</Menubar>`;

  return (
    <ComponentInstall category="menubar" variant="menubar-application" title="Application Menubar" code={snippet} fullCode={code}>
      <Menubar>
        {data.menus.map((menu: Menu) => (
          <MenubarMenu key={menu.trigger}>
            <MenubarTrigger>{menu.trigger}</MenubarTrigger>
            <MenubarContent>
              {"checkboxItems" in menu &&
                menu.checkboxItems?.map((cb: CheckboxItem) => (
                  <MenubarCheckboxItem
                    key={cb.id}
                    checked={cb.id === "bookmarks" ? showBookmarks : showFullUrls}
                    onCheckedChange={cb.id === "bookmarks" ? setShowBookmarks : setShowFullUrls}
                  >
                    {cb.label}
                  </MenubarCheckboxItem>
                ))}
              {"radioGroup" in menu && menu.radioGroup && (
                <MenubarRadioGroup value={person} onValueChange={setPerson}>
                  {menu.radioGroup.options.map((opt: RadioGroup["options"][number]) => (
                    <MenubarRadioItem key={opt} value={opt}>
                      {menu.radioGroup!.labels[opt as keyof typeof menu.radioGroup.labels]}
                    </MenubarRadioItem>
                  ))}
                </MenubarRadioGroup>
              )}
              {menu.items && renderMenuItems(menu.items)}
            </MenubarContent>
          </MenubarMenu>
        ))}
      </Menubar>
    </ComponentInstall>
  );
}
