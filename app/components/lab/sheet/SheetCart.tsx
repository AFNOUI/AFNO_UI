"use client";

import { ShoppingCart, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/sheet/sheet-cart";

export function SheetCart() {
  return (
    <ComponentInstall
      category="sheet"
      variant="sheet-cart"
      title="Shopping Cart"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n// Cart sheet`}
      fullCode={code}
    >
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="relative">
            <ShoppingCart className="me-2 h-4 w-4" />
            Cart
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
              {data.badgeCount}
            </Badge>
          </Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>{data.title}</SheetTitle>
            <SheetDescription>{data.description}</SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-1 my-4">
            <div className="space-y-4">
              {data.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                    📦
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.qty}</p>
                  </div>
                  <div className="text-end">
                    <p className="font-medium">
                      ${(item.price * item.qty).toFixed(2)}
                    </p>
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
              <span>{data.total}</span>
            </div>
            <Button className="w-full">Checkout</Button>
          </div>
        </SheetContent>
      </Sheet>
    </ComponentInstall>
  );
}
