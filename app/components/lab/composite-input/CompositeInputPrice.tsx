"use client";

import { useState } from "react";
import {
    Select,
    SelectItem,
    SelectValue,
    SelectContent,
    SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/composite-input/composite-input-price";

export function CompositeInputPrice() {
    const [currency, setCurrency] = useState("USD");

    return (
        <ComponentInstall category="composite-input" variant="composite-input-price" title="Price Input with Currency" code={`const [currency, setCurrency] = useState("USD");

const currencies = ${JSON.stringify(data, null, 2)};

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
</div>`} fullCode={code}>
            <div className="max-w-xs space-y-2">
                <Label>Price</Label>
                <div className="flex">
                    <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="w-[80px] rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {data.map((c) => (
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
        </ComponentInstall>
    );
}