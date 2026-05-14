
export const data = [
  { icon: "Mail", text: "Login with Email", variant: "default" as const },
  { variant: "outline" as const, icon: "Settings", text: "Settings" },
] as const;

export const code = `import React from "react";
import { Mail, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const data = ${JSON.stringify(data, null, 2)} as const;

export default function ButtonWithIconsExample() {
  return (
    <div className="flex flex-wrap gap-3">
      {data.map((item, index) => (
        <Button key={index} variant={item.variant}>
          {item.icon === "Mail" && <Mail className="me-2 h-4 w-4" />}
          {item.icon === "Settings" && <Settings className="me-2 h-4 w-4" />}
          {item.text}
        </Button>
      ))}
    </div>
  );
}`;
