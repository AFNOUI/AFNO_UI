export const data = {
  domainSuffix: ".example.com",
  placeholder: "mysite",
  descriptionTemplate: "Your site will be available at {subdomain}.example.com",
};

export const code = `import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const data = ${JSON.stringify(data, null, 2)};

export default function CompositeInputDomainExample() {
  return (
    <div className="max-w-md space-y-2">
      <Label>Subdomain</Label>
      <div className="flex items-center">
        <Input
          placeholder={data.placeholder}
          className="rounded-r-none"
        />
        <span className="inline-flex items-center px-3 h-10 border border-l-0 rounded-r-md bg-muted text-muted-foreground text-sm">
          {data.domainSuffix}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        Your site will be available at mysite.example.com
      </p>
    </div>
  );
}
`;