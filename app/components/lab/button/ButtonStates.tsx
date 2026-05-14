"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/button/button-states";

export function ButtonStates() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

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
}</div>`;

  return (
    <ComponentInstall
      category="button"
      variant="button-states"
      title="States"
      code={snippet}
      fullCode={code}
    >
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
    </ComponentInstall>
  );
}