export const data = [
  {
    title: "General Settings",
    icon: "Settings",
    items: [
      { label: "Language", value: "English" },
      { label: "Timezone", value: "UTC-5" },
      { label: "Date Format", value: "MM/DD/YYYY" },
    ],
  },
  {
    title: "Privacy Settings",
    icon: "Settings",
    items: [
      { label: "Profile Visibility", value: "Public" },
      { label: "Show Email", value: "Hidden" },
    ],
  },
];

export const code = `import React from "react";
import { Settings, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const data = ${JSON.stringify(data, null, 2)};

export default function CollapsibleSettingsExample() {
  return (
    <div className="max-w-md space-y-2">
      {data.map((section, index) => (
        <Collapsible key={index} defaultOpen={index === 0} className="border rounded-lg">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent/50">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="font-medium">{section.title}</span>
            </div>
            <ChevronDown className="h-4 w-4 transition-transform [[data-state=closed]>&]:-rotate-90" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              {section.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm">{item.label}</span>
                  <span className="text-sm text-muted-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
`;