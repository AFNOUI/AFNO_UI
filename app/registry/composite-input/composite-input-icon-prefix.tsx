export const data = [
  { id: "search", icon: "Search", label: "Search", placeholder: "Search..." },
  { id: "email", icon: "Mail", label: "Email", placeholder: "you@example.com", type: "email" },
  { id: "website", icon: "Globe", label: "Website", placeholder: "www.example.com" },
];

export const code = `import React from "react";
import { Search, Mail, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const data = ${JSON.stringify(data, null, 2)};

export default function CompositeInputIconPrefixExample() {
  const icons = {
    Search,
    Mail,
    Globe,
  };

  return (
    <div className="max-w-sm space-y-4">
      {data.map((item) => {
        const Icon = icons[item.icon as keyof typeof icons];
        return (
          <div key={item.id} className="space-y-2">
            <Label>{item.label}</Label>
            <div className="relative">
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={item.type || "text"}
                placeholder={item.placeholder}
                className="pl-10"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
`;