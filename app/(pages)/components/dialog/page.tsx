"use client";


import { useState } from "react";
// import { useTranslation } from "react-i18next";
import {
  AlertTriangle, Trash2, Settings, User, Mail,
  CreditCard, Check, X, Upload, Image as ImageIcon, FileText
} from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import CodePreview from "@/components/lab/CodePreview";
import { SectionTitle } from "@/components/lab/SectionTitle";

export default function DialogPage() {
  // const { t } = useTranslation();

  const [showSuccess, setShowSuccess] = useState(false);

  const basicCode = `import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>`;

  return (
    <div className="space-y-8">
      <SectionTitle>Dialog</SectionTitle>

      {/* Basic Dialog */}
      <CodePreview title="Basic Dialog" code={basicCode}>
        <div className="flex flex-wrap gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Welcome to the Dialog</DialogTitle>
                <DialogDescription>
                  This is a basic dialog component. You can add any content here.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button>Continue</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CodePreview>

      {/* Confirmation Dialog */}
      <CodePreview title="Confirmation / Delete Dialog" code={`// Destructive confirmation dialog`}>
        <div className="flex flex-wrap gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <DialogTitle className="text-center">Delete Account</DialogTitle>
                <DialogDescription className="text-center">
                  Are you sure you want to delete your account? All of your data will be permanently removed. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button variant="destructive">Delete Account</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Warning Dialog
              </Button>
            </DialogTrigger>
            <DialogContent className="border-[hsl(var(--progress-warning))]">
              <DialogHeader>
                <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-[hsl(var(--progress-warning))]/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-[hsl(var(--progress-warning))]" />
                </div>
                <DialogTitle className="text-center">Unsaved Changes</DialogTitle>
                <DialogDescription className="text-center">
                  You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Stay</Button>
                </DialogClose>
                <Button className="bg-[hsl(var(--progress-warning))] hover:bg-[hsl(var(--progress-warning))]/90 text-foreground">
                  Leave Anyway
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CodePreview>

      {/* Form Dialog */}
      <CodePreview title="Form Dialog" code={`// Dialog with form inputs`}>
        <div className="flex flex-wrap gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you&apos;re done.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">JD</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Change Photo
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" placeholder="Tell us about yourself..." />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CreditCard className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
                <DialogDescription>
                  Add a new payment method to your account.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="card">Card Number</Label>
                  <Input id="card" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name-card">Name on Card</Label>
                  <Input id="name-card" placeholder="John Doe" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button>Add Card</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CodePreview>

      {/* Success Dialog */}
      <CodePreview title="Success / Status Dialog" code={`// Success feedback dialog`}>
        <div className="flex flex-wrap gap-4">
          <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
            <DialogTrigger asChild>
              <Button className="bg-[hsl(var(--progress-success))] hover:bg-[hsl(var(--progress-success))]/90">
                <Check className="mr-2 h-4 w-4" />
                Show Success
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-[hsl(var(--progress-success))]/10 flex items-center justify-center">
                  <Check className="h-8 w-8 text-[hsl(var(--progress-success))]" />
                </div>
                <DialogTitle className="text-center text-xl">Payment Successful!</DialogTitle>
                <DialogDescription className="text-center">
                  Your payment of $49.99 has been processed successfully. A confirmation email has been sent to your inbox.
                </DialogDescription>
              </DialogHeader>
              <div className="text-center py-2">
                <Badge variant="secondary" className="text-sm">Order #12345</Badge>
              </div>
              <DialogFooter className="sm:justify-center">
                <Button onClick={() => setShowSuccess(false)}>Continue Shopping</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Email Verification
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <DialogTitle className="text-center">Check Your Email</DialogTitle>
                <DialogDescription className="text-center">
                  We&apos;ve sent a verification link to <strong>john@example.com</strong>. Click the link to verify your account.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center flex-col gap-2">
                <Button className="w-full">Open Email App</Button>
                <Button variant="link" className="w-full">Resend Email</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CodePreview>

      {/* Settings Dialog */}
      <CodePreview title="Settings Dialog" code={`// Settings panel dialog`}>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>
                Manage your account settings and preferences.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive emails about your account activity.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications on your device.</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">Receive emails about new features and updates.</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button>Save Preferences</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CodePreview>

      {/* Image Upload Dialog */}
      <CodePreview title="File Upload Dialog" code={`// File upload dialog`}>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <ImageIcon className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Image</DialogTitle>
              <DialogDescription>
                Upload an image from your device. Max file size is 5MB.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer">
                <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-sm font-medium">Drop your file here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB</p>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">image.png</p>
                    <p className="text-xs text-muted-foreground">2.4 MB</p>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button>Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CodePreview>

      {/* Scrollable Dialog */}
      <CodePreview title="Scrollable Content Dialog" code={`// Dialog with scrollable content`}>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Terms of Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Terms of Service</DialogTitle>
              <DialogDescription>
                Please read our terms of service carefully.
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[40vh] pr-4 space-y-4 text-sm text-muted-foreground">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
              </p>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.
              </p>
              <p>
                At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias.
              </p>
              <p>
                Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.
              </p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Decline</Button>
              </DialogClose>
              <Button>Accept Terms</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CodePreview>
    </div>
  );
}
