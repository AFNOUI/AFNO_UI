export const data = {
  title: "Navigation",
  description: "Mobile navigation menu sheet",
  navItems: [
    { icon: "User", label: "Profile" },
    { icon: "Settings", label: "Settings" },
    { icon: "Bell", label: "Notifications" },
    { icon: "ShoppingCart", label: "Cart" },
  ],
};

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import React from "react";
import { User, Settings, Bell, ShoppingCart } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const data = ${dataStr};
const icons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = { User, Settings, Bell, ShoppingCart };

export default function SheetMobileNavExample() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px]">
        <SheetHeader>
          <SheetTitle>{data.title}</SheetTitle>
          <SheetDescription>{data.description}</SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-1">
          {data.navItems.map((item) => {
            const Icon = icons[item.icon];
            return (
              <Button key={item.label} variant="ghost" className="w-full justify-start">
                <Icon className="me-2 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
`;
