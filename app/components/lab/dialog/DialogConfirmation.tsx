"use client";

import { Trash2, AlertTriangle } from "lucide-react";
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
import { code, data } from "@/registry/dialog/dialog-confirmation";

export function DialogConfirmation() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

{/* Delete + Warning variants - see full code */}`;

  return (
    <ComponentInstall category="dialog" variant="dialog-confirmation" title="Confirmation / Delete Dialog" code={snippet} fullCode={code}>
      <div className="flex flex-wrap gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="me-2 h-4 w-4" />
              {data.delete.triggerText}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <DialogTitle className="text-center">{data.delete.title}</DialogTitle>
              <DialogDescription className="text-center">{data.delete.description}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center gap-2">
              <DialogClose asChild>
                <Button variant="outline">{data.delete.cancelText}</Button>
              </DialogClose>
              <Button variant="destructive">{data.delete.confirmText}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <AlertTriangle className="me-2 h-4 w-4" />
              {data.warning.triggerText}
            </Button>
          </DialogTrigger>
          <DialogContent className={data.warning.contentClassName}>
            <DialogHeader>
              <div className={`mx-auto mb-4 w-12 h-12 rounded-full ${data.warning.iconCircleClassName} flex items-center justify-center`}>
                <AlertTriangle className={`h-6 w-6 ${data.warning.iconClassName}`} />
              </div>
              <DialogTitle className="text-center">{data.warning.title}</DialogTitle>
              <DialogDescription className="text-center">{data.warning.description}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center gap-2">
              <DialogClose asChild>
                <Button variant="outline">{data.warning.cancelText}</Button>
              </DialogClose>
              <Button className={data.warning.confirmClassName}>{data.warning.confirmText}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ComponentInstall>
  );
}
