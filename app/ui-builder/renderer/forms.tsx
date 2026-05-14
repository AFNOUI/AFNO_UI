import { Upload } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import type { CategoryRenderer } from "./types";

/**
 * Renders form control nodes (input, textarea, select, checkbox, switch,
 * radio group, date picker, file upload). Extracted verbatim from
 * `RenderNode.tsx`; output markup is byte-identical.
 */
export const renderFormNode: CategoryRenderer = (node, classes) => {
  const p = node.props;

  switch (node.type) {
    case "input":
      return (
        <div className={cn("space-y-2", classes)}>
          <Label>{p.label as string}</Label>
          <Input
            type={(p.inputType as string) || "text"}
            placeholder={p.placeholder as string}
          />
        </div>
      );
    case "textarea":
      return (
        <div className={cn("space-y-2", classes)}>
          <Label>{p.label as string}</Label>
          <Textarea
            placeholder={p.placeholder as string}
            rows={(p.rows as number) || 4}
          />
        </div>
      );
    case "select": {
      const opts = ((p.options as string) || "").split("\n").filter(Boolean);
      return (
        <div className={cn("space-y-2", classes)}>
          <Label>{p.label as string}</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {opts.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }
    case "checkbox":
      return (
        <div className={cn("flex items-center gap-2", classes)}>
          <Checkbox />
          <Label>{p.label as string}</Label>
        </div>
      );
    case "switch":
      return (
        <div className={cn("flex items-center gap-3", classes)}>
          <Switch defaultChecked={!!p.defaultChecked} />
          <Label>{p.label as string}</Label>
        </div>
      );
    case "radio-group": {
      const opts = ((p.options as string) || "").split("\n").filter(Boolean);
      return (
        <div className={cn("space-y-2", classes)}>
          <Label>{p.label as string}</Label>
          <RadioGroup>
            {opts.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <RadioGroupItem value={opt} id={`radio-${node.id}-${i}`} />
                <Label htmlFor={`radio-${node.id}-${i}`} className="font-normal">
                  {opt}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );
    }
    case "date-picker":
      return (
        <div className={cn("space-y-2", classes)}>
          <Label>{p.label as string}</Label>
          <Input type="date" />
        </div>
      );
    case "file-upload":
      return (
        <div className={cn("space-y-2", classes)}>
          <Label>{p.label as string}</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {p.description as string}
            </p>
          </div>
        </div>
      );
    default:
      return null;
  }
};
