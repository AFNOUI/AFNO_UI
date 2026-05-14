export const data = [
  { value: "https", label: "https://" },
  { value: "http", label: "http://" },
];

export const code = `import React from "react";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const protocols = ${JSON.stringify(data, null, 2)};

export default function CompositeInputURLExample() {
  return (
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
    </div>
  );
}
`;