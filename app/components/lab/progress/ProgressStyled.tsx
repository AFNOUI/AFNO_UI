"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { GradientProgress, StripedProgress, SegmentedProgress } from "./progress-shared";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/progress/progress-styled";

export function ProgressStyled() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setValue(75), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <ComponentInstall
      category="progress"
      variant="progress-styled"
      title="Styled Progress Bars"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n<GradientProgress /> <StripedProgress /> <SegmentedProgress />`}
      fullCode={code}
    >
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
    </ComponentInstall>
  );
}
