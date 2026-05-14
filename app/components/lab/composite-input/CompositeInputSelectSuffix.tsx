"use client";

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
import { code, data } from "@/registry/composite-input/composite-input-select-suffix";

export function CompositeInputSelectSuffix() {
    return (
        <ComponentInstall category="composite-input" variant="composite-input-select-suffix" title="Input with Select Suffix" code={`const units = ${JSON.stringify(data, null, 2)};

<div className="max-w-xs space-y-2">
  <Label>Quantity</Label>
  <div className="flex">
    <Input
      type="number"
      placeholder="100"
      className="rounded-r-none"
    />
    <Select defaultValue="kg">
      <SelectTrigger className="w-[80px] rounded-l-none border-l-0 focus:ring-0 focus:ring-offset-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {units.map((u) => (
          <SelectItem key={u.value} value={u.value}>
            {u.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
</div>`} fullCode={code}>
            <div className="max-w-xs space-y-2">
                <Label>Quantity</Label>
                <div className="flex">
                    <Input
                        type="number"
                        placeholder="100"
                        className="rounded-r-none"
                    />
                    <Select defaultValue="kg">
                        <SelectTrigger className="w-[80px] rounded-l-none border-l-0 focus:ring-0 focus:ring-offset-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {data.map((u) => (
                                <SelectItem key={u.value} value={u.value}>
                                    {u.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </ComponentInstall>
    );
}