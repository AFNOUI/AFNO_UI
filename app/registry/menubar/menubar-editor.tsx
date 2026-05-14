export const data = {
  className: "rounded-none border-b border-none px-2 lg:px-4",
  menus: [
    { trigger: "Editor", triggerClassName: "font-bold", items: [
      { label: "About Editor" }, { type: "separator" }, { label: "Preferences", shortcut: "⌘," }, { type: "separator" }, { label: "Hide Editor", shortcut: "⌘H" }, { label: "Quit", shortcut: "⌘Q" },
    ]},
    { trigger: "File", items: [
      { label: "New File", shortcut: "⌘N" }, { label: "Open File", shortcut: "⌘O" }, { label: "Open Folder" }, { type: "separator" }, { label: "Save", shortcut: "⌘S" }, { label: "Save As..." }, { label: "Save All" }, { type: "separator" }, { label: "Close File" }, { label: "Close Folder" },
    ]},
    { trigger: "Selection", items: [
      { label: "Select All", shortcut: "⌘A" }, { label: "Expand Selection" }, { label: "Shrink Selection" }, { type: "separator" }, { label: "Copy Line Up" }, { label: "Copy Line Down" }, { label: "Move Line Up" }, { label: "Move Line Down" },
    ]},
    { trigger: "Go", items: [
      { label: "Back" }, { label: "Forward" }, { type: "separator" }, { label: "Go to File...", shortcut: "⌘P" }, { label: "Go to Symbol...", shortcut: "⌘⇧O" }, { label: "Go to Line...", shortcut: "⌃G" },
    ]},
    { trigger: "Run", items: [
      { label: "Start Debugging", shortcut: "F5" }, { label: "Run Without Debugging" }, { label: "Stop Debugging", shortcut: "⇧F5" }, { type: "separator" }, { label: "Toggle Breakpoint" },
    ]},
  ],
};

const dataStr = JSON.stringify(data, null, 2);
export const code =
  'import React from "react";\n' +
  'import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarShortcut, MenubarSeparator } from "@/components/ui/menubar";\n\n' +
  "const data = " +
  dataStr +
  ";\n\n" +
  "export default function MenubarEditorExample() {\n" +
  "  return (\n" +
  "    <Menubar className={data.className}>\n" +
  "      {data.menus.map((menu) => (\n" +
  "        <MenubarMenu key={menu.trigger}>\n" +
  "          <MenubarTrigger className={\"triggerClassName\" in menu ? menu.triggerClassName : undefined}>{menu.trigger}</MenubarTrigger>\n" +
  "          <MenubarContent>\n" +
  "            {menu.items.map((item, i) =>\n" +
  '              item.type === "separator" ? <MenubarSeparator key={i} /> : (\n' +
  "              <MenubarItem key={i}>\n" +
  "                {item.label}\n" +
  "                {\"shortcut\" in item && item.shortcut && <MenubarShortcut>{item.shortcut}</MenubarShortcut>}\n" +
   "              </MenubarItem>\n" +
  "            ))}\n" +
  "          </MenubarContent>\n" +
  "        </MenubarMenu>\n" +
  "      ))}\n" +
  "    </Menubar>\n" +
  "  );\n" +
  "}\n";
