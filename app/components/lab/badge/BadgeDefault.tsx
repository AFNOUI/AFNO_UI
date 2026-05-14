"use client";

import { code, data } from "@/registry/badge/badge-default";

import { Badge } from "@/components/ui/badge";
import { ComponentInstall } from "@/components/lab/ComponentInstall";

export function BadgeDefault() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<div className="flex flex-wrap gap-3">
  {data.map((item, index) => (
    <Badge key={index}>{item.text}</Badge>
  ))}
}</div>`;

  return (
    <ComponentInstall
      category="badge"
      variant="badge-default"
      title="Default Badge"
      code={snippet}
      fullCode={code}
    >
      <div className="flex flex-wrap gap-3">
        {data.map((item, index) => (
          <Badge key={index}>{item.text}</Badge>
        ))}
      </div>
    </ComponentInstall>
  );
}
