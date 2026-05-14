export const data = [
  { value: 25, size: 60, label: "Small" },
  { value: 50, size: 80, label: "Medium" },
  { value: 75, size: 100, label: "Large" },
  { value: 100, size: 100, label: "Complete", variant: "success" as const },
];

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { CircularProgress } from "@/components/lab/progress/progress-shared";

type ProgressVariant = "primary" | "success" | "warning" | "error";

const data: { value: number; size: number; label: string; variant?: ProgressVariant }[] = ${dataStr};

export default function ProgressCircularExample() {
  return (
    <div className="flex flex-wrap gap-8 items-center justify-center py-4">
      {data.map((item) => (
        <div key={item.label} className="text-center space-y-2">
          <CircularProgress
            value={item.value}
            size={item.size}
            variant={item.variant || "primary"}
          />
          <p className="text-xs text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
`;
