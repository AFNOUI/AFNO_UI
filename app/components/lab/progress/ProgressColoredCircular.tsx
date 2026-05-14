"use client";

import { useState, useEffect } from "react";
import { CircularProgress } from "./progress-shared";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/progress/progress-colored-circular";

export function ProgressColoredCircular() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setValue(75), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <ComponentInstall
      category="progress"
      variant="progress-colored-circular"
      title="Colored Circular Progress"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n<CircularProgress value={value} variant={item.variant} />`}
      fullCode={code}
    >
      <div className="flex flex-wrap gap-8 items-center justify-center py-4">
        {data.map((item) => (
          <div key={item.variant} className="text-center space-y-2">
            <CircularProgress value={value} size={80} variant={item.variant} />
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </ComponentInstall>
  );
}
