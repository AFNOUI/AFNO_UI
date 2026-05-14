"use client";

import { Info } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/alert/alert-default";

export function AlertDefault() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>{data.title}</AlertTitle>
  <AlertDescription>
    {data.description}
  </AlertDescription>
</Alert>`;

  return (
    <ComponentInstall
      category="alert"
      variant="alert-default"
      title="Default Alert"
      code={snippet}
      fullCode={code}
    >
      <div className="max-w-lg w-full">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>{data.title}</AlertTitle>
          <AlertDescription>{data.description}</AlertDescription>
        </Alert>
      </div>
    </ComponentInstall>
  );
}
