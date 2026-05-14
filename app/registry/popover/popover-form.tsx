export const data = {
  title: "Edit Profile",
  description: "Make changes to your profile here.",
  nameLabel: "Name",
  nameDefault: "John Doe",
  emailLabel: "Email",
  emailDefault: "john@example.com",
  saveLabel: "Save Changes",
};

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const data = ${dataStr};

export default function PopoverFormExample() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Edit Profile</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">{data.title}</h4>
            <p className="text-sm text-muted-foreground">
              {data.description}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">{data.nameLabel}</Label>
            <Input id="name" defaultValue={data.nameDefault} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{data.emailLabel}</Label>
            <Input id="email" defaultValue={data.emailDefault} />
          </div>
          <Button className="w-full">{data.saveLabel}</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
`;
