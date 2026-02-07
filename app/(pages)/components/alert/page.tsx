"use client";

// import { useTranslation } from "react-i18next";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import CodePreview from "@/components/lab/CodePreview";
import { SectionTitle } from "@/components/lab/SectionTitle";
import { AlertCircle, Info } from "lucide-react";

export default function AlertPage() {
  // const { t } = useTranslation();

  const alertCode = `import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
  import { Info, AlertCircle } from "lucide-react";
  
  <Alert>
    <Info className="h-4 w-4" />
    <AlertTitle>Heads up!</AlertTitle>
    <AlertDescription>
      You can add components to your app using the cli.
    </AlertDescription>
  </Alert>
  
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>
      Your session has expired. Please log in again.
    </AlertDescription>
  </Alert>`;

  return (
    <div className="space-y-6">
      <SectionTitle>Alerts</SectionTitle>

      <CodePreview title="Alert Variants" code={alertCode}>
        <div className="space-y-4 max-w-lg">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>You can add components to your app using the cli.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
          </Alert>
        </div>
      </CodePreview>
    </div>
  );
}
