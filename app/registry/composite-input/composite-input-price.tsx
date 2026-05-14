export const data = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "JPY", label: "JPY" },
  { value: "INR", label: "INR" },
];

export const code = `import React, { useState } from "react";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const currencies = ${JSON.stringify(data, null, 2)};

export default function CompositeInputPriceExample() {
  const [currency, setCurrency] = useState("USD");

  return (
    <div className="max-w-xs space-y-2">
      <Label>Price</Label>
      <div className="flex">
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger className="w-[80px] rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.value} {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="0.00"
          className="rounded-l-none"
        />
      </div>
    </div>
  );
}
`;