"use client";

import React, { useState } from "react";
import { Tag, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { code, data } from "@/registry/combobox/combobox-multiselect";

export function ComboboxMultiselect() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tagValue: string) => {
    setSelectedTags(prev =>
      prev.includes(tagValue)
        ? prev.filter(t => t !== tagValue)
        : [...prev, tagValue]
    );
  };

  return (
    <ComponentInstall
      category="combobox"
      variant="combobox-multiselect"
      title="Multi-select (Manual logic)"
      code={`const [selectedTags, setSelectedTags] = useState<string[]>([]);

const toggleTag = (tagValue: string) => {
  setSelectedTags(prev =>
    prev.includes(tagValue) ? prev.filter(t => t !== tagValue) : [...prev, tagValue]
  );
};

<Combobox 
  value="" 
  onValueChange={() => {}}
>
  <ComboboxTrigger className="w-[300px] h-auto min-h-10">
    <div className="flex flex-wrap gap-1">
      {selectedTags.map(tagValue => (
        <Badge key={tagValue} variant="secondary" className="gap-1 px-1">
          {tagValue}
          <X className="h-3 w-3 cursor-pointer" onClick={(e) => {
            e.stopPropagation();
            toggleTag(tagValue);
          }} />
        </Badge>
      ))}
    </div>
  </ComboboxTrigger>
  <ComboboxContent>
    <ComboboxInput placeholder="Search..." />
    <ComboboxList>
      <ComboboxGroup>
        {data.map((tag) => (
          <ComboboxItem
            key={tag.value}
            value={tag.value}
            shouldCloseOnSelect={false}
            onSelect={() => toggleTag(tag.value)}
          >
            {tag.label}
          </ComboboxItem>
        ))}
      </ComboboxGroup>
    </ComboboxList>
  </ComboboxContent>
</Combobox>`}
      fullCode={code}
    >
      <Combobox value="" onValueChange={() => { }}>
        <ComboboxTrigger className="w-[300px] h-auto min-h-10">
          <div className="flex flex-wrap gap-1">
            {selectedTags.length > 0 ? (
              selectedTags.map(tagValue => {
                const tag = data.find(t => t.value === tagValue);
                return (
                  <Badge key={tagValue} variant="secondary" className="gap-1 px-1">
                    <span className={cn("w-2 h-2 rounded-full", tag?.color)} />
                    {tag?.label}
                    <X className="h-3 w-3 cursor-pointer" onClick={(e) => {
                      e.stopPropagation();
                      toggleTag(tagValue);
                    }} />
                  </Badge>
                );
              })
            ) : (
              <span className="text-muted-foreground flex items-center gap-2">
                <Tag className="h-4 w-4" /> Select tags...
              </span>
            )}
          </div>
        </ComboboxTrigger>
        <ComboboxContent className="w-[300px]">
          <ComboboxInput placeholder="Search tags..." />
          <ComboboxList>
            <ComboboxEmpty>No tag found.</ComboboxEmpty>
            <ComboboxGroup>
              {data.map((tag) => (
                <ComboboxItem
                  key={tag.value}
                  value={tag.value}
                  shouldCloseOnSelect={false}
                  onSelect={() => toggleTag(tag.value)}
                >
                  <div className="flex items-center flex-1">
                    <Check className={cn(
                      "me-2 h-4 w-4",
                      selectedTags.includes(tag.value) ? "opacity-100" : "opacity-0"
                    )} />
                    <span className={cn("w-3 h-3 rounded-full me-2", tag.color)} />
                    {tag.label}
                  </div>
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </ComponentInstall>
  );
}
