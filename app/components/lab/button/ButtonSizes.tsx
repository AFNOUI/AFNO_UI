"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/button/button-sizes";

export function ButtonSizes() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<div className="flex flex-wrap items-center gap-3">
  {data.map((item, index) => (
    <Button key={index} size={item.size}>{item.text}</Button>
  ))}
}</div>`;

  return (
    <ComponentInstall
      category="button"
      variant="button-sizes"
      title="Sizes"
      code={snippet}
      fullCode={code}
    >
      <div className="flex flex-wrap items-center gap-3">
        {data.map((item, index) => (
          <Button key={index} size={item.size}>{item.text}</Button>
        ))}
      </div>
    </ComponentInstall>
  );
}