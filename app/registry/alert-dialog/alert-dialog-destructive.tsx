
export const data = {
  trigger: {
    variant: "destructive" as const,
    icon: "Trash2",
    text: "Delete Account",
  },
  title: {
    icon: "AlertTriangle",
    text: "Delete Account",
    className: "flex items-center gap-2 text-destructive",
  },
  description: "This will permanently delete your account, all your projects, and remove all associated data. This action is irreversible.",
  cancelText: "Keep Account",
  action: {
    text: "Yes, Delete Everything",
    className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  },
};

export const code = `import React from "react";
import { Trash2, AlertTriangle } from "lucide-react";
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

export default function AlertDialogDestructiveExample() {
  return (
    <div className="flex flex-wrap gap-4">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant={data.trigger.variant}>
            <Trash2 className="me-2 h-4 w-4" />
            {data.trigger.text}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={data.title.className}>
              <AlertTriangle className="h-5 w-5" />
              {data.title.text}
            </AlertDialogTitle>
            <AlertDialogDescription>{data.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{data.cancelText}</AlertDialogCancel>
            <AlertDialogAction className={data.action.className}>{data.action.text}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}`;
