export const data = [
  { size: 100, thickness: 10 },
  { size: 120, thickness: 14 },
  { size: 100, thickness: 10, value: 100 },
];

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { useState, useEffect } from "react";
import { RingProgress } from "@/components/ui/progress-shared";

const data = ${dataStr};

export default function ProgressRingExample() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setValue(75), 500);
    return () => clearTimeout(t);
  }, []);

  return (
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
  );
}
`;
