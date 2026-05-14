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
import { code, data } from "@/registry/composite-input/composite-input-phone";

export function CompositeInputPhone() {
    const [countryCode, setCountryCode] = useState("+1");

    return (
        <ComponentInstall category="composite-input" variant="composite-input-phone" title="Phone Number with Country Code" code={`const [countryCode, setCountryCode] = useState("+1");

const countries = ${JSON.stringify(data, null, 2)};

<div className="max-w-sm space-y-2">
  <Label>Phone Number</Label>
  <div className="flex">
    <Select value={countryCode} onValueChange={setCountryCode}>
      <SelectTrigger className="w-[100px] rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {countries.map((c) => (
          <SelectItem key={c.value} value={c.value}>
            {c.flag} {c.value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Input
      type="tel"
      placeholder="(555) 123-4567"
      className="rounded-l-none"
    />
  </div>
</div>`} fullCode={code}>
            <div className="max-w-sm space-y-2">
                <Label>Phone Number</Label>
                <div className="flex">
                    <Select value={countryCode} onValueChange={setCountryCode}>
                        <SelectTrigger className="w-[100px] rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {data.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                    {c.flag} {c.value}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="rounded-l-none"
                    />
                </div>
            </div>
        </ComponentInstall>
    );
}