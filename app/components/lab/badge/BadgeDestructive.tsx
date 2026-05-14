"use client";

import { Badge } from "@/components/ui/badge";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/badge/badge-destructive";

export function BadgeDestructive() {

  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<div className="flex flex-wrap gap-3">
  {data.map((item, index) => (
    <Badge key={index} variant="destructive">{item.text}</Badge>
  ))}
}</div>`;

  return (
    <ComponentInstall
      category="badge"
      variant="badge-destructive"
      title="Destructive Badge"
      code={snippet}
      fullCode={code}
    >
      <div className="flex flex-wrap gap-3">
        {data.map((item, index) => (
          <Badge key={index} variant="destructive">{item.text}</Badge>
        ))}
      </div>
    </ComponentInstall>
  );
}
