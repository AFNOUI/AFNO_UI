export const data = [
  { text: "Dark Mode", defaultChecked: true },
  { text: "Animations", defaultChecked: true },
  { text: "Sounds", defaultChecked: false },
  { text: "Haptic Feedback", defaultChecked: false },
];

export const code = `import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const data = ${JSON.stringify(data, null, 2)};

export default function CheckboxInlineExample() {
  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Select features</Label>
      <div className="flex flex-wrap gap-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Checkbox
              id={\`feature-\${index}\`}
              defaultChecked={item.defaultChecked}
            />
            <Label htmlFor={\`feature-\${index}\`} className="cursor-pointer text-sm">{item.text}</Label>
          </div>
        ))}
      </div>
    </div>
  );
}
`;