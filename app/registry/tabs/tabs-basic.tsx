export const data = {
  defaultValue: "account",
  tabs: [
    {
      value: "account",
      icon: "user",
      title: "Account",
      description: "Make changes to your account here.",
      fields: [
        { id: "name", label: "Name", defaultValue: "John Doe" },
        { id: "username", label: "Username", defaultValue: "@johndoe" },
      ],
      primaryAction: "Save changes",
    },
    {
      value: "password",
      icon: "lock",
      title: "Password",
      description: "Change your password here.",
      fields: [
        { id: "current", label: "Current password", type: "password" },
        { id: "new", label: "New password", type: "password" },
      ],
      primaryAction: "Update password",
    },
    {
      value: "settings",
      icon: "settings",
      title: "Settings",
      description: "Manage your preferences.",
      notificationTitle: "Notifications",
      notificationDescription: "Receive email notifications",
    },
  ] as const,
} as const;

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { Lock, Settings, User } from "lucide-react";

import {
  Card,
  CardTitle,
  CardFooter,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Field = { id: string; label: string; defaultValue?: string; type?: string };
type Tab = {
  value: string;
  icon: string;
  title: string;
  description: string;
  fields?: Field[];
  primaryAction?: string;
  notificationTitle?: string;
  notificationDescription?: string;
};

const data: { defaultValue: string; tabs: Tab[] } = ${dataStr};

export default function TabsBasicExample() {
  return (
    <Tabs defaultValue={data.defaultValue} className="w-full max-w-lg">
      <TabsList className="grid w-full grid-cols-3">
        {data.tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.icon === "user" && <User className="me-2 h-4 w-4" />}
            {tab.icon === "lock" && <Lock className="me-2 h-4 w-4" />}
            {tab.icon === "settings" && <Settings className="me-2 h-4 w-4" />}
            {tab.title}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="account" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>{data.tabs[0].title}</CardTitle>
            <CardDescription>{data.tabs[0].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.tabs[0]?.fields?.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                <Input id={field.id} defaultValue={field.defaultValue} />
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button>{data.tabs[0]?.primaryAction}</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="password" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>{data.tabs[1]?.title}</CardTitle>
            <CardDescription>{data.tabs[1]?.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.tabs[1]?.fields?.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                <Input id={field.id} type={field.type} />
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button>{data.tabs[1]?.primaryAction}</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="settings" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>{data.tabs[2]?.title}</CardTitle>
            <CardDescription>{data.tabs[2]?.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{data.tabs[2]?.notificationTitle}</p>
                <p className="text-sm text-muted-foreground">
                  {data.tabs[2]?.notificationDescription}
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
`;

