"use client";

import { FileText } from "lucide-react";
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
import { code, data } from "@/registry/dialog/dialog-scrollable";

export function DialogScrollable() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">
      <FileText className="me-2 h-4 w-4" />
      {data.triggerText}
    </Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-lg max-h-[80vh]">
    <DialogHeader>
      <DialogTitle>{data.title}</DialogTitle>
      <DialogDescription>{data.description}</DialogDescription>
    </DialogHeader>
    <div className="overflow-y-auto max-h-[40vh] pr-4 space-y-4 text-sm text-muted-foreground">
      {data.content.map((p, i) => <p key={i}>{p}</p>)}
    </div>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">{data.declineText}</Button>
      </DialogClose>
      <Button>{data.acceptText}</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`;

  return (
    <ComponentInstall category="dialog" variant="dialog-scrollable" title="Scrollable Content Dialog" code={snippet} fullCode={code}>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <FileText className="me-2 h-4 w-4" />
            {data.triggerText}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{data.title}</DialogTitle>
            <DialogDescription>{data.description}</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[40vh] pr-4 space-y-4 text-sm text-muted-foreground">
            {data.content.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{data.declineText}</Button>
            </DialogClose>
            <Button>{data.acceptText}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ComponentInstall>
  );
}
