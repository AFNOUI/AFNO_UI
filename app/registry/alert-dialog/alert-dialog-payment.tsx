
export const data = {
  trigger: {
    icon: "CreditCard",
    text: "Upgrade to Pro",
  },
  title: "Confirm Your Upgrade",
  description: "You're about to upgrade to the Pro plan:",
  pricing: {
    plan: "Pro Plan - $29/month",
    price: "Pro Plan - $29/month",
    billing: "Billed monthly, cancel anytime",
  },
  cancelText: "Cancel",
  actionText: "Confirm & Pay",
};

export const code = `import React from "react";
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

const data = ${JSON.stringify(data, null, 2)} as const;

export default function AlertDialogPaymentExample() {
  return (
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
  );
}`;
