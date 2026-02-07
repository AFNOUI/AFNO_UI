"use client";

// import { useTranslation } from "react-i18next";
import { useState } from "react";

import {
  Menubar,
  MenubarSub,
  MenubarItem,
  MenubarMenu,
  MenubarLabel,
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

import CodePreview from "@/components/lab/CodePreview";
import { SectionTitle } from "@/components/lab/SectionTitle";

export default function MenubarPage() {
  // const { t } = useTranslation();

  const [showBookmarks, setShowBookmarks] = useState(true);
  const [showFullUrls, setShowFullUrls] = useState(false);
  const [person, setPerson] = useState("andy");

  const basicCode = `<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>
        New Tab <MenubarShortcut>⌘T</MenubarShortcut>
      </MenubarItem>
      <MenubarItem>
        New Window <MenubarShortcut>⌘N</MenubarShortcut>
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Print...</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
  <MenubarMenu>
    <MenubarTrigger>Edit</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>
        Undo <MenubarShortcut>⌘Z</MenubarShortcut>
      </MenubarItem>
      <MenubarItem>
        Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`;

  return (
    <div className="space-y-6">
      <SectionTitle>Menubar</SectionTitle>

      <CodePreview title="Application Menubar" code={basicCode}>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                New Tab <MenubarShortcut>⌘T</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                New Window <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem disabled>New Incognito Window</MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>Share</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>Email link</MenubarItem>
                  <MenubarItem>Messages</MenubarItem>
                  <MenubarItem>Notes</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator />
              <MenubarItem>
                Print... <MenubarShortcut>⌘P</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                Undo <MenubarShortcut>⌘Z</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>Find</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>Search the web</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Find...</MenubarItem>
                  <MenubarItem>Find Next</MenubarItem>
                  <MenubarItem>Find Previous</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator />
              <MenubarItem>Cut</MenubarItem>
              <MenubarItem>Copy</MenubarItem>
              <MenubarItem>Paste</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem
                checked={showBookmarks}
                onCheckedChange={setShowBookmarks}
              >
                Always Show Bookmarks Bar
              </MenubarCheckboxItem>
              <MenubarCheckboxItem
                checked={showFullUrls}
                onCheckedChange={setShowFullUrls}
              >
                Always Show Full URLs
              </MenubarCheckboxItem>
              <MenubarSeparator />
              <MenubarItem inset>
                Reload <MenubarShortcut>⌘R</MenubarShortcut>
              </MenubarItem>
              <MenubarItem disabled inset>
                Force Reload <MenubarShortcut>⇧⌘R</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem inset>Toggle Fullscreen</MenubarItem>
              <MenubarSeparator />
              <MenubarItem inset>Hide Sidebar</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Profiles</MenubarTrigger>
            <MenubarContent>
              <MenubarRadioGroup value={person} onValueChange={setPerson}>
                <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
                <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
                <MenubarRadioItem value="luis">Luis</MenubarRadioItem>
              </MenubarRadioGroup>
              <MenubarSeparator />
              <MenubarItem inset>Edit...</MenubarItem>
              <MenubarSeparator />
              <MenubarItem inset>Add Profile...</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </CodePreview>

      <CodePreview title="Text Editor Menubar" code={`// Code editor style menubar`}>
        <Menubar className="rounded-none border-b border-none px-2 lg:px-4">
          <MenubarMenu>
            <MenubarTrigger className="font-bold">Editor</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>About Editor</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>
                Preferences <MenubarShortcut>⌘,</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem>
                Hide Editor <MenubarShortcut>⌘H</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                Quit <MenubarShortcut>⌘Q</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                New File <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                Open File <MenubarShortcut>⌘O</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>Open Folder</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>
                Save <MenubarShortcut>⌘S</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>Save As...</MenubarItem>
              <MenubarItem>Save All</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Close File</MenubarItem>
              <MenubarItem>Close Folder</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Selection</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                Select All <MenubarShortcut>⌘A</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>Expand Selection</MenubarItem>
              <MenubarItem>Shrink Selection</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Copy Line Up</MenubarItem>
              <MenubarItem>Copy Line Down</MenubarItem>
              <MenubarItem>Move Line Up</MenubarItem>
              <MenubarItem>Move Line Down</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Go</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Back</MenubarItem>
              <MenubarItem>Forward</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>
                Go to File... <MenubarShortcut>⌘P</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                Go to Symbol... <MenubarShortcut>⌘⇧O</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                Go to Line... <MenubarShortcut>⌃G</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Run</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                Start Debugging <MenubarShortcut>F5</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>Run Without Debugging</MenubarItem>
              <MenubarItem>
                Stop Debugging <MenubarShortcut>⇧F5</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Toggle Breakpoint</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </CodePreview>

      <CodePreview title="Simple Navigation" code={`// Simple navigation menubar`}>
        <Menubar className="border-none bg-transparent">
          <MenubarMenu>
            <MenubarTrigger>Products</MenubarTrigger>
            <MenubarContent>
              <MenubarLabel>Categories</MenubarLabel>
              <MenubarItem>Electronics</MenubarItem>
              <MenubarItem>Clothing</MenubarItem>
              <MenubarItem>Books</MenubarItem>
              <MenubarItem>Home & Garden</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>All Products</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Solutions</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>For Startups</MenubarItem>
              <MenubarItem>For Enterprise</MenubarItem>
              <MenubarItem>For Developers</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Case Studies</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Resources</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Documentation</MenubarItem>
              <MenubarItem>API Reference</MenubarItem>
              <MenubarItem>Tutorials</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Community</MenubarItem>
              <MenubarItem>Blog</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Pricing</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Free Tier</MenubarItem>
              <MenubarItem>Pro Plan</MenubarItem>
              <MenubarItem>Enterprise</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Compare Plans</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </CodePreview>
    </div>
  );
}
