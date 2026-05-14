"use client";

import { Settings, User, Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/popover/popover-basic";

const icons = { User, Bell, Settings };

export function PopoverBasic() {
  return (
    <ComponentInstall
      category="popover"
      variant="popover-basic"
      title="Basic Popover"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n<Popover>...`}
      fullCode={code}
    >
      <div className="flex flex-wrap gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open Popover</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">{data.dimensionTitle}</h4>
                <p className="text-sm text-muted-foreground">
                  {data.dimensionDescription}
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="width">Width</Label>
                  <Input id="width" defaultValue={data.widthDefault} className="col-span-2 h-8" />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="height">Height</Label>
                  <Input id="height" defaultValue={data.heightDefault} className="col-span-2 h-8" />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary">
              <Settings className="me-2 h-4 w-4" />
              Settings
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="space-y-1">
              {data.menuItems.map((item) => {
                const Icon = icons[item.icon];
                return (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent"
                  >
                    <Icon className="h-4 w-4" /> {item.label}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </ComponentInstall>
  );
}
