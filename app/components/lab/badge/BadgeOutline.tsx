"use client";

import { Badge } from "@/components/ui/badge";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/badge/badge-outline";

export function BadgeOutline() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<div className="flex flex-wrap gap-3">
  {data.map((item, index) => (
    <Badge key={index} variant="outline">{item.text}</Badge>
  ))}
}</div>`;

  return (
    <ComponentInstall
      category="badge"
      variant="badge-outline"
      title="Outline Badge"
      code={snippet}
      fullCode={code}
    >
      <div className="flex flex-wrap gap-3">
        {data.map((item, index) => (
          <Badge key={index} variant="outline">{item.text}</Badge>
        ))}
      </div>
    </ComponentInstall>
  );
}
