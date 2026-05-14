"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/button/button-variants";

export function ButtonVariants() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<div className="flex flex-wrap gap-3">
  {data.map((item, index) => (
    <Button key={index} variant={item.variant}>{item.text}</Button>
  ))}
}</div>`;

  return (
    <ComponentInstall
      category="button"
      variant="button-variants"
      title="Variants"
      code={snippet}
      fullCode={code}
    >
      <div className="flex flex-wrap gap-3">
        {data.map((item, index) => (
          <Button key={index} variant={item.variant}>{item.text}</Button>
        ))}
      </div>
    </ComponentInstall>
  );
}