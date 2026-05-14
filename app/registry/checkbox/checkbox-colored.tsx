export const data = [
  { label: "Primary", colorClass: "data-[state=checked]:bg-primary", checkColorClass: "data-[state=checked]:text-white", textColorClass: "" },
  { label: "Success", colorClass: "border-[hsl(var(--progress-success))] data-[state=checked]:bg-[hsl(var(--progress-success))] data-[state=checked]:text-white", checkColorClass: "data-[state=checked]:text-white", textColorClass: "" },
  { label: "Warning", colorClass: "border-[hsl(var(--progress-warning))] data-[state=checked]:bg-[hsl(var(--progress-warning))]", checkColorClass: "data-[state=checked]:text-foreground", textColorClass: "" },
  { label: "Error", colorClass: "border-destructive data-[state=checked]:bg-destructive", checkColorClass: "data-[state=checked]:text-white", textColorClass: "" },
];

export const code = `import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export default function CheckboxColoredExample() {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="color-0"
          className={cn(
            "border",
            "data-[state=checked]:bg-primary",
            "data-[state=checked]:text-white",
          )}
        />
        <Label htmlFor="color-0" className="cursor-pointer">Primary</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="color-1"
          className={cn(
            "border",
            "border-[hsl(var(--progress-success))]",
            "data-[state=checked]:bg-[hsl(var(--progress-success))]",
            "data-[state=checked]:text-white",
          )}
        />
        <Label htmlFor="color-1" className="cursor-pointer">Success</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="color-2"
          className={cn(
            "border",
            "border-[hsl(var(--progress-warning))]",
            "data-[state=checked]:bg-[hsl(var(--progress-warning))]",
            "data-[state=checked]:text-foreground",
          )}
        />
        <Label htmlFor="color-2" className="cursor-pointer">Warning</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="color-3"
          className={cn(
            "border",
            "border-destructive",
            "data-[state=checked]:bg-destructive",
            "data-[state=checked]:text-white",
          )}
        />
        <Label htmlFor="color-3" className="cursor-pointer">Error</Label>
      </div>
    </div>
  );
}
`;