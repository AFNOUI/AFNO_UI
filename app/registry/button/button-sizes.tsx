export const data = [
  { size: "sm" as const, text: "Small" },
  { size: "default" as const, text: "Default" },
  { size: "lg" as const, text: "Large" },
];

export const code = `import React from "react";
import { Button } from "@/components/ui/button";

const data = ${JSON.stringify(data, null, 2)} as const;

export default function ButtonSizesExample() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {data.map((item, index) => (
        <Button key={index} size={item.size}>{item.text}</Button>
      ))}
    </div>
  );
}`;
