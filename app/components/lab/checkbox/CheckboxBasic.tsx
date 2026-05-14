"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/checkbox/checkbox-basic";

export function CheckboxBasic() {
    const [checkedStates, setCheckedStates] = useState<Record<string, boolean>>({
        "basic": false,
        "checked": true,
    });

    const handleCheckedChange = (id: string, checked: boolean) => {
        setCheckedStates(prev => ({ ...prev, [id]: checked }));
    };

    const snippet = `const [checkedStates, setCheckedStates] = useState<Record<string, boolean>>({
  "basic": false,
  "checked": true,
});

const data = ${JSON.stringify(data, null, 2)};

const handleCheckedChange = (id: string, checked: boolean) => {
  setCheckedStates(prev => ({ ...prev, [id]: checked }));
};

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
</div>`;

    return (
        <ComponentInstall category="checkbox" variant="checkbox-basic" title="Basic Checkbox" code={snippet} fullCode={code}>
            <div className="space-y-4">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                            id={item.id}
                            disabled={item.disabled}
                            checked={item.checked !== undefined ? item.checked : checkedStates[item.id]}
                            onCheckedChange={item.checked === undefined && !item.disabled ? (c) => handleCheckedChange(item.id, c as boolean) : undefined}
                        />
                        <Label htmlFor={item.id} className={item.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}>
                            {item.label}
                        </Label>
                    </div>
                ))}
            </div>
        </ComponentInstall>
    );
}