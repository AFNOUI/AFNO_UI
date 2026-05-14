export const data = [
  { value: "all", label: "All Categories" },
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "books", label: "Books" },
  { value: "home", label: "Home & Garden" },
];

export const code = `import React from "react";
import { Search } from "lucide-react";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const categories = ${JSON.stringify(data, null, 2)};

export default function CompositeInputSearchExample() {
  return (
    <div className="max-w-lg space-y-2">
      <Label>Search Products</Label>
      <div className="flex">
        <Select defaultValue="all">
          <SelectTrigger className="w-[140px] rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <Input placeholder="Search products..." className="rounded-none" />
        </div>
        <Button className="rounded-l-none">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
`;