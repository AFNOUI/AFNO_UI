"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/scroll-area/scroll-area-notifications";

export function ScrollAreaNotifications() {
  return (
    <ComponentInstall
      category="scroll-area"
      variant="scroll-area-notifications"
      title="Notifications List"
      code={`const notifications = ${JSON.stringify(data, null, 2)};\n\n<ScrollArea>...`}
      fullCode={code}
    >
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px] px-4">
            <div className="space-y-4 pb-4">
              {data.map((notification, index) => (
                <div key={index} className="flex items-start gap-4 rounded-lg border p-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </ComponentInstall>
  );
}
