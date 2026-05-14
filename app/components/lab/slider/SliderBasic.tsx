"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/slider/slider-basic";

export function SliderBasic() {
  return (
    <ComponentInstall
      category="slider"
      variant="slider-basic"
      title="Slider Component"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n<Slider defaultValue={...} max={100} />`}
      fullCode={code}
    >
      <div className="space-y-6 max-w-sm">
        {data.map((item, i) => (
          <div key={i} className="space-y-2">
            <Label>{item.label}</Label>
            <Slider
              defaultValue={item.defaultValue}
              max={item.max}
              step={item.step}
            />
          </div>
        ))}
      </div>
    </ComponentInstall>
  );
}
