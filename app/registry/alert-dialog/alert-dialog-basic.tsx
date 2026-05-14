
export const data = {
  trigger: {
    variant: "outline" as const,
    text: "Show Dialog",
  },
  title: "Are you absolutely sure?",
  description: "This action cannot be undone. This will permanently delete your account and remove your data from our servers.",
  cancelText: "Cancel",
  actionText: "Continue",
};

export const code = `import React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

const data = ${JSON.stringify(data, null, 2)} as const;

export default function AlertDialogBasicExample() {
  return (
    <div className="flex flex-wrap gap-4">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant={data.trigger.variant}>{data.trigger.text}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{data.title}</AlertDialogTitle>
            <AlertDialogDescription>{data.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{data.cancelText}</AlertDialogCancel>
            <AlertDialogAction>{data.actionText}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}`;
