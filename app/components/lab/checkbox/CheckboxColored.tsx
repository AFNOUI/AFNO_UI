"use client";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/checkbox/checkbox-colored";

export function CheckboxColored() {
    const snippet = `const data = ${JSON.stringify(data, null, 2)};

<div className="flex flex-wrap gap-4">
  {data.map((item, index) => (
    <div key={index} className="flex items-center space-x-2">
      <Checkbox
        id={\`color-\${index}\`}
        className={cn(
          "border",
          item.colorClass,
          "data-[state=checked]:",
          item.checkColorClass,
          item.textColorClass
        )}
      />
      <Label htmlFor={\`color-\${index}\`} className="cursor-pointer">{item.label}</Label>
    </div>
  ))}
</div>`;

    return (
        <ComponentInstall category="checkbox" variant="checkbox-colored" title="Colored Variants" code={snippet} fullCode={code}>
            <div className="flex flex-wrap gap-4">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                            id={`color-${index}`}
                            className={cn(
                                "border",
                                item.colorClass,
                                "data-[state=checked]:",
                                item.checkColorClass,
                                item.textColorClass
                            )}
                        />
                        <Label htmlFor={`color-${index}`} className="cursor-pointer">{item.label}</Label>
                    </div>
                ))}
            </div>
        </ComponentInstall>
    );
}