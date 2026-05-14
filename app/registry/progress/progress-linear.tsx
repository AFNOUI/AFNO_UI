export const data = {
  initialProgress: 33,
  heights: [
    { value: 25, className: "h-1" },
    { value: 50, className: "h-2" },
    { value: 75, className: "h-3" },
    { value: 100, className: "h-4" },
  ],
};

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const data = ${dataStr};

export default function ProgressLinearExample() {
  const [progress, setProgress] = useState(data.initialProgress);

  return (
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
  );
}
`;
