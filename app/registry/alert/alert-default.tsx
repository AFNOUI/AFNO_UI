
export const data = {
  title: "Heads up!",
  description: "You can add components to your app using the cli.",
};

export const code = `import React from "react";
import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const data = ${JSON.stringify(data, null, 2)};

export default function AlertDefaultExample() {
  return (
    <div className="flex justify-center p-8 w-full">
      <Alert className="max-w-lg">
        <Info className="h-4 w-4" />
        <AlertTitle>{data.title}</AlertTitle>
        <AlertDescription>
          {data.description}
        </AlertDescription>
      </Alert>
    </div>
  );
}`;
