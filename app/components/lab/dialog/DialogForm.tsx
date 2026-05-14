"use client";

import { User, Upload, CreditCard } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/dialog/dialog-form";

const ep = data.editProfile;
const ap = data.addPayment;

export function DialogForm() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

{/* Edit Profile + Add Payment variants */}`;

  return (
    <ComponentInstall category="dialog" variant="dialog-form" title="Form Dialog" code={snippet} fullCode={code}>
      <div className="flex flex-wrap gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <User className="me-2 h-4 w-4" />
              {ep.triggerText}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{ep.title}</DialogTitle>
              <DialogDescription>{ep.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">{ep.avatarInitials}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  <Upload className="me-2 h-4 w-4" />
                  {ep.changePhotoText}
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue={ep.nameDefaultValue} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={ep.emailDefaultValue} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" placeholder={ep.bioPlaceholder} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{ep.cancelText}</Button>
              </DialogClose>
              <Button>{ep.saveText}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <CreditCard className="me-2 h-4 w-4" />
              {ap.triggerText}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{ap.title}</DialogTitle>
              <DialogDescription>{ap.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="card">Card Number</Label>
                <Input id="card" placeholder={ap.cardPlaceholder} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder={ap.expiryPlaceholder} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder={ap.cvcPlaceholder} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name-card">Name on Card</Label>
                <Input id="name-card" placeholder={ap.namePlaceholder} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{ap.cancelText}</Button>
              </DialogClose>
              <Button>{ap.submitText}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ComponentInstall>
  );
}
