export const data = {
  initialExpandedFolders: { src: true, components: false },
  componentFiles: ["Button.tsx", "Card.tsx", "Input.tsx"],
  rootFiles: ["App.tsx", "main.tsx"],
};

export const code = `import React, { useState } from "react";
import { ChevronDown, ChevronRight, Folder, File } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const data = ${JSON.stringify(data, null, 2)};

export default function CollapsibleFileTreeExample() {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(data.initialExpandedFolders);

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folder]: !prev[folder]
    }));
  };

  return (
    <div className="max-w-xs rounded-md border p-2 bg-card">
      <Collapsible open={expandedFolders.src} onOpenChange={() => toggleFolder('src')}>
        <CollapsibleTrigger className="flex items-center gap-1 w-full p-1 hover:bg-accent rounded text-sm">
          {expandedFolders.src ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <Folder className="h-4 w-4 text-primary" />
          <span>src</span>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4">
          <Collapsible open={expandedFolders.components} onOpenChange={() => toggleFolder('components')}>
            <CollapsibleTrigger className="flex items-center gap-1 w-full p-1 hover:bg-accent rounded text-sm">
              {expandedFolders.components ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Folder className="h-4 w-4 text-primary" />
              <span>components</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 space-y-1">
              {data.componentFiles.map(file => (
                <div key={file} className="flex items-center gap-1 p-1 hover:bg-accent rounded text-sm cursor-pointer">
                  <span className="w-4" />
                  <File className="h-4 w-4 text-muted-foreground" />
                  <span>{file}</span>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
          {data.rootFiles.map(file => (
            <div key={file} className="flex items-center gap-1 p-1 hover:bg-accent rounded text-sm cursor-pointer">
              <span className="w-4" />
              <File className="h-4 w-4 text-muted-foreground" />
              <span>{file}</span>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
`;