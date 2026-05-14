"use client";

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
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/alert-dialog/alert-dialog-destructive";

export function AlertDialogDestructive() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

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
</AlertDialog>`;

  return (
    <ComponentInstall
      category="alert-dialog"
      variant="alert-dialog-destructive"
      title="Destructive Action"
      code={snippet}
      fullCode={code}
    >
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
    </ComponentInstall>
  );
}
