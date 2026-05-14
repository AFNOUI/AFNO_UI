"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/popover/popover-form";

export function PopoverForm() {
  return (
    <ComponentInstall
      category="popover"
      variant="popover-form"
      title="Form in Popover"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n<PopoverContent>...`}
      fullCode={code}
    >
      <div className="flex flex-wrap gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button>Edit Profile</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">{data.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {data.description}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">{data.nameLabel}</Label>
                <Input id="name" defaultValue={data.nameDefault} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{data.emailLabel}</Label>
                <Input id="email" defaultValue={data.emailDefault} />
              </div>
              <Button className="w-full">{data.saveLabel}</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </ComponentInstall>
  );
}
