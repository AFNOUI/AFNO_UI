"use client";

import { Share2, X, Mail, Link2, Copy } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/popover/popover-share";

export function PopoverShare() {
  return (
    <ComponentInstall
      category="popover"
      variant="popover-share"
      title="Share Popover"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n// Social sharing`}
      fullCode={code}
    >
      <div className="flex flex-wrap gap-4">
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
                <Input
                  readOnly
                  value={data.copyUrl}
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
    </ComponentInstall>
  );
}
