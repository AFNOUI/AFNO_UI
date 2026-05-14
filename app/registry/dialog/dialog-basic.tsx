export const data = {
  title: "Welcome to the Dialog",
  description: "This is a basic dialog component. You can add any content here.",
  triggerText: "Open Dialog",
  cancelText: "Cancel",
  continueText: "Continue",
};

const dataStr = JSON.stringify(data, null, 2);
export const code = `import React from "react";
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

export default function DialogBasicExample() {
  return (
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
  );
}
`;
