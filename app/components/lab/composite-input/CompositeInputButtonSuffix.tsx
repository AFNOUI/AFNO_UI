"use client";

import { useState } from "react";
import { Link, Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/composite-input/composite-input-button-suffix";

export function CompositeInputButtonSuffix() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const snippet = `const data = ${JSON.stringify(data, null, 2)};

const [copied, setCopied] = useState(false);

const handleCopy = () => {
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};

<div className="space-y-4">
  <div className="max-w-md space-y-2">
    <Label>Invite Link</Label>
    <div className="flex">
      <div className="relative flex-1">
        <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input readOnly value={data.inviteLink} className="pl-10 rounded-r-none" />
      </div>
      <Button variant="secondary" className="rounded-l-none" onClick={handleCopy}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  </div>
</div>`;

  return (
    <ComponentInstall category="composite-input" variant="composite-input-button-suffix" title="Input with Button Suffix" code={snippet} fullCode={code}>
      <div className="space-y-4">
        <div className="max-w-md space-y-2">
          <Label>Invite Link</Label>
          <div className="flex">
            <div className="relative flex-1">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                readOnly
                value={data.inviteLink}
                className="pl-10 rounded-r-none"
              />
            </div>
            <Button
              variant="secondary"
              className="rounded-l-none"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </ComponentInstall>
  );
}