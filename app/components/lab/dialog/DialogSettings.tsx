"use client";

import { Settings } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/dialog/dialog-settings";

export function DialogSettings() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">
      <Settings className="me-2 h-4 w-4" />
      {data.triggerText}
    </Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-lg">
    ...
  </DialogContent>
</Dialog>`;

  return (
    <ComponentInstall category="dialog" variant="dialog-settings" title="Settings Dialog" code={snippet} fullCode={code}>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Settings className="me-2 h-4 w-4" />
            {data.triggerText}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{data.title}</DialogTitle>
            <DialogDescription>{data.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {data.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{item.label}</Label>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch defaultChecked={item.defaultChecked} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{data.cancelText}</Button>
            </DialogClose>
            <Button>{data.saveText}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ComponentInstall>
  );
}
