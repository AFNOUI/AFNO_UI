export const data = [
  { label: "Volume", defaultValue: [50], max: 100, step: 1 },
  { label: "Price Range", defaultValue: [25, 75], max: 100, step: 1 },
];

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const data = ${dataStr};

export default function SliderBasicExample() {
  return (
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
  );
}
`;
