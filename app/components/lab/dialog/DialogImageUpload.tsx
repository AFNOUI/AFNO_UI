"use client";

import { Image as ImageIcon, Upload, X, FileText } from "lucide-react";
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
import { code, data } from "@/registry/dialog/dialog-image-upload";

export function DialogImageUpload() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">
      {data.triggerText}
    </Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>{data.title}</DialogTitle>
      <DialogDescription>{data.description}</DialogDescription>
    </DialogHeader>
    <div className="py-4">
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer">
        <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-sm font-medium">Drop your file here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">{data.fileTypesText}</p>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
          <FileText className="h-8 w-8 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{data.defaultFileName}</p>
            <p className="text-xs text-muted-foreground">{data.defaultFileSize}</p>
          </div>
          <Button variant="ghost" size="icon">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">{data.cancelText}</Button>
      </DialogClose>
      <Button>{data.uploadButtonText}</Button>
      </DialogFooter>
  </DialogContent>
</Dialog>`;

  return (
    <ComponentInstall category="dialog" variant="dialog-image-upload" title="File Upload Dialog" code={snippet} fullCode={code}>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <ImageIcon className="me-2 h-4 w-4" />
            {data.triggerText}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{data.title}</DialogTitle>
            <DialogDescription>{data.description}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer">
              <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-sm font-medium">{data.dropzoneTitle}</p>
              <p className="text-xs text-muted-foreground mt-1">{data.fileTypesText}</p>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{data.defaultFileName}</p>
                  <p className="text-xs text-muted-foreground">{data.defaultFileSize}</p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{data.cancelText}</Button>
            </DialogClose>
            <Button>{data.uploadButtonText}</Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
    </ComponentInstall>
  );
}