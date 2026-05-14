export const data = {
  contextItem: {
    icon: "FileText",
    name: "Document.pdf",
    size: "2.4 MB",
    modified: "Modified 2 hours ago",
  },
  menuItems: [
    { icon: "Eye", label: "Preview" },
    { icon: "Download", label: "Download" },
    { icon: "Share2", label: "Share" },
    { icon: "Star", label: "Add to Favorites" },
    { icon: "Edit", label: "Rename" },
    { icon: "Trash2", label: "Delete", destructive: true },
  ],
};

export const code = `import React from "react";
import { FileText, MoreHorizontal, Eye, Download, Share2, Star, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const data = ${JSON.stringify(data, null, 2)};

export default function DropdownContextActionsExample() {
  const icons = { FileText, Eye, Download, Share2, Star, Edit, Trash2 };
  return (
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
  );
}
`;
