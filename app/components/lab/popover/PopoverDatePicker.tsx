"use client";

import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code } from "@/registry/popover/popover-date-picker";

export function PopoverDatePicker() {
  const [date, setDate] = useState<Date>();

  return (
    <ComponentInstall
      category="popover"
      variant="popover-date-picker"
      title="Date Picker Popover"
      code={'<Calendar mode="single" selected={date} onSelect={setDate} />'}
      fullCode={code}
    >
      <div className="flex flex-wrap gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-start font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="me-2 h-4 w-4" />
              {date?.toLocaleDateString() ?? "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto min-w-[280px] p-0 overflow-visible" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </ComponentInstall>
  );
}
