export const data = {
  profile: {
    initials: "JD",
    name: "John Doe",
    title: "Software Engineer",
    lastActive: "Last active 2 hours ago",
  },
  notifications: {
    title: "Notifications",
    badge: "3 new",
    message: "You have 3 unread notifications",
  },
  likes: {
    buttonLabel: "Like",
    avatars: ["JD", "AB", "CD", "+5"] as const,
    text: "8 people liked this",
  },
} as const;

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { Bell, Heart } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const data = ${dataStr};

export default function TooltipRichContentExample() {
  return (
    <div className="flex flex-wrap gap-6 justify-center py-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">User Profile</Button>
        </TooltipTrigger>
        <TooltipContent className="w-64 p-3" side="bottom" showArrow>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
              {data.profile.initials}
            </div>
            <div>
              <p className="font-semibold text-sm">{data.profile.name}</p>
              <p className="text-xs text-muted-foreground">{data.profile.title}</p>
              <p className="text-xs mt-1">{data.profile.lastActive}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="w-48 p-3" side="bottom" showArrow>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">{data.notifications.title}</span>
              <Badge variant="secondary" className="text-xs">
                {data.notifications.badge}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {data.notifications.message}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">
            <Heart className="me-2 h-4 w-4" /> {data.likes.buttonLabel}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="p-3" side="bottom" showArrow>
          <div className="flex -space-x-2">
            {data.likes.avatars.map((initial, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full bg-muted border-2 border-popover flex items-center justify-center text-xs font-medium"
              >
                {initial}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {data.likes.text}
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
`;

