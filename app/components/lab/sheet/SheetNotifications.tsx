"use client";

import { Bell } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/sheet/sheet-notifications";

export function SheetNotifications() {
  return (
    <ComponentInstall
      category="sheet"
      variant="sheet-notifications"
      title="Notifications Panel"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n// Notifications sheet`}
      fullCode={code}
    >
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{data.title}</SheetTitle>
            <SheetDescription>{data.description}</SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-200px)] mt-4">
            <div className="space-y-4">
              {data.items.map((notification, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-3 rounded-lg hover:bg-muted cursor-pointer"
                >
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary shrink-0" />
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {notification.desc}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              Mark all as read
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </ComponentInstall>
  );
}
