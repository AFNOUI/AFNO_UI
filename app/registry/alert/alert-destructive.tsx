
export const data = {
  title: "Error",
  description: "Your session has expired. Please log in again.",
};

export const code = `import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const data = ${JSON.stringify(data, null, 2)};

export default function AlertDestructiveExample() {
  return (
    <div className="flex justify-center p-8 w-full">
      <Alert variant="destructive" className="max-w-lg">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{data.title}</AlertTitle>
        <AlertDescription>
          {data.description}
        </AlertDescription>
      </Alert>
    </div>
  );
}`;
