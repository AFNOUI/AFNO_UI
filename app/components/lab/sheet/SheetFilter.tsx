"use client";

import { Filter } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/sheet/sheet-filter";

export function SheetFilter() {
  return (
    <ComponentInstall
      category="sheet"
      variant="sheet-filter"
      title="Filter Panel"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n// Filter sheet`}
      fullCode={code}
    >
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">
            <Filter className="me-2 h-4 w-4" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{data.title}</SheetTitle>
            <SheetDescription>{data.description}</SheetDescription>
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
                {data.categories.map((cat) => (
                  <div key={cat} className="flex items-center gap-2">
                    <input type="checkbox" id={cat} className="rounded" />
                    <label htmlFor={cat} className="text-sm">
                      {cat}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="space-y-2">
                {data.ratings.map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <input type="radio" name="rating" id={rating} />
                    <label htmlFor={rating} className="text-sm">
                      {rating}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" className="flex-1">
              Clear All
            </Button>
            <SheetClose asChild>
              <Button className="flex-1">Apply Filters</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </ComponentInstall>
  );
}
