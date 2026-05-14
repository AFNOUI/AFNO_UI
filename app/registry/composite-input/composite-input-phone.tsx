export const data = [
  { value: "+1", label: "+1", flag: "🇺🇸" },
  { value: "+44", label: "+44", flag: "🇬🇧" },
  { value: "+91", label: "+91", flag: "🇮🇳" },
  { value: "+81", label: "+81", flag: "🇯🇵" },
  { value: "+49", label: "+49", flag: "🇩🇪" },
  { value: "+33", label: "+33", flag: "🇫🇷" },
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

const countries = ${JSON.stringify(data, null, 2)};

export default function CompositeInputPhoneExample() {
  const [countryCode, setCountryCode] = useState("+1");

  return (
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
    </div>
  );
}
`;