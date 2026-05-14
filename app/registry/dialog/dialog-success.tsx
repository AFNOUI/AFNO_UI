export const data = {
  payment: {
    triggerText: "Show Success",
    triggerIcon: "Check",
    title: "Payment Successful!",
    description:
      "Your payment of $49.99 has been processed successfully. A confirmation email has been sent to your inbox.",
    badgeText: "Order #12345",
    continueText: "Continue Shopping",
  },
  emailVerification: {
    triggerIcon: "Mail",
    triggerText: "Email Verification",
    title: "Check Your Email",
    description: "We've sent a verification link to **john@example.com**. Click the link to verify your account.",
    email: "john@example.com",
    primaryButton: "Open Email App",
    secondaryButton: "Resend Email",
    iconCircleClassName: "bg-primary/10",
    iconClassName: "text-primary",
  },
};

const dataStr = JSON.stringify(data, null, 2);
export const code = `import React, { useState } from "react";
import { Check, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const data = ${dataStr};

export default function DialogSuccessExample() {
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <div className="flex flex-wrap gap-4">
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogTrigger asChild>
          <Button className="bg-[hsl(var(--progress-success))] hover:bg-[hsl(var(--progress-success))]/90">
            <Check className="me-2 h-4 w-4" />
            {data.payment.triggerText}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-[hsl(var(--progress-success))]/10 flex items-center justify-center">
              <Check className="h-8 w-8 text-[hsl(var(--progress-success))]" />
            </div>
            <DialogTitle className="text-center text-xl">{data.payment.title}</DialogTitle>
            <DialogDescription className="text-center">{data.payment.description}</DialogDescription>
          </DialogHeader>
          <div className="text-center py-2">
            <Badge variant="secondary" className="text-sm">{data.payment.badgeText}</Badge>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setShowSuccess(false)}>{data.payment.continueText}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Mail className="me-2 h-4 w-4" />
            {data.emailVerification.triggerText}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className={"mx-auto mb-4 w-16 h-16 rounded-full " + data.emailVerification.iconCircleClassName + " flex items-center justify-center"}>
              <Mail className={"h-8 w-8 " + data.emailVerification.iconClassName} />
            </div>
            <DialogTitle className="text-center">{data.emailVerification.title}</DialogTitle>
            <DialogDescription className="text-center">
              We've sent a verification link to <strong>{data.emailVerification.email}</strong>. Click the link to verify your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center flex-col gap-2">
            <Button className="w-full">{data.emailVerification.primaryButton}</Button>
            <Button variant="link" className="w-full">{data.emailVerification.secondaryButton}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
`;
