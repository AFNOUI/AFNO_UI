"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/composite-input/composite-input-domain";

export function CompositeInputDomain() {
    const snippet = `const data = ${JSON.stringify(data, null, 2)};

<div className="max-w-md space-y-2">
  <Label>Subdomain</Label>
  <div className="flex items-center">
    <Input placeholder={data.placeholder} className="rounded-r-none" />
    <span className="inline-flex items-center px-3 h-10 border border-l-0 rounded-r-md bg-muted text-muted-foreground text-sm">
      {data.domainSuffix}
    </span>
  </div>
  <p className="text-sm text-muted-foreground">
    Your site will be available at mysite.example.com
  </p>
</div>`;

    return (
        <ComponentInstall category="composite-input" variant="composite-input-domain" title="Domain Input" code={snippet} fullCode={code}>
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
        </ComponentInstall>
    );
}