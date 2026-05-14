
export const data = {
  trigger: {
    variant: "outline" as const,
    icon: "LogOut",
    text: "Sign Out",
  },
  title: "Sign out of your account?",
  description: "You'll need to sign in again to access your dashboard and projects.",
  cancelText: "Stay signed in",
  actionText: "Sign out",
};

export const code = `import React from "react";
import { LogOut } from "lucide-react";
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

export default function AlertDialogLogoutExample() {
  return (
    <div className="flex flex-wrap gap-4">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant={data.trigger.variant}>
            <LogOut className="me-2 h-4 w-4" />
            {data.trigger.text}
          </Button>
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
