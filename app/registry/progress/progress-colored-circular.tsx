export const data = [
  { variant: "primary" as const, label: "Primary" },
  { variant: "success" as const, label: "Success" },
  { variant: "warning" as const, label: "Warning" },
  { variant: "error" as const, label: "Error" },
];

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { useState, useEffect } from "react";
import { CircularProgress } from "@/components/lab/progress/progress-shared";

type ProgressVariant = "primary" | "success" | "warning" | "error";

const data: { variant: ProgressVariant; label: string }[] = ${dataStr};

export default function ProgressColoredCircularExample() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setValue(75), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-wrap gap-8 items-center justify-center py-4">
      {data.map((item) => (
        <div key={item.variant} className="text-center space-y-2">
          <CircularProgress value={value} size={80} variant={item.variant} />
          <p className="text-xs text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
`;
