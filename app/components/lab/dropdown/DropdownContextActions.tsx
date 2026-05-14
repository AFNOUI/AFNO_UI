"use client";

import React from "react";
import { FileText, MoreHorizontal, Eye, Download, Share2, Star, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/dropdown/dropdown-context-actions";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Eye,
  Download,
  Share2,
  Star,
  Edit,
  Trash2,
};

export function DropdownContextActions() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<div className="flex items-center gap-4 p-4 border rounded-lg">
  <FileText className="h-8 w-8" />
  <div className="flex-1">
    <p className="font-medium">{data.contextItem.name}</p>
    <p className="text-xs text-muted-foreground">{data.contextItem.size}</p>
  </div>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {data.menuItems.map((item) => (
        <DropdownMenuItem key={item.label} className={item.destructive ? "text-destructive" : ""}>
          {item.label}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
</div>`;

  return (
    <ComponentInstall category="dropdown" variant="dropdown-context-actions" title="Context Actions" code={snippet} fullCode={code}>
      <div className="flex items-center gap-4 p-4 border border-border rounded-lg max-w-sm bg-card">
        <FileText className="h-8 w-8 text-primary" />
        <div className="flex-1">
          <p className="font-medium text-sm">{data.contextItem.name}</p>
          <p className="text-xs text-muted-foreground">{data.contextItem.size} • {data.contextItem.modified}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {data.menuItems.map((item, i) => {
              const Icon = icons[item.icon as keyof typeof icons];
              return (
                <React.Fragment key={i}>
                  {item.destructive && i > 0 ? <DropdownMenuSeparator /> : null}
                  <DropdownMenuItem className={item.destructive ? "text-destructive" : ""}>
                    {Icon && <Icon className="me-2 h-4 w-4" />}
                    {item.label}
                  </DropdownMenuItem>
                </React.Fragment>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </ComponentInstall>
  );
}
