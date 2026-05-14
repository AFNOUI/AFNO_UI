export const data = {
  title: "Radix Primitives",
  description: "An open-source UI component library.",
  links: ["Blog", "Docs", "Source"] as const,
};

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { Separator } from "@/components/ui/separator";

const data = ${dataStr};

export default function SeparatorBasicExample() {
  return (
    <div>
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">{data.title}</h4>
        <p className="text-sm text-muted-foreground">{data.description}</p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>{data.links[0]}</div>
        <Separator orientation="vertical" />
        <div>{data.links[1]}</div>
        <Separator orientation="vertical" />
        <div>{data.links[2]}</div>
      </div>
    </div>
  );
}
`;
