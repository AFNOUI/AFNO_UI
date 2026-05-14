"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/sheet/sheet-right";

export function SheetRight() {
  return (
    <ComponentInstall
      category="sheet"
      variant="sheet-right"
      title="Right Side Sheet"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n<Sheet><SheetContent>...`}
      fullCode={code}
    >
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open Right Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{data.title}</SheetTitle>
            <SheetDescription>{data.description}</SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-end">
                {data.nameLabel}
              </Label>
              <Input id="name" defaultValue={data.nameDefault} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-end">
                {data.usernameLabel}
              </Label>
              <Input id="username" defaultValue={data.usernameDefault} className="col-span-3" />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit">{data.saveLabel}</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </ComponentInstall>
  );
}
