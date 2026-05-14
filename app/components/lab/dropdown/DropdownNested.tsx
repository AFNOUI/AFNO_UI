"use client";

import React from "react";
import { Edit, Copy, Share2, Download, Mail, MessageSquare, FileText, Archive, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/dropdown/dropdown-nested";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  Edit,
  Copy,
  Share2,
  Download,
  Mail,
  MessageSquare,
  FileText,
  Archive,
  Trash2,
};

export function DropdownNested() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">{data.triggerText}</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    ...mainItems, submenus (Share, Export), footerItems
  </DropdownMenuContent>
</DropdownMenu>`;

  return (
    <ComponentInstall category="dropdown" variant="dropdown-nested" title="Nested Submenu" code={snippet} fullCode={code}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">{data.triggerText}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup>
            {data.mainItems.map((item, i) => {
              const Icon = icons[item.icon as keyof typeof icons];
              return (
                <DropdownMenuItem key={i}>
                  {Icon && <Icon className="me-2 h-4 w-4" />}
                  {item.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {data.submenus.map((sub, i) => {
            const SubIcon = icons[sub.icon as keyof typeof icons];
            return (
              <DropdownMenuSub key={i}>
                <DropdownMenuSubTrigger>
                  {SubIcon && <SubIcon className="me-2 h-4 w-4" />}
                  {sub.label}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                  {sub.items.map((item, j) => {
                    const Icon = icons[item.icon as keyof typeof icons];
                    return (
                      <DropdownMenuItem key={j}>
                        {Icon && <Icon className="me-2 h-4 w-4" />}
                        {item.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            );
          })}
          <DropdownMenuSeparator />
          {data.footerItems.map((item, i) => {
            const Icon = icons[item.icon as keyof typeof icons];
            return (
              <DropdownMenuItem key={i} className={item.destructive ? "text-destructive" : ""}>
                {Icon && <Icon className="me-2 h-4 w-4" />}
                {item.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </ComponentInstall>
  );
}
