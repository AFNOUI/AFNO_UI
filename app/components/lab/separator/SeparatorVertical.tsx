"use client";

import React from "react";
import { Home, Settings, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/separator/separator-vertical";

const icons = { Home, Settings, User };

export function SeparatorVertical() {
  return (
    <ComponentInstall
      category="separator"
      variant="separator-vertical"
      title="Vertical Separator"
      code={`const buttons = ${JSON.stringify(
        data,
        null,
        2,
      )};\n\n<Separator orientation="vertical" />`}
      fullCode={code}
    >
      <div className="flex h-10 items-center gap-4">
        {data.map((btn, i) => {
          const Icon = icons[btn.icon];
          return (
            <React.Fragment key={btn.label}>
              {i > 0 && <Separator orientation="vertical" className="h-6" />}
              <Button
                variant={btn.label === "Home" ? ("default" as const) : ("outline" as const)}
                size="sm"
              >
                <Icon className="me-2 h-4 w-4" />
                {btn.label}
              </Button>
            </React.Fragment>
          );
        })}
      </div>
    </ComponentInstall>
  );
}
