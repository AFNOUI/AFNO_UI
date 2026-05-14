export const data = {
  title: "Upload Image",
  description: "Upload an image from your device. Max file size is 5MB.",
  triggerText: "Upload Image",
  triggerIcon: "ImageIcon",
  dropzoneIcon: "Upload",
  dropzoneTitle: "Drop your file here or click to browse",
  fileTypesText: "PNG, JPG, GIF up to 5MB",
  defaultFileName: "image.png",
  defaultFileSize: "2.4 MB",
  cancelText: "Cancel",
  uploadButtonText: "Upload",
};

const dataStr = JSON.stringify(data, null, 2);
export const code = `import React from "react";
import { Image as ImageIcon, Upload, X, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const data = ${dataStr};

export default function DialogImageUploadExample() {
  return (
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
  );
}
`;
