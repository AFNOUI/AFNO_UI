export const data = {
  sections: [
    { title: "Personal Information" },
    { title: "Contact Details" },
    { title: "Preferences" },
  ],
};

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { Separator } from "@/components/ui/separator";

const data = ${dataStr};

export default function SeparatorFormSectionExample() {
  return (
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
  );
}
`;
