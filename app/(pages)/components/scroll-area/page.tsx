"use client";

// import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import CodePreview from "@/components/lab/CodePreview";
import { SectionTitle } from "@/components/lab/SectionTitle";

const tags = Array.from({ length: 50 }).map((_, i) => `v1.2.0-beta.${i}`);

const notifications = [
  { title: "Your call has been confirmed.", time: "1 hour ago" },
  { title: "You have a new message!", time: "2 hours ago" },
  { title: "Your subscription is expiring soon!", time: "5 hours ago" },
  { title: "Payment received successfully.", time: "1 day ago" },
  { title: "New feature available.", time: "2 days ago" },
  { title: "Weekly report is ready.", time: "3 days ago" },
  { title: "Security update applied.", time: "4 days ago" },
  { title: "Team member joined.", time: "5 days ago" },
];

const artworks = [
  { title: "Abstract Waves", artist: "John Doe", price: "$299" },
  { title: "Mountain Sunset", artist: "Jane Smith", price: "$450" },
  { title: "City Nights", artist: "Mike Chen", price: "$375" },
  { title: "Ocean Dreams", artist: "Sarah Lee", price: "$520" },
  { title: "Forest Path", artist: "Tom Wilson", price: "$280" },
  { title: "Desert Storm", artist: "Anna Brown", price: "$390" },
];

export default function ScrollAreaPage() {
  // const { t } = useTranslation();

  const basicCode = `import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

<ScrollArea className="h-72 w-48 rounded-md border">
  <div className="p-4">
    <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
    {tags.map((tag) => (
      <React.Fragment key={tag}>
        <div className="text-sm">{tag}</div>
        <Separator className="my-2" />
      </React.Fragment>
    ))}
  </div>
</ScrollArea>`;

  return (
    <div className="space-y-6">
      <SectionTitle>Scroll Area</SectionTitle>

      <CodePreview title="Basic Scroll Area" code={basicCode}>
        <ScrollArea className="h-72 w-48 rounded-md border">
          <div className="p-4">
            <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
            {tags.map((tag) => (
              <div key={tag}>
                <div className="text-sm">{tag}</div>
                <Separator className="my-2" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CodePreview>

      <CodePreview title="Notifications List" code={`// Notifications scroll area`}>
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px] px-4">
              <div className="space-y-4 pb-4">
                {notifications.map((notification, index) => (
                  <div key={index} className="flex items-start gap-4 rounded-lg border p-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </CodePreview>

      <CodePreview title="Horizontal Scroll" code={`// Horizontal scroll area with artwork gallery`}>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <div className="flex w-max space-x-4 p-4">
            {artworks.map((artwork, index) => (
              <figure key={index} className="shrink-0">
                <div className="overflow-hidden rounded-md">
                  <div className="aspect-3/4 w-[150px] bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Star className="h-8 w-8 text-primary/50" />
                  </div>
                </div>
                <figcaption className="pt-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {artwork.title}
                  </span>
                  <br />
                  {artwork.artist} · {artwork.price}
                </figcaption>
              </figure>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CodePreview>

      <CodePreview title="Code Block" code={`// Code block with scroll`}>
        <ScrollArea className="h-[200px] w-full max-w-lg rounded-md border bg-muted/50">
          <pre className="p-4 text-sm font-mono">
            <code>{`import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return { users, loading, error };
}

export default useUsers;`}</code>
          </pre>
        </ScrollArea>
      </CodePreview>

      <CodePreview title="Chat Messages" code={`// Chat scroll area`}>
        <Card className="w-[350px]">
          <CardHeader className="border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Team Chat
            </CardTitle>
          </CardHeader>
          <ScrollArea className="h-[250px]">
            <div className="p-4 space-y-4">
              {[
                { sender: "Alice", message: "Hey team! 👋", time: "10:30 AM", isMe: false },
                { sender: "You", message: "Hi Alice! How's the project going?", time: "10:32 AM", isMe: true },
                { sender: "Alice", message: "Going well! Just finished the design review.", time: "10:33 AM", isMe: false },
                { sender: "Bob", message: "Great work everyone!", time: "10:35 AM", isMe: false },
                { sender: "You", message: "Thanks! Let's sync up later today.", time: "10:36 AM", isMe: true },
                { sender: "Alice", message: "Sounds good. How about 3 PM?", time: "10:38 AM", isMe: false },
                { sender: "You", message: "Perfect! 👍", time: "10:39 AM", isMe: true },
              ].map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`rounded-lg px-3 py-2 max-w-[80%] ${msg.isMe
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                      }`}
                  >
                    {!msg.isMe && (
                      <p className="text-xs font-medium mb-1">{msg.sender}</p>
                    )}
                    <p className="text-sm">{msg.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </CodePreview>

      <CodePreview title="Both Directions" code={`// Scroll area with both scrollbars`}>
        <ScrollArea className="h-[200px] w-[350px] rounded-md border">
          <div className="p-4">
            <table className="w-[500px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">ID</th>
                  <th className="text-left p-2 font-medium">Name</th>
                  <th className="text-left p-2 font-medium">Email</th>
                  <th className="text-left p-2 font-medium">Status</th>
                  <th className="text-left p-2 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 15 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2 text-sm">{i + 1}</td>
                    <td className="p-2 text-sm">User {i + 1}</td>
                    <td className="p-2 text-sm">user{i + 1}@example.com</td>
                    <td className="p-2">
                      <Badge variant={i % 2 === 0 ? "default" : "secondary"}>
                        {i % 2 === 0 ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-2 text-sm">{i % 3 === 0 ? "Admin" : "User"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CodePreview>
    </div>
  );
}
