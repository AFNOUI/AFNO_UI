"use client";

import { useState } from "react";
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
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/combobox/combobox-basic";

export function ComboboxBasic() {
  const [value, setValue] = useState("");

  return (
    <ComponentInstall category="combobox" variant="combobox-basic" title="Basic Combobox" code={`const [value, setValue] = useState("");

const data = ${JSON.stringify(data, null, 2)};

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
</Combobox>`} fullCode={code}>
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
    </ComponentInstall>
  );
}