export const data = [
  { sender: "Alice", message: "Hey team! 👋", time: "10:30 AM", isMe: false },
  { sender: "You", message: "Hi Alice! How's the project going?", time: "10:32 AM", isMe: true },
  { sender: "Alice", message: "Going well! Just finished the design review.", time: "10:33 AM", isMe: false },
  { sender: "Bob", message: "Great work everyone!", time: "10:35 AM", isMe: false },
  { sender: "You", message: "Thanks! Let's sync up later today.", time: "10:36 AM", isMe: true },
  { sender: "Alice", message: "Sounds good. How about 3 PM?", time: "10:38 AM", isMe: false },
  { sender: "You", message: "Perfect! 👍", time: "10:39 AM", isMe: true },
];

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const messages = ${dataStr};

export default function ScrollAreaChatExample() {
  return (
    <Card className="w-[350px]">
      <CardHeader className="border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          Team Chat
        </CardTitle>
      </CardHeader>
      <ScrollArea className="h-[250px]">
        <div className="p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={\`flex flex-col \${msg.isMe ? "items-end" : "items-start"}\`}
            >
              <div
                className={\`rounded-lg px-3 py-2 max-w-[80%] \${msg.isMe ? "bg-primary text-primary-foreground" : "bg-muted"}\`}
              >
                {!msg.isMe && <p className="text-xs font-medium mb-1">{msg.sender}</p>}
                <p className="text-sm">{msg.message}</p>
              </div>
              <span className="text-xs text-muted-foreground mt-1">{msg.time}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
`;
