"use client";

import React from "react";
import { Mail, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/button/button-with-icons";

export function ButtonWithIcons() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<div className="flex flex-wrap gap-3">
  {data.map((item, index) => (
    <Button key={index} variant={item.variant}>
      {item.icon === "Mail" && <Mail className="me-2 h-4 w-4" />}
      {item.icon === "Settings" && <Settings className="me-2 h-4 w-4" />}
      {item.text}
    </Button>
  ))}
}</div>`;

  return (
    <ComponentInstall
      category="button"
      variant="button-with-icons"
      title="With Icons"
      code={snippet}
      fullCode={code}
    >
      <div className="flex flex-wrap gap-3">
        {data.map((item, index) => (
          <Button key={index} variant={item.variant}>
            {item.icon === "Mail" && <Mail className="me-2 h-4 w-4" />}
            {item.icon === "Settings" && <Settings className="me-2 h-4 w-4" />}
            {item.text}
          </Button>
        ))}
      </div>
    </ComponentInstall>
  );
}