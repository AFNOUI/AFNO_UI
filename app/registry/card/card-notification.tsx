export const data = [
  { avatar: "JD", name: "John Doe", action: "liked your post", time: "2m ago", unread: true },
  { avatar: "SM", name: "Sarah Miller", action: "commented on your photo", time: "1h ago", unread: true },
  { avatar: "AB", name: "Alex Brown", action: "started following you", time: "3h ago", unread: false },
  { avatar: "TC", name: "Tom Chen", action: "mentioned you in a comment", time: "5h ago", unread: false },
];

export const code = `import React from "react";
import { Bell } from "lucide-react";
import {
  Card,
  CardTitle,
  CardFooter,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const data = ${JSON.stringify(data, null, 2)};

export default function CardNotificationExample() {
  return (
    <Card className="max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
          <Button variant="ghost" size="sm">Mark all read</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((notification, i) => (
          <div
            key={i}
            className={\`flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-muted/50 \${notification.unread ? 'bg-primary/5' : ''}\`}
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs">{notification.avatar}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">{notification.name}</span>{" "}
                <span className="text-muted-foreground">{notification.action}</span>
              </p>
              <p className="text-xs text-muted-foreground">{notification.time}</p>
            </div>
            {notification.unread && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">View All Notifications</Button>
      </CardFooter>
    </Card>
  );
}
`;