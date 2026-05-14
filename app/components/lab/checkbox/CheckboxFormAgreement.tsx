"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/checkbox/checkbox-form-agreement";

export function CheckboxFormAgreement() {
    const [terms, setTerms] = useState(false);
    const [marketing, setMarketing] = useState(false);

    const snippet = `const [terms, setTerms] = useState(false);
const [marketing, setMarketing] = useState(false);

const data = ${JSON.stringify(data, null, 2)};

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
</div>`;

    return (
        <ComponentInstall category="checkbox" variant="checkbox-form-agreement" title="Form Agreement" code={snippet} fullCode={code}>
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
        </ComponentInstall>
    );
}