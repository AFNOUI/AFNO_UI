"use client";

import { CreditCard } from "lucide-react";
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
import { code, data } from "@/registry/alert-dialog/alert-dialog-payment";

export function AlertDialogPayment() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button>
      <CreditCard className="me-2 h-4 w-4" />
      {data.trigger.text}
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>{data.title}</AlertDialogTitle>
      <AlertDialogDescription>{data.description}</AlertDialogDescription>
      <div className="rounded-lg bg-muted p-3 mt-2">
        <p className="font-medium text-foreground">{data.pricing.plan}</p>
        <p className="text-sm">{data.pricing.billing}</p>
      </div>
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
      variant="alert-dialog-payment"
      title="Payment Confirmation"
      code={snippet}
      fullCode={code}
    >
      <div className="flex flex-wrap gap-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>
              <CreditCard className="me-2 h-4 w-4" />
              {data.trigger.text}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{data.title}</AlertDialogTitle>
              <AlertDialogDescription>{data.description}</AlertDialogDescription>
              <div className="rounded-lg bg-muted p-3 mt-2">
                <p className="font-medium text-foreground">{data.pricing.plan}</p>
                <p className="text-sm">{data.pricing.billing}</p>
              </div>
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
