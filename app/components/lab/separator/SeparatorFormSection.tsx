"use client";

import { Separator } from "@/components/ui/separator";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/separator/separator-form-section";

export function SeparatorFormSection() {
  return (
    <ComponentInstall
      category="separator"
      variant="separator-form-section"
      title="Form Section Separator"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n// Form sections`}
      fullCode={code}
    >
      <div className="max-w-md space-y-6">
        {data.sections.map((section, i) => (
          <div key={i}>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{section.title}</h3>
              {i === 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 rounded-md bg-muted" />
                  <div className="h-10 rounded-md bg-muted" />
                </div>
              )}
              {i === 1 && (
                <div className="space-y-4">
                  <div className="h-10 rounded-md bg-muted" />
                  <div className="h-10 rounded-md bg-muted" />
                </div>
              )}
              {i === 2 && <div className="h-10 rounded-md bg-muted" />}
            </div>
            {i < data.sections.length - 1 && (
              <div className="relative py-2">
                <Separator />
              </div>
            )}
          </div>
        ))}
      </div>
    </ComponentInstall>
  );
}
