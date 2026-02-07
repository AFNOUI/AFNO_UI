"use client";

// import { useTranslation } from "react-i18next";
import { Menu, Settings, User, ShoppingCart, Filter, Bell, Trash2 } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetTitle,
  SheetFooter,
  SheetHeader,
  SheetContent,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import CodePreview from "@/components/lab/CodePreview";
import { SectionTitle } from "@/components/lab/SectionTitle";

export default function SheetPage() {
  // const { t } = useTranslation();

  const basicCode = `import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet";
  
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline">Open</Button>
    </SheetTrigger>
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Edit profile</SheetTitle>
        <SheetDescription>
          Make changes to your profile here.
        </SheetDescription>
      </SheetHeader>
      <div className="grid gap-4 py-4">
        <Input id="name" placeholder="Name" />
        <Input id="username" placeholder="Username" />
      </div>
      <SheetFooter>
        <Button type="submit">Save changes</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>`;

  const cartItems = [
    { name: "Product 1", price: 29.99, qty: 2 },
    { name: "Product 2", price: 49.99, qty: 1 },
    { name: "Product 3", price: 19.99, qty: 3 },
  ];

  const notifications = [
    { title: "New message", desc: "You have a new message from John", time: "5m ago" },
    { title: "Order shipped", desc: "Your order #1234 has been shipped", time: "1h ago" },
    { title: "Payment received", desc: "Payment of $99.00 received", time: "2h ago" },
    { title: "New follower", desc: "Sarah started following you", time: "3h ago" },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle>Sheet (Slide-over Panel)</SectionTitle>

      <CodePreview title="Right Side Sheet" code={basicCode}>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Open Right Sheet</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit profile</SheetTitle>
              <SheetDescription>
                Make changes to your profile here. Click save when you&apos;re done.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" defaultValue="John Doe" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input id="username" defaultValue="@johndoe" className="col-span-3" />
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button type="submit">Save changes</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </CodePreview>

      <CodePreview title="Side Variations" code={`// Sheet from different sides`}>
        <div className="flex flex-wrap gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Left</Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Left Sheet</SheetTitle>
                <SheetDescription>
                  This sheet opens from the left side.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Right</Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Right Sheet</SheetTitle>
                <SheetDescription>
                  This sheet opens from the right side.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Top</Button>
            </SheetTrigger>
            <SheetContent side="top">
              <SheetHeader>
                <SheetTitle>Top Sheet</SheetTitle>
                <SheetDescription>
                  This sheet opens from the top.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Bottom</Button>
            </SheetTrigger>
            <SheetContent side="bottom">
              <SheetHeader>
                <SheetTitle>Bottom Sheet</SheetTitle>
                <SheetDescription>
                  This sheet opens from the bottom.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      </CodePreview>

      <CodePreview title="Mobile Navigation" code={`// Mobile navigation menu sheet`}>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px]">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>Mobile navigation menu sheet</SheetDescription>
            </SheetHeader>
            <div className="py-4 space-y-1">
              {[
                { icon: User, label: "Profile" },
                { icon: Settings, label: "Settings" },
                { icon: Bell, label: "Notifications" },
                { icon: ShoppingCart, label: "Cart" },
              ].map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </CodePreview>

      <CodePreview title="Shopping Cart" code={`// E-commerce cart sheet`}>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Cart
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                3
              </Badge>
            </Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col">
            <SheetHeader>
              <SheetTitle>Shopping Cart</SheetTitle>
              <SheetDescription>
                You have 3 items in your cart
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-1 my-4">
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                      📦
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.qty}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(item.price * item.qty).toFixed(2)}</p>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator />
            <div className="pt-4 space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>$169.94</span>
              </div>
              <Button className="w-full">Checkout</Button>
            </div>
          </SheetContent>
        </Sheet>
      </CodePreview>

      <CodePreview title="Filter Panel" code={`// Filter sheet for product listings`}>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Narrow down your search results
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <Label>Price Range</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Min" type="number" />
                  <Input placeholder="Max" type="number" />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Category</Label>
                <div className="space-y-2">
                  {["Electronics", "Clothing", "Books", "Home"].map((cat) => (
                    <div key={cat} className="flex items-center gap-2">
                      <input type="checkbox" id={cat} className="rounded" />
                      <label htmlFor={cat} className="text-sm">{cat}</label>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="space-y-2">
                  {["4 stars & up", "3 stars & up", "2 stars & up", "1 star & up"].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <input type="radio" name="rating" id={rating} />
                      <label htmlFor={rating} className="text-sm">{rating}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <SheetFooter>
              <Button variant="outline" className="flex-1">Clear All</Button>
              <SheetClose asChild>
                <Button className="flex-1">Apply Filters</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </CodePreview>

      <CodePreview title="Notifications Panel" code={`// Notifications sheet`}>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Notifications</SheetTitle>
              <SheetDescription>
                You have 4 unread notifications
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-200px)] mt-4">
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                  <div key={index} className="flex gap-4 p-3 rounded-lg hover:bg-muted cursor-pointer">
                    <div className="h-2 w-2 mt-2 rounded-full bg-primary shrink-0" />
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.desc}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="mt-4">
              <Button variant="outline" className="w-full">Mark all as read</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </CodePreview>
    </div>
  );
}
