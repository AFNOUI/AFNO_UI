"use client";

import { useState } from "react";
// import { useTranslation } from "react-i18next";
import {
  Settings, User, Bell, ChevronDown,
  Calendar as CalendarIcon, Share2, Copy, Mail, X, Link2
} from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";

import CodePreview from "@/components/lab/CodePreview";
import { SectionTitle } from "@/components/lab/SectionTitle";

export default function PopoverPage() {
  // const { t } = useTranslation();

  const [date, setDate] = useState<Date>();
  const [notifications, setNotifications] = useState({
    sms: false,
    email: true,
    push: false,
  });

  const basicCode = `import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open popover</Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    <div className="grid gap-4">
      <h4 className="font-medium">Dimensions</h4>
      <div className="grid gap-2">
        <Label htmlFor="width">Width</Label>
        <Input id="width" defaultValue="100%" />
      </div>
    </div>
  </PopoverContent>
</Popover>`;

  const formCode = `<PopoverContent className="w-80">
  <div className="space-y-4">
    <h4 className="font-medium">Edit Profile</h4>
    <div className="space-y-2">
      <Label>Name</Label>
      <Input defaultValue="John Doe" />
    </div>
    <Button className="w-full">Save</Button>
  </div>
</PopoverContent>`;

  return (
    <div className="space-y-8">
      <SectionTitle>Popover</SectionTitle>

      {/* Basic Popover */}
      <CodePreview title="Basic Popover" code={basicCode}>
        <div className="flex flex-wrap gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Open Popover</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Dimensions</h4>
                  <p className="text-sm text-muted-foreground">
                    Set the dimensions for the layer.
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="width">Width</Label>
                    <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="height">Height</Label>
                    <Input id="height" defaultValue="25px" className="col-span-2 h-8" />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-1">
                <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent">
                  <User className="h-4 w-4" /> Profile
                </button>
                <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent">
                  <Bell className="h-4 w-4" /> Notifications
                </button>
                <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent">
                  <Settings className="h-4 w-4" /> Settings
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CodePreview>

      {/* Popover Positions */}
      <CodePreview title="Popover Positions" code={`<PopoverContent side="top" align="start">...</PopoverContent>`}>
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto py-8">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">Top Start</Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" className="w-40">
              <p className="text-sm">Top start aligned</p>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">Top</Button>
            </PopoverTrigger>
            <PopoverContent side="top" className="w-40">
              <p className="text-sm">Top center aligned</p>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">Top End</Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="end" className="w-40">
              <p className="text-sm">Top end aligned</p>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">Left</Button>
            </PopoverTrigger>
            <PopoverContent side="left" className="w-40">
              <p className="text-sm">Left aligned</p>
            </PopoverContent>
          </Popover>

          <div />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">Right</Button>
            </PopoverTrigger>
            <PopoverContent side="right" className="w-40">
              <p className="text-sm">Right aligned</p>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">Bottom Start</Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" className="w-40">
              <p className="text-sm">Bottom start</p>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">Bottom</Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" className="w-40">
              <p className="text-sm">Bottom center</p>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">Bottom End</Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end" className="w-40">
              <p className="text-sm">Bottom end</p>
            </PopoverContent>
          </Popover>
        </div>
      </CodePreview>

      {/* Date Picker Popover */}
      <CodePreview title="Date Picker Popover" code={`<Calendar mode="single" selected={date} onSelect={setDate} />`}>
        <div className="flex flex-wrap gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? date.toLocaleDateString() : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </CodePreview>

      {/* Form Popover */}
      <CodePreview title="Form in Popover" code={formCode}>
        <div className="flex flex-wrap gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button>Edit Profile</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Edit Profile</h4>
                  <p className="text-sm text-muted-foreground">
                    Make changes to your profile here.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue="john@example.com" />
                </div>
                <Button className="w-full">Save Changes</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CodePreview>

      {/* Notification Settings Popover */}
      <CodePreview title="Settings Popover" code={`// Notification settings with switches`}>
        <div className="flex flex-wrap gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
                <Badge variant="secondary" className="ml-2">3</Badge>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Notification Preferences</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive emails about activity</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(v) => setNotifications({ ...notifications, email: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive push on your device</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(v) => setNotifications({ ...notifications, push: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive SMS messages</p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(v) => setNotifications({ ...notifications, sms: v })}
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CodePreview>

      {/* Share Popover */}
      <CodePreview title="Share Popover" code={`// Social sharing popover`}>
        <div className="flex flex-wrap gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="space-y-4">
                <h4 className="font-medium">Share this page</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="flex-1">
                    <X className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="flex-1">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="flex-1">
                    <Link2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value="https://example.com/page"
                    className="text-xs"
                  />
                  <Button size="icon" variant="secondary">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CodePreview>

      {/* Slider Popover */}
      <CodePreview title="Slider in Popover" code={`// Volume/zoom controls`}>
        <div className="flex flex-wrap gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                Volume <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Volume</Label>
                  <span className="text-sm text-muted-foreground">75%</span>
                </div>
                <Slider defaultValue={[75]} max={100} step={1} />
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                Zoom <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Zoom Level</Label>
                  <span className="text-sm text-muted-foreground">100%</span>
                </div>
                <Slider defaultValue={[100]} min={25} max={200} step={25} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>25%</span>
                  <span>100%</span>
                  <span>200%</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CodePreview>
    </div>
  );
}
