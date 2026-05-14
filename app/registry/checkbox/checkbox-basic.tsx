export const data = [
  { id: "basic", label: "Accept terms and conditions", checked: undefined },
  { id: "checked", label: "Checked by default", checked: true },
  { id: "disabled", label: "Disabled checkbox", disabled: true, checked: undefined },
  { id: "disabled-checked", label: "Disabled checked", disabled: true, checked: true },
];

export const code = `import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const data = ${JSON.stringify(data, null, 2)};

interface CheckboxItem {
  id: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
}

export default function CheckboxBasicExample() {
  const [checkedStates, setCheckedStates] = useState<Record<string, boolean>>({
    "basic": false,
    "checked": true,
  });

  const handleCheckedChange = (id: string, checked: boolean) => {
    setCheckedStates(prev => ({ ...prev, [id]: checked }));
  };

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Checkbox
            id={item.id}
            checked={item.checked !== undefined ? item.checked : checkedStates[item.id]}
            onCheckedChange={item.checked === undefined && !item.disabled ? (c) => handleCheckedChange(item.id, c as boolean) : undefined}
            disabled={item.disabled}
          />
          <Label htmlFor={item.id} className={item.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}>
            {item.label}
          </Label>
        </div>
      ))}
    </div>
  );
}
`;