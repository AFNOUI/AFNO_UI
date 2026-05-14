"use client";

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
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/dialog/dialog-basic";

export function DialogBasic() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<Dialog>
  <DialogTrigger asChild>
    <Button>{data.triggerText}</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{data.title}</DialogTitle>
      <DialogDescription>{data.description}</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">{data.cancelText}</Button>
      </DialogClose>
      <Button>{data.continueText}</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`;

  return (
    <ComponentInstall category="dialog" variant="dialog-basic" title="Basic Dialog" code={snippet} fullCode={code}>
      <div className="flex flex-wrap gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button>{data.triggerText}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{data.title}</DialogTitle>
              <DialogDescription>{data.description}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{data.cancelText}</Button>
              </DialogClose>
              <Button>{data.continueText}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ComponentInstall>
  );
}
