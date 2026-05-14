"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/checkbox/checkbox-inline";

export function CheckboxInline() {
    const snippet = `const data = ${JSON.stringify(data, null, 2)};

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
</div>`;

    return (
        <ComponentInstall category="checkbox" variant="checkbox-inline" title="Inline Checkboxes" code={snippet} fullCode={code}>
            <div className="space-y-4">
                <Label className="text-base font-medium">Select features</Label>
                <div className="flex flex-wrap gap-4">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <Checkbox
                                id={`feature-${index}`}
                                defaultChecked={item.defaultChecked}
                            />
                            <Label htmlFor={`feature-${index}`} className="cursor-pointer text-sm">{item.text}</Label>
                        </div>
                    ))}
                </div>
            </div>
        </ComponentInstall>
    );
}