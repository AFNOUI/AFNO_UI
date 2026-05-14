export const data = [
  { value: "acme", label: "Acme Inc." },
  { value: "globex", label: "Globex Corp." },
];

export const code = `import React from "react";
import { Building2, Plus } from "lucide-react";
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
import { Button } from "@/components/ui/button";

const data = ${JSON.stringify(data, null, 2)};

export default function ComboboxCreatableExample() {
  return (
    <Combobox value="" onValueChange={() => { }}>
      <ComboboxTrigger className="w-[240px]">
        <p className="flex items-center gap-2">
          <Building2 className="me-2 h-4 w-4 opacity-50" />
          Select or create...
        </p>
      </ComboboxTrigger>
      <ComboboxContent className="w-[240px]">
        <ComboboxInput placeholder="Search..." />
        <ComboboxList>
          <ComboboxEmpty>
            <Button variant="ghost" className="w-full justify-start text-xs h-8 px-2" onClick={() => alert('Create logic')}>
              <Plus className="me-2 h-3 w-3" /> Create "New Item"
            </Button>
          </ComboboxEmpty>
          <ComboboxGroup heading="Existing">
            {data.map((company) => (
              <ComboboxItem key={company.value} value={company.value}>
                {company.label}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
`;