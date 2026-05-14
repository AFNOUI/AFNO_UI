export const data = [
  {
    id: "terms",
    label: "I agree to",
    link: "Terms of Service",
    andLink: "Privacy Policy",
    checked: undefined,
    onChange: undefined,
    description: "I agree to the Terms of Service and Privacy Policy.",
  },
  {
    id: "marketing",
    label: "Send me promotional emails about new features and updates (optional)",
    checked: undefined,
    onChange: undefined,
    description: "Send me promotional emails about new features and updates (optional)",
  },
];

export const code = `import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const data = ${JSON.stringify(data, null, 2)};

export default function CheckboxFormAgreementExample() {
  const [terms, setTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);

  return (
    <div className="space-y-4 max-w-md p-4 border border-border rounded-lg">
      {data.map((item, index) => (
        <div key={index} className="flex items-start space-x-3">
          <Checkbox
            id={item.id}
            checked={item.id === "terms" ? terms : marketing}
            onCheckedChange={item.id === "terms" ? (c) => setTerms(c as boolean) : (c) => setMarketing(c as boolean)}
            className="mt-1"
          />
          <div>
            <Label htmlFor={item.id} className="cursor-pointer">
              {item.label}
              {item.link && " "}
              {item.link && <a href="#" className="text-primary underline hover:no-underline">{item.link}</a>}
              {item.andLink && " and "}
              {item.andLink && <a href="#" className="text-primary underline hover:no-underline">{item.andLink}</a>}
              {"."}
            </Label>
            {item.description && (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            )}
          </div>
        </div>
      ))}
      <Button disabled={!terms} className="w-full">Create Account</Button>
    </div>
  );
}
`;