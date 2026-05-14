
export const data = [
  { state: "disabled", text: "Disabled" },
  { state: "loading", text: "Loading", className: "animate-pulse" },
];

export const code = `import React from "react";
import { Button } from "@/components/ui/button";

const data = ${JSON.stringify(data, null, 2)};

export default function ButtonStatesExample() {
  return (
    <div className="flex flex-wrap gap-3">
      {data.map((item, index) => (
        <Button 
          key={index} 
          disabled={item.state === "disabled"}
          className={item.className}
        >
          {item.text}
        </Button>
      ))}
    </div>
  );
}`;
