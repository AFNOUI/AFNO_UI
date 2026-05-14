
export const data = {
  trigger: {
    variant: "secondary" as const,
    icon: "Shield",
    text: "Change Security Settings",
  },
  title: {
    icon: "Shield",
    text: "Verify Your Identity",
    className: "flex items-center gap-2",
  },
  description: "For your security, we need to verify your identity before making changes to your security settings. A verification code will be sent to your email.",
  cancelText: "Cancel",
  actionText: "Send Verification",
};

export const code = `import React from "react";
import { Shield } from "lucide-react";
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

export default function AlertDialogSecurityExample() {
  return (
    <div className="flex flex-wrap gap-4">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant={data.trigger.variant}>
            <Shield className="me-2 h-4 w-4" />
            {data.trigger.text}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={data.title.className}>
              <Shield className="h-5 w-5 text-primary" />
              {data.title.text}
            </AlertDialogTitle>
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
