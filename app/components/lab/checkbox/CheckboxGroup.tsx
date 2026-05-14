"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/checkbox/checkbox-group";

export function CheckboxGroup() {
    const snippet = `const interests = ${JSON.stringify(data, null, 2)};

<Label className="text-base font-medium">Select your interests</Label>
<div className="grid grid-cols-2 gap-3">
  {interests.map((interest, index) => (
    <div key={index} className="flex items-center space-x-2">
      <Checkbox id={\`interest-\${index}\`} />
      <Label htmlFor={\`interest-\${index}\`} className="cursor-pointer text-sm">{interest}</Label>
    </div>
  ))}
</div>`;

    return (
        <ComponentInstall category="checkbox" variant="checkbox-group" title="Checkbox Group (Multi-select)" code={snippet} fullCode={code}>
            <div className="space-y-4">
                <Label className="text-base font-medium">Select your interests</Label>
                <div className="grid grid-cols-2 gap-3">
                    {data.map((interest, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <Checkbox id={`interest-${index}`} />
                            <Label htmlFor={`interest-${index}`} className="cursor-pointer text-sm">{interest}</Label>
                        </div>
                    ))}
                </div>
            </div>
        </ComponentInstall>
    );
}