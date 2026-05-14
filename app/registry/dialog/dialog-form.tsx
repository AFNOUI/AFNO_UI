export const data = {
  editProfile: {
    triggerIcon: "User",
    triggerText: "Edit Profile",
    title: "Edit Profile",
    description: "Make changes to your profile here. Click save when you're done.",
    avatarInitials: "JD",
    changePhotoText: "Change Photo",
    nameDefaultValue: "John Doe",
    emailDefaultValue: "john@example.com",
    bioPlaceholder: "Tell us about yourself...",
    cancelText: "Cancel",
    saveText: "Save Changes",
  },
  addPayment: {
    triggerIcon: "CreditCard",
    triggerText: "Add Payment Method",
    title: "Add Payment Method",
    description: "Add a new payment method to your account.",
    cardPlaceholder: "1234 5678 9012 3456",
    expiryPlaceholder: "MM/YY",
    cvcPlaceholder: "123",
    namePlaceholder: "John Doe",
    cancelText: "Cancel",
    submitText: "Add Card",
  },
};

const dataStr = JSON.stringify(data, null, 2);
export const code = `import React from "react";
import { User, Upload, CreditCard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const data = ${dataStr};

export default function DialogFormExample() {
  return (
    <div className="flex flex-wrap gap-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <User className="me-2 h-4 w-4" />
            {data.editProfile.triggerText}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{data.editProfile.title}</DialogTitle>
            <DialogDescription>{data.editProfile.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">{data.editProfile.avatarInitials}</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                <Upload className="me-2 h-4 w-4" />
                {data.editProfile.changePhotoText}
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={data.editProfile.nameDefaultValue} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={data.editProfile.emailDefaultValue} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" placeholder={data.editProfile.bioPlaceholder} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{data.editProfile.cancelText}</Button>
            </DialogClose>
            <Button>{data.editProfile.saveText}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <CreditCard className="me-2 h-4 w-4" />
            {data.addPayment.triggerText}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{data.addPayment.title}</DialogTitle>
            <DialogDescription>{data.addPayment.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="card">Card Number</Label>
              <Input id="card" placeholder={data.addPayment.cardPlaceholder} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input id="expiry" placeholder={data.addPayment.expiryPlaceholder} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder={data.addPayment.cvcPlaceholder} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name-card">Name on Card</Label>
              <Input id="name-card" placeholder={data.addPayment.namePlaceholder} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{data.addPayment.cancelText}</Button>
            </DialogClose>
            <Button>{data.addPayment.submitText}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
`;
