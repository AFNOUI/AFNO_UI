"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/input/input-fields";

export function InputFields() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<div className="space-y-4 max-w-md">
  {data.fields.map((field) => (
    <div key={field.id} className="space-y-2">
      <Label htmlFor={field.id}>{field.label}</Label>
      <Input id={field.id} type={field.type} placeholder={field.placeholder} disabled={field.disabled} />
    </div>
  ))}
  <div className="space-y-2">
    <Label htmlFor={data.textarea.id}>{data.textarea.label}</Label>
    <Textarea id={data.textarea.id} placeholder={data.textarea.placeholder} />
  </div>
</div>`;

  return (
    <ComponentInstall category="input" variant="input-fields" title="Input Fields" code={snippet} fullCode={code}>
      <div className="space-y-4 max-w-md">
        {data.fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              disabled={!!field.disabled}
            />
          </div>
        ))}
        <div className="space-y-2">
          <Label htmlFor={data.textarea.id}>{data.textarea.label}</Label>
          <Textarea id={data.textarea.id} placeholder={data.textarea.placeholder} />
        </div>
      </div>
    </ComponentInstall>
  );
}
