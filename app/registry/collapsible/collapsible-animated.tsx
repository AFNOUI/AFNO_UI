export const data = [
  { action: "Logged in", time: "2 minutes ago" },
  { action: "Updated profile", time: "1 hour ago" },
  { action: "Created new project", time: "3 hours ago" },
  { action: "Invited team member", time: "1 day ago" },
];

export const code = `import React from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = ${JSON.stringify(data, null, 2)};

export default function CollapsibleAnimatedExample() {
  return (
    <div className="max-w-md">
      <Card>
        <Collapsible defaultOpen>
          <CardHeader className="pb-2">
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <CardTitle className="text-base">Activity Log</CardTitle>
              <ChevronDown className="h-4 w-4 transition-transform duration-200 [[data-state=closed]>&]:-rotate-90" />
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
            <CardContent className="pt-0">
              <div className="space-y-3">
                {data.map((log, index) => (
                  <div key={index} className="flex justify-between text-sm border-b pb-2 last:border-0">
                    <span>{log.action}</span>
                    <span className="text-muted-foreground">{log.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}
`;