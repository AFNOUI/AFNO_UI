"use client";

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
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/alert-dialog/alert-dialog-security";

export function AlertDialogSecurity() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

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
</AlertDialog>`;

  return (
    <ComponentInstall
      category="alert-dialog"
      variant="alert-dialog-security"
      title="Security Verification"
      code={snippet}
      fullCode={code}
    >
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
    </ComponentInstall>
  );
}
