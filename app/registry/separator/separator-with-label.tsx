export const data = { label: "Or continue with" };

export const code = `"use client";

import { Separator } from "@/components/ui/separator";

const data = { label: "Or continue with" };

export default function SeparatorWithLabelExample() {
  return (
    <div className="max-w-md">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {data.label}
          </span>
        </div>
      </div>
    </div>
  );
}
`;
