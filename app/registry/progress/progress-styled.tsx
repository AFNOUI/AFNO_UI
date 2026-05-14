export const data = [
  { type: "gradient" as const, label: "Gradient" },
  { type: "striped" as const, label: "Striped (Animated)", animated: true },
  { type: "segmented" as const, label: "Segmented (5)", segments: 5 },
  { type: "segmented" as const, label: "Segmented (10)", segments: 10 },
];

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { GradientProgress, StripedProgress, SegmentedProgress } from "@/components/lab/progress/progress-shared";

const data = ${dataStr};

export default function ProgressStyledExample() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setValue(75), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6 max-w-md">
      {data.map((item) => (
        <div key={item.label} className="space-y-2">
          <Label>{item.label}</Label>
          {item.type === "gradient" && <GradientProgress value={value} />}
          {item.type === "striped" && <StripedProgress value={value} animated={item.animated} />}
          {item.type === "segmented" && (
            <SegmentedProgress value={value} segments={item.segments} />
          )}
        </div>
      ))}
    </div>
  );
}
`;
