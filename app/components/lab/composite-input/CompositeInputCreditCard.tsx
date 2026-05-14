"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/composite-input/composite-input-credit-card";

export function CompositeInputCreditCard() {
    const snippet = `const data = ${JSON.stringify(data, null, 2)};

<div className="max-w-sm space-y-2">
  <Label>Card Number</Label>
  <div className="relative">
    <Input placeholder={data.cardPlaceholder} className="pr-16" />
    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
      <span className="text-lg">{data.cardIcon}</span>
    </div>
  </div>
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label>Expiry</Label>
      <Input placeholder={data.expiryPlaceholder} />
    </div>
    <div className="space-y-2">
      <Label>CVC</Label>
      <Input placeholder={data.cvcPlaceholder} maxLength={data.cvcMaxLength} />
    </div>
  </div>
</div>`;

    return (
        <ComponentInstall category="composite-input" variant="composite-input-credit-card" title="Credit Card Input" code={snippet} fullCode={code}>
            <div className="max-w-sm space-y-2">
                <Label>Card Number</Label>
                <div className="relative">
                    <Input
                        placeholder={data.cardPlaceholder}
                        className="pr-16"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                        <span className="text-lg">{data.cardIcon}</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Expiry</Label>
                        <Input placeholder={data.expiryPlaceholder} />
                    </div>
                    <div className="space-y-2">
                        <Label>CVC</Label>
                        <Input placeholder={data.cvcPlaceholder} maxLength={data.cvcMaxLength} />
                    </div>
                </div>
            </div>
        </ComponentInstall>
    );
}