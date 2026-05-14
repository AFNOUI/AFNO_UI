export const data = {
  title: "Share this page",
  copyUrl: "https://example.com/page",
};

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { Share2, X, Mail, Link2, Copy } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const data = ${dataStr};

export default function PopoverShareExample() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button>
          <Share2 className="me-2 h-4 w-4" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="space-y-4">
          <h4 className="font-medium">{data.title}</h4>
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
            <Input readOnly value={data.copyUrl} className="text-xs" />
            <Button size="icon" variant="secondary">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
`;
