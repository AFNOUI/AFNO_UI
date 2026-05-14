"use client";

import { useState } from "react";
import { Check, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/dialog/dialog-success";

const payment = data.payment;
const email = data.emailVerification;

export function DialogSuccess() {
  const [showSuccess, setShowSuccess] = useState(false);

  const snippet = `const data = ${JSON.stringify(data, null, 2)};
const [showSuccess, setShowSuccess] = useState(false);

{/* Payment Success + Email Verification */}`;

  return (
    <ComponentInstall category="dialog" variant="dialog-success" title="Success / Status Dialog" code={snippet} fullCode={code}>
      <div className="flex flex-wrap gap-4">
        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogTrigger asChild>
            <Button className="bg-[hsl(var(--progress-success))] hover:bg-[hsl(var(--progress-success))]/90">
              <Check className="me-2 h-4 w-4" />
              {payment.triggerText}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-[hsl(var(--progress-success))]/10 flex items-center justify-center">
                <Check className="h-8 w-8 text-[hsl(var(--progress-success))]" />
              </div>
              <DialogTitle className="text-center text-xl">{payment.title}</DialogTitle>
              <DialogDescription className="text-center">{payment.description}</DialogDescription>
            </DialogHeader>
            <div className="text-center py-2">
              <Badge variant="secondary" className="text-sm">{payment.badgeText}</Badge>
            </div>
            <DialogFooter className="sm:justify-center">
              <Button onClick={() => setShowSuccess(false)}>{payment.continueText}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Mail className="me-2 h-4 w-4" />
              {email.triggerText}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <div className={`mx-auto mb-4 w-16 h-16 rounded-full ${email.iconCircleClassName} flex items-center justify-center`}>
                <Mail className={`h-8 w-8 ${email.iconClassName}`} />
              </div>
              <DialogTitle className="text-center">{email.title}</DialogTitle>
              <DialogDescription className="text-center">
                We&apos;ve sent a verification link to <strong>{email.email}</strong>. Click the link to verify your account.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center flex-col gap-2">
              <Button className="w-full">{email.primaryButton}</Button>
              <Button variant="link" className="w-full">{email.secondaryButton}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ComponentInstall>
  );
}
