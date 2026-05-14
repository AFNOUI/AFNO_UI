"use client";

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
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";

import { code, data } from "@/registry/alert-dialog/alert-dialog-basic";

export function AlertDialogBasic() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

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
</AlertDialog>`;

  return (
    <ComponentInstall
      category="alert-dialog"
      variant="alert-dialog-basic"
      title="Basic Alert Dialog"
      code={snippet}
      fullCode={code}
    >
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
    </ComponentInstall>
  );
}
