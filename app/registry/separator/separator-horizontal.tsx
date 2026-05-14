export const data = [
  { title: "Account Settings", desc: "Manage your account preferences and settings." },
  { title: "Privacy", desc: "Control who can see your profile and activity." },
  { title: "Notifications", desc: "Choose what notifications you want to receive." },
];

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { Separator } from "@/components/ui/separator";

const sections = ${dataStr};

export default function SeparatorHorizontalExample() {
  return (
    <div className="max-w-md space-y-4">
      {sections.map((section, i) => (
        <div key={i}>
          <h3 className="font-semibold">{section.title}</h3>
          <p className="text-sm text-muted-foreground">{section.desc}</p>
          {i < sections.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
}
`;
