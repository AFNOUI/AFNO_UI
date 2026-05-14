
export const data = [
  { text: "Destructive" },
];

export const code = `import React from "react";
import { Badge } from "@/components/ui/badge";

const data = ${JSON.stringify(data, null, 2)};

export default function BadgeDestructiveExample() {
  return (
    <div className="flex flex-wrap gap-3">
      {data.map((item, index) => (
        <Badge key={index} variant="destructive">{item.text}</Badge>
      ))}
    </div>
  );
}`;
