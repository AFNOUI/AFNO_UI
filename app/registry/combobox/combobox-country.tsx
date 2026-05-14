export const data = [
  { value: "us", label: "United States", flag: "🇺🇸" },
  { value: "uk", label: "United Kingdom", flag: "🇬🇧" },
  { value: "ca", label: "Canada", flag: "🇨🇦" },
  { value: "de", label: "Germany", flag: "🇩🇪" },
  { value: "fr", label: "France", flag: "🇫🇷" },
  { value: "jp", label: "Japan", flag: "🇯🇵" },
  { value: "au", label: "Australia", flag: "🇦🇺" },
];

export const code = `import React, { useState } from "react";
import { Globe } from "lucide-react";
import {
  Combobox,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxGroup,
  ComboboxTrigger,
  ComboboxContent,
} from "@/components/ui/combobox";

const data = ${JSON.stringify(data, null, 2)};

export default function ComboboxCountryExample() {
  const [country, setCountry] = useState("");

  return (
    <Combobox value={country} onValueChange={setCountry}>
      <ComboboxTrigger className="w-[240px]">
        <div className="flex items-center">
        <Globe className="me-2 h-4 w-4 opacity-50" />
        {country ? (
          <span className="flex items-center gap-2">
            {data.find(c => c.value === country)?.flag}
            {data.find(c => c.value === country)?.label}
          </span>
        ) : "Select country..."}
        </div>
      </ComboboxTrigger>
      <ComboboxContent className="w-[240px]">
        <ComboboxInput placeholder="Search country..." />
        <ComboboxList>
          <ComboboxEmpty>No country found.</ComboboxEmpty>
          <ComboboxGroup>
            {data.map((c) => (
              <ComboboxItem key={c.value} value={c.value}>
                <span className="me-2">{c.flag}</span>
                {c.label}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
`;