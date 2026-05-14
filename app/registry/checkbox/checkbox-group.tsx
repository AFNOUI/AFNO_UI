export const data = [
  "Technology", "Design", "Business", "Marketing",
  "Development", "Analytics", "Product", "AI/ML"
];

export const code = `import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function CheckboxGroupExample() {
  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Select your interests</Label>
      <div className="grid grid-cols-2 gap-3">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Checkbox id={\`interest-\${index}\`} />
            <Label htmlFor={\`interest-\${index}\`} className="cursor-pointer text-sm">Interest</Label>
          </div>
        ))}
      </div>
    </div>
  );
}
`;