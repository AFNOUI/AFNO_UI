export const data = {
  triggerIcon: "Settings",
  triggerText: "Settings",
  title: "Settings",
  description: "Manage your account settings and preferences.",
  items: [
    {
      label: "Email Notifications",
      description: "Receive emails about your account activity.",
      defaultChecked: true,
    },
    {
      label: "Push Notifications",
      description: "Receive push notifications on your device.",
      defaultChecked: false,
    },
    {
      label: "Marketing Emails",
      description: "Receive emails about new features and updates.",
      defaultChecked: false,
    },
    {
      label: "Two-Factor Authentication",
      description: "Add an extra layer of security to your account.",
      defaultChecked: true,
    },
  ],
  cancelText: "Cancel",
  saveText: "Save Preferences",
};

const dataStr = JSON.stringify(data, null, 2);
export const code = `import React from "react";
import { Settings } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const data = ${dataStr};

export default function DialogSettingsExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="me-2 h-4 w-4" />
          {data.triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{data.title}</DialogTitle>
          <DialogDescription>{data.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {data.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{item.label}</Label>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Switch defaultChecked={item.defaultChecked} />
            </div>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{data.cancelText}</Button>
          </DialogClose>
          <Button>{data.saveText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
`;
