export const data = {
  title: "Notifications",
  description: "You have 4 unread notifications",
  items: [
    { title: "New message", desc: "You have a new message from John", time: "5m ago" },
    { title: "Order shipped", desc: "Your order #1234 has been shipped", time: "1h ago" },
    { title: "Payment received", desc: "Payment of $99.00 received", time: "2h ago" },
    { title: "New follower", desc: "Sarah started following you", time: "3h ago" },
  ],
};

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { Bell } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const data = ${dataStr};

export default function SheetNotificationsExample() {
  return (
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
            {data.items.map((n, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-lg hover:bg-muted cursor-pointer">
                <div className="h-2 w-2 mt-2 rounded-full bg-primary shrink-0" />
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.desc}</p>
                  <p className="text-xs text-muted-foreground">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <SheetFooter className="mt-4">
          <Button variant="outline" className="w-full">Mark all as read</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
`;
