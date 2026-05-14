export const data = {
  menus: [
    {
      trigger: "File",
      items: [
        { type: "item", label: "New Tab", shortcut: "⌘T" },
        { type: "item", label: "New Window", shortcut: "⌘N" },
        { type: "item", label: "New Incognito Window", disabled: true },
        { type: "separator" },
        {
          type: "sub",
          trigger: "Share",
          items: [
            { label: "Email link" },
            { label: "Messages" },
            { label: "Notes" },
          ],
        },
        { type: "separator" },
        { type: "item", label: "Print...", shortcut: "⌘P" },
      ],
    },
    {
      trigger: "Edit",
      items: [
        { type: "item", label: "Undo", shortcut: "⌘Z" },
        { type: "item", label: "Redo", shortcut: "⇧⌘Z" },
        { type: "separator" },
        {
          type: "sub",
          trigger: "Find",
          items: [
            { label: "Search the web" },
            { type: "separator" },
            { label: "Find..." },
            { label: "Find Next" },
            { label: "Find Previous" },
          ],
        },
        { type: "separator" },
        { type: "item", label: "Cut" },
        { type: "item", label: "Copy" },
        { type: "item", label: "Paste" },
      ],
    },
    {
      trigger: "View",
      checkboxItems: [
        { id: "bookmarks", label: "Always Show Bookmarks Bar", defaultChecked: true },
        { id: "fullUrls", label: "Always Show Full URLs", defaultChecked: false },
      ],
      items: [
        { type: "separator" },
        { type: "item", label: "Reload", shortcut: "⌘R", inset: true },
        { type: "item", label: "Force Reload", shortcut: "⇧⌘R", disabled: true, inset: true },
        { type: "separator" },
        { type: "item", label: "Toggle Fullscreen", inset: true },
        { type: "separator" },
        { type: "item", label: "Hide Sidebar", inset: true },
      ],
    },
    {
      trigger: "Profiles",
      radioGroup: {
        name: "person",
        options: ["andy", "benoit", "luis"],
        labels: { andy: "Andy", benoit: "Benoit", luis: "Luis" },
        defaultValue: "andy",
      },
      items: [
        { type: "separator" },
        { type: "item", label: "Edit...", inset: true },
        { type: "separator" },
        { type: "item", label: "Add Profile...", inset: true },
      ],
    },
  ],
} as const;

const dataStr = JSON.stringify(data, null, 2);
export const code = `import React, { useState } from "react";
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

type MenubarItemLike = {
  type?: string;
  label?: string;
  shortcut?: string;
  disabled?: boolean;
  inset?: boolean;
  trigger?: string;
  items?: MenubarItemLike[];
};

type MenubarCheckboxItemLike = { id: string; label: string; defaultChecked: boolean };
type MenubarRadioGroupLike = {
  name: string;
  options: string[];
  labels: Record<string, string>;
  defaultValue: string;
};

type MenubarMenuLike = {
  trigger: string;
  items?: MenubarItemLike[];
  checkboxItems?: MenubarCheckboxItemLike[];
  radioGroup?: MenubarRadioGroupLike;
};

const data: { menus: MenubarMenuLike[] } = ${dataStr};

export default function MenubarApplicationExample() {
  const [showBookmarks, setShowBookmarks] = useState(true);
  const [showFullUrls, setShowFullUrls] = useState(false);
  const [person, setPerson] = useState("andy");

  return (
    <Menubar>
      {data.menus.map((menu) => (
        <MenubarMenu key={menu.trigger}>
          <MenubarTrigger>{menu.trigger}</MenubarTrigger>
          <MenubarContent>
            {menu.checkboxItems?.map((cb) => (
              <MenubarCheckboxItem
                key={cb.id}
                checked={cb.id === "bookmarks" ? showBookmarks : showFullUrls}
                onCheckedChange={cb.id === "bookmarks" ? setShowBookmarks : setShowFullUrls}
              >
                {cb.label}
              </MenubarCheckboxItem>
            ))}
            {menu.radioGroup && (
              <MenubarRadioGroup value={person} onValueChange={setPerson}>
                {menu.radioGroup.options.map((opt) => (
                  <MenubarRadioItem key={opt} value={opt}>
                    {menu.radioGroup!.labels[opt]}
                  </MenubarRadioItem>
                ))}
              </MenubarRadioGroup>
            )}
            {menu.items?.map((item, i) =>
              item.type === "separator" ? <MenubarSeparator key={i} /> :
              item.type === "sub" ? (
                <MenubarSub key={i}>
                  <MenubarSubTrigger>{item.trigger}</MenubarSubTrigger>
                  <MenubarSubContent>
                    {item.items?.map((sub, j) =>
                      sub.type === "separator" ? <MenubarSeparator key={j} /> : (
                        <MenubarItem key={j}>{sub.label}</MenubarItem>
                      )
                    )}
                  </MenubarSubContent>
                </MenubarSub>
              ) : (
                <MenubarItem key={i} disabled={item.disabled} inset={item.inset}>
                  {item.label}
                  {item.shortcut && <MenubarShortcut>{item.shortcut}</MenubarShortcut>}
                </MenubarItem>
              )
            )}
          </MenubarContent>
        </MenubarMenu>
      ))}
    </Menubar>
  );
}
`;
