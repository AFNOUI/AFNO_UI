"use client";

import { Menu, User, Settings, Bell, ShoppingCart } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/sheet/sheet-mobile-nav";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  User,
  Settings,
  Bell,
  ShoppingCart,
};

export function SheetMobileNav() {
  return (
    <ComponentInstall
      category="sheet"
      variant="sheet-mobile-nav"
      title="Mobile Navigation"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n// Nav sheet with icons`}
      fullCode={code}
    >
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
                <Button
                  key={item.label}
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <Icon className="me-2 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </ComponentInstall>
  );
}
