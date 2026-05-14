export const data = [
  {
    label: "Email notifications",
    description: "Receive email notifications when someone mentions you.",
    defaultChecked: false,
  },
  {
    label: "Push notifications",
    description: "Receive push notifications on your mobile device.",
    defaultChecked: true,
  },
  {
    label: "SMS notifications",
    description: "Receive important updates via SMS.",
    defaultChecked: false,
  },
];

export const code = `import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const data = ${JSON.stringify(data, null, 2)};

interface SettingItem {
  label: string;
  description: string;
  defaultChecked?: boolean;
}

export default function CheckboxWithDescriptionExample() {
  const [checkedStates, setCheckedStates] = useState<boolean[]>([true, false, false]);

  const handleCheckedChange = (index: number, checked: boolean) => {
    setCheckedStates(prev => {
      const newStates = [...prev];
      newStates[index] = checked;
      return newStates;
    });
  };

  return (
    <div className="space-y-4 max-w-md">
      {data.map((item, index) => (
        <div key={index} className="flex items-start space-x-3">
          <Checkbox
            id={\`desc-\${index}\`}
            checked={checkedStates[index]}
            onCheckedChange={(c) => handleCheckedChange(index, c as boolean)}
            className="mt-0.5"
          />
          <div className="space-y-0.5">
            <Label htmlFor={\`desc-\${index}\`} className="cursor-pointer font-medium leading-none">{item.label}</Label>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
`;