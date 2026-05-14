export const data = [
  { value: "bug", label: "Bug", color: "bg-red-500" },
  { value: "feature", label: "Feature", color: "bg-blue-500" },
  { value: "enhancement", label: "Enhancement", color: "bg-green-500" },
  { value: "documentation", label: "Documentation", color: "bg-yellow-500" },
  { value: "question", label: "Question", color: "bg-purple-500" },
];

export const code = `import React, { useState } from "react";
import { Tag, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Combobox,
  ComboboxList,
  ComboboxItem,
  ComboboxInput,
  ComboboxGroup,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";

const data = ${JSON.stringify(data, null, 2)};

export default function ComboboxMultiSelectExample() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tagValue: string) => {
    setSelectedTags(prev =>
      prev.includes(tagValue)
        ? prev.filter(t => t !== tagValue)
        : [...prev, tagValue]
    );
  };

  return (
    <Combobox value="" onValueChange={() => { }}>
      <ComboboxTrigger className="w-[300px] h-auto min-h-10 py-2">
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
  );
}
`;