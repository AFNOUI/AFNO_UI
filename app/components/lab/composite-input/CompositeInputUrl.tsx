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
import { code, data } from "@/registry/composite-input/composite-input-url";

export function CompositeInputUrl() {
  return (
    <ComponentInstall
      category="composite-input"
      variant="composite-input-url"
      title="URL Input with Protocol"
      code={`const protocols = ${JSON.stringify(data, null, 2)};

<div className="max-w-md space-y-2">
  <Label>Website URL</Label>
  <div className="flex">
    <Select defaultValue="https">
      <SelectTrigger className="w-[110px] rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {protocols.map((p) => (
          <SelectItem key={p.value} value={p.value}>
            {p.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Input
      placeholder="example.com"
      className="rounded-l-none"
    />
  </div>
</div>`}
      fullCode={code}
    >
      <div className="max-w-md space-y-2">
        <Label>Website URL</Label>
        <div className="flex">
          <Select defaultValue="https">
            <SelectTrigger className="w-[110px] rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {data.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="example.com"
            className="rounded-l-none"
          />
        </div>
      </div>
    </ComponentInstall>
  );
}
