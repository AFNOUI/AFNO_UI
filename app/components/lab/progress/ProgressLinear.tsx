"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/progress/progress-linear";

export function ProgressLinear() {
  const [progress, setProgress] = useState(data.initialProgress);

  return (
    <ComponentInstall
      category="progress"
      variant="progress-linear"
      title="Linear Progress"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n<Progress value={progress} />`}
      fullCode={code}
    >
      <div className="space-y-6 max-w-md">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Loading...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="space-y-2">
          <Label>Different Heights</Label>
          {data.heights.map((h) => (
            <Progress key={h.className} value={h.value} className={h.className} />
          ))}
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setProgress(Math.max(0, progress - 10))}>
            - 10%
          </Button>
          <Button size="sm" variant="outline" onClick={() => setProgress(Math.min(100, progress + 10))}>
            + 10%
          </Button>
          <Button size="sm" variant="outline" onClick={() => setProgress(0)}>
            Reset
          </Button>
        </div>
      </div>
    </ComponentInstall>
  );
}
