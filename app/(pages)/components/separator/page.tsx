"use client";

// import { useTranslation } from "react-i18next";
import { Home, Settings, User, Mail, Bell, LogOut } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import CodePreview from "@/components/lab/CodePreview";
import { SectionTitle } from "@/components/lab/SectionTitle";
import Link from "next/link";

export default function SeparatorPage() {
  // const { t } = useTranslation();

  const basicCode = `import { Separator } from "@/components/ui/separator";

<div>
  <div className="space-y-1">
    <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
    <p className="text-sm text-muted-foreground">
      An open-source UI component library.
    </p>
  </div>
  <Separator className="my-4" />
  <div className="flex h-5 items-center space-x-4 text-sm">
    <div>Blog</div>
    <Separator orientation="vertical" />
    <div>Docs</div>
    <Separator orientation="vertical" />
    <div>Source</div>
  </div>
</div>`;

  return (
    <div className="space-y-6">
      <SectionTitle>Separators</SectionTitle>

      <CodePreview title="Basic Separator" code={basicCode}>
        <div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
            <p className="text-sm text-muted-foreground">
              An open-source UI component library.
            </p>
          </div>
          <Separator className="my-4" />
          <div className="flex h-5 items-center space-x-4 text-sm">
            <div>Blog</div>
            <Separator orientation="vertical" />
            <div>Docs</div>
            <Separator orientation="vertical" />
            <div>Source</div>
          </div>
        </div>
      </CodePreview>

      <CodePreview title="Horizontal Separator" code={`// Horizontal separator between sections`}>
        <div className="max-w-md space-y-4">
          <div>
            <h3 className="font-semibold">Account Settings</h3>
            <p className="text-sm text-muted-foreground">
              Manage your account preferences and settings.
            </p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold">Privacy</h3>
            <p className="text-sm text-muted-foreground">
              Control who can see your profile and activity.
            </p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Choose what notifications you want to receive.
            </p>
          </div>
        </div>
      </CodePreview>

      <CodePreview title="Vertical Separator" code={`// Vertical separator between buttons`}>
        <div className="flex h-10 items-center space-x-4">
          <Button variant="outline" size="sm">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
          <Separator orientation="vertical" />
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Separator orientation="vertical" />
          <Button variant="outline" size="sm">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
        </div>
      </CodePreview>

      <CodePreview title="Navigation Separator" code={`// Separator in navigation menu`}>
        <div className="rounded-lg border p-2 w-64">
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Mail className="mr-2 h-4 w-4" />
              Messages
              <Badge className="ml-auto" variant="secondary">5</Badge>
            </Button>
          </div>
          <Separator className="my-2" />
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Button>
          </div>
          <Separator className="my-2" />
          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </CodePreview>

      <CodePreview title="With Label" code={`// Separator with centered text label`}>
        <div className="max-w-md">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
        </div>
      </CodePreview>

      <CodePreview title="Profile Card Separator" code={`// Separator in profile card`}>
        <div className="rounded-lg border p-6 max-w-sm">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">John Doe</p>
              <p className="text-sm text-muted-foreground">john@example.com</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between text-sm">
            <div className="text-center">
              <p className="font-semibold">128</p>
              <p className="text-muted-foreground">Posts</p>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div className="text-center">
              <p className="font-semibold">1.2k</p>
              <p className="text-muted-foreground">Followers</p>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div className="text-center">
              <p className="font-semibold">384</p>
              <p className="text-muted-foreground">Following</p>
            </div>
          </div>
        </div>
      </CodePreview>

      <CodePreview title="Form Section Separator" code={`// Separator between form sections`}>
        <div className="max-w-md space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 rounded-md bg-muted" />
              <div className="h-10 rounded-md bg-muted" />
            </div>
          </div>

          <div className="relative py-2">
            <Separator />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Details</h3>
            <div className="space-y-4">
              <div className="h-10 rounded-md bg-muted" />
              <div className="h-10 rounded-md bg-muted" />
            </div>
          </div>

          <div className="relative py-2">
            <Separator />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Preferences</h3>
            <div className="h-10 rounded-md bg-muted" />
          </div>
        </div>
      </CodePreview>

      <CodePreview title="Footer Links" code={`// Footer with vertical separators`}>
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
          <Link href="#" className="hover:text-foreground transition-colors">About</Link>
          <Separator orientation="vertical" className="h-4" />
          <Link href="#" className="hover:text-foreground transition-colors">Blog</Link>
          <Separator orientation="vertical" className="h-4" />
          <Link href="#" className="hover:text-foreground transition-colors">Careers</Link>
          <Separator orientation="vertical" className="h-4" />
          <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
          <Separator orientation="vertical" className="h-4" />
          <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
        </div>
      </CodePreview>
    </div>
  );
}
