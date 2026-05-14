"use client";

import { CircularProgress } from "./progress-shared";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/progress/progress-circular";

export function ProgressCircular() {
  return (
    <ComponentInstall
      category="progress"
      variant="progress-circular"
      title="Circular Progress"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n<CircularProgress value={item.value} size={item.size} />`}
      fullCode={code}
    >
      <div className="flex flex-wrap gap-8 items-center justify-center py-4">
        {data.map((item) => (
          <div key={item.label} className="text-center space-y-2">
            <CircularProgress
              value={item.value}
              size={item.size}
              variant={item.variant ?? "primary"}
            />
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </ComponentInstall>
  );
}
