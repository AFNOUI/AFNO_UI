"use client";

import React from "react";
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
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/combobox/combobox-creatable";

export function ComboboxCreatable() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

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
          <Plus className="me-2 h-3 w-3" /> Create &quot;New Item&quot;
        </Button>
      </ComboboxEmpty>
      <ComboboxGroup heading="Existing">
        {data.map((-company) => (
          <ComboboxItem key={company.value} value={company.value}>
            {company.label}
          </ComboboxItem>
        ))}
      </ComboboxGroup>
    </ComboboxList>
  </ComboboxContent>
</Combobox>`;

  return (
    <ComponentInstall category="combobox" variant="combobox-creatable" title="Creatable Content" code={snippet} fullCode={code}>
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
                <Plus className="me-2 h-3 w-3" /> Create &quot;New Item&quot;
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
    </ComponentInstall>
  );
}