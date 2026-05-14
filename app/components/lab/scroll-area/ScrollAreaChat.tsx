"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/scroll-area/scroll-area-chat";

export function ScrollAreaChat() {
  return (
    <ComponentInstall
      category="scroll-area"
      variant="scroll-area-chat"
      title="Chat Messages"
      code={`const messages = ${JSON.stringify(data, null, 2)};\n\n<ScrollArea>...`}
      fullCode={code}
    >
      <Card className="w-[350px]">
        <CardHeader className="border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            Team Chat
          </CardTitle>
        </CardHeader>
        <ScrollArea className="h-[250px]">
          <div className="p-4 space-y-4">
            {data.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] ${
                    msg.isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
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
    </ComponentInstall>
  );
}
