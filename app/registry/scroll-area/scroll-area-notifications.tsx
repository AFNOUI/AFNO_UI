export const data = [
  { title: "Your call has been confirmed.", time: "1 hour ago" },
  { title: "You have a new message!", time: "2 hours ago" },
  { title: "Your subscription is expiring soon!", time: "5 hours ago" },
  { title: "Payment received successfully.", time: "1 day ago" },
  { title: "New feature available.", time: "2 days ago" },
  { title: "Weekly report is ready.", time: "3 days ago" },
  { title: "Security update applied.", time: "4 days ago" },
  { title: "Team member joined.", time: "5 days ago" },
];

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const notifications = ${dataStr};

export default function ScrollAreaNotificationsExample() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="text-base">Notifications</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] px-4">
          <div className="space-y-4 pb-4">
            {notifications.map((n, i) => (
              <div key={i} className="flex items-start gap-4 rounded-lg border p-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
`;
