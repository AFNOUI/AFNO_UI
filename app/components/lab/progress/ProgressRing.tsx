"use client";

import { useState, useEffect } from "react";
import { RingProgress } from "./progress-shared";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/progress/progress-ring";

export function ProgressRing() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setValue(75), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <ComponentInstall
      category="progress"
      variant="progress-ring"
      title="Ring/Donut Progress"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n<RingProgress value={value} size={item.size} />`}
      fullCode={code}
    >
      <div className="flex flex-wrap gap-12 items-center justify-center py-4">
        {data.map((item, i) => (
          <RingProgress
            key={i}
            value={item.value ?? value}
            size={item.size}
            thickness={item.thickness}
          />
        ))}
      </div>
    </ComponentInstall>
  );
}
