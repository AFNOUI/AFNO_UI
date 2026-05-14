export const data = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
];

export const code = `import React, { useState } from "react";
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
import { Badge } from "@/components/ui/badge";

const data = ${JSON.stringify(data, null, 2)};

export default function ComboboxBasicExample() {
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <Combobox value={value} onValueChange={setValue}>
        <ComboboxTrigger className="w-[200px]">
          {value ? data.find((f) => f.value === value)?.label : "Select framework..."}
        </ComboboxTrigger>
        <ComboboxContent className="w-[200px]">
          <ComboboxInput placeholder="Search framework..." />
          <ComboboxList>
            <ComboboxEmpty>No framework found.</ComboboxEmpty>
            <ComboboxGroup>
              {data.map((f) => (
                <ComboboxItem key={f.value} value={f.value}>
                  {f.label}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {value && <Badge variant="outline">Selected: {value}</Badge>}
    </div>
  );
}
`;