export const data = {
  delete: {
    triggerText: "Delete Account",
    triggerIcon: "Trash2",
    icon: "AlertTriangle",
    title: "Delete Account",
    description:
      "Are you sure you want to delete your account? All of your data will be permanently removed. This action cannot be undone.",
    cancelText: "Cancel",
    confirmText: "Delete Account",
    confirmVariant: "destructive",
  },
  warning: {
    triggerText: "Warning Dialog",
    triggerIcon: "AlertTriangle",
    title: "Unsaved Changes",
    description:
      "You have unsaved changes. Are you sure you want to leave? Your changes will be lost.",
    cancelText: "Stay",
    confirmText: "Leave Anyway",
    confirmClassName: "bg-[hsl(var(--progress-warning))] hover:bg-[hsl(var(--progress-warning))]/90 text-foreground",
    contentClassName: "border-[hsl(var(--progress-warning))]",
    iconCircleClassName: "bg-[hsl(var(--progress-warning))]/10",
    iconClassName: "text-[hsl(var(--progress-warning))]",
  },
};

const dataStr = JSON.stringify(data, null, 2);
export const code = `import React from "react";
import { Trash2, AlertTriangle } from "lucide-react";
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

export default function DialogConfirmationExample() {
  return (
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
            <div className={"mx-auto mb-4 w-12 h-12 rounded-full " + data.warning.iconCircleClassName + " flex items-center justify-center"}>
              <AlertTriangle className={"h-6 w-6 " + data.warning.iconClassName} />
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
  );
}
`;
