export const data = {
  name: "John Doe",
  email: "john@example.com",
  stats: [
    { value: "128", label: "Posts" },
    { value: "1.2k", label: "Followers" },
    { value: "384", label: "Following" },
  ],
};

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import React from "react";
import { User } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const data = ${dataStr};

export default function SeparatorProfileCardExample() {
  return (
    <div className="rounded-lg border p-6 max-w-sm">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-muted-foreground">{data.email}</p>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="flex justify-between text-sm">
        {data.stats.map((stat, i) => (
          <React.Fragment key={stat.label}>
            {i > 0 && <Separator orientation="vertical" className="h-12" />}
            <div className="text-center">
              <p className="font-semibold">{stat.value}</p>
              <p className="text-muted-foreground">{stat.label}</p>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
`;
