export const data = {
  cardPlaceholder: "4242 4242 4242 4242",
  cardIcon: "💳",
  expiryPlaceholder: "MM/YY",
  cvcPlaceholder: "123",
  cvcMaxLength: 4,
};

export const code = `import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const data = ${JSON.stringify(data, null, 2)};

export default function CompositeInputCreditCardExample() {
  return (
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
  );
}
`;