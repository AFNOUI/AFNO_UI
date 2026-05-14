"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/checkbox/checkbox-with-description";

export function CheckboxWithDescription() {
  const [checkedStates, setCheckedStates] = useState<boolean[]>([true, false, false]);

  const handleCheckedChange = (index: number, checked: boolean) => {
    setCheckedStates(prev => {
      const newStates = [...prev];
      newStates[index] = checked;
      return newStates;
    });
  };

  const snippet = `const [checkedStates, setCheckedStates] = useState<boolean[]>([true, false, false]);

const data = ${JSON.stringify(data,null, 2)};

const handleCheckedChange = (index: number, checked: boolean) => {
  setCheckedStates(prev => {
    const newStates = [...prev];
    newStates[index] = checked;
    return newStates;
  });
};

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
</div>`;

  return (
    <ComponentInstall category="checkbox" variant="checkbox-with-description" title="With Description" code={snippet} fullCode={code}>
      <div className="space-y-4 max-w-md">
        {data.map((item, index) => (
          <div key={index} className="flex items-start space-x-3">
            <Checkbox
              className="mt-0.5"
              id={`desc-${index}`}
              checked={checkedStates[index]}
              defaultChecked={item.defaultChecked}
              onCheckedChange={(c) => handleCheckedChange(index, c as boolean)}
            />
            <div className="space-y-0.5">
              <Label htmlFor={`desc-${index}`} className="cursor-pointer font-medium leading-none">{item.label}</Label>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </ComponentInstall>
  );
}