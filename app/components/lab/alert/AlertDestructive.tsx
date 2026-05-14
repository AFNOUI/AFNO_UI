"use client";

import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/alert/alert-destructive";

export function AlertDestructive() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>{data.title}</AlertTitle>
  <AlertDescription>
    {data.description}
  </AlertDescription>
</Alert>`;

  return (
    <ComponentInstall
      category="alert"
      variant="alert-destructive"
      title="Destructive Alert"
      code={snippet}
      fullCode={code}
    >
      <div className="max-w-lg w-full">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{data.title}</AlertTitle>
          <AlertDescription>{data.description}</AlertDescription>
        </Alert>
      </div>
    </ComponentInstall>
  );
}
