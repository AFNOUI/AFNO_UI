import { format } from "date-fns";
import { useState, useMemo } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function generateYears(from: number, to: number): number[] {
  const years: number[] = [];
  for (let y = from; y <= to; y++) years.push(y);
  return years;
}

interface DatePickerInputProps {
  value: string; // ISO string or empty
  onChange: (isoString: string) => void;
  label?: string;
  placeholder?: string;
}

/** Custom date picker matching the form preview calendar UI */
export function DatePickerInput({ value, onChange, label, placeholder }: DatePickerInputProps) {
  const currentDate = value ? new Date(value) : undefined;
  const [calMonth, setCalMonth] = useState<Date>(currentDate || new Date());
  const years = useMemo(() => generateYears(1920, 2100), []);

  return (
    <div className="space-y-1">
      {label && <Label className="text-xs">{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full h-8 ps-2 text-start text-sm font-normal justify-start",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="me-1.5 h-3.5 w-3.5 opacity-50" />
            {currentDate ? format(currentDate, "dd/MM/yyyy") : <span>{placeholder || "Pick a date"}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col">
            {/* Month/Year navigation */}
            <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                type="button"
                onClick={() => setCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
              >
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              </Button>
              <div className="flex items-center gap-1">
                <Select
                  value={String(calMonth.getMonth())}
                  onValueChange={(v) => setCalMonth(prev => new Date(prev.getFullYear(), Number(v)))}
                >
                  <SelectTrigger className="h-8 w-[110px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={m} value={String(i)} className="text-xs">{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={String(calMonth.getFullYear())}
                  onValueChange={(v) => setCalMonth(prev => new Date(Number(v), prev.getMonth()))}
                >
                  <SelectTrigger className="h-8 w-[80px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {years.map((y) => (
                        <SelectItem key={y} value={String(y)} className="text-xs">{y}</SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                type="button"
                onClick={() => setCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
              >
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>

            <Calendar
              mode="single"
              month={calMonth}
              onMonthChange={setCalMonth}
              selected={currentDate}
              onSelect={(date) => {
                onChange(date ? date.toISOString() : '');
              }}
              className="p-3 pointer-events-auto"
              classNames={{
                caption: "hidden",
              }}
            />

            {/* Clear / Today buttons */}
            <div className="flex items-center justify-between px-3 pb-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                type="button"
                onClick={() => onChange('')}
              >
                Clear
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary"
                type="button"
                onClick={() => {
                  const today = new Date();
                  setCalMonth(today);
                  onChange(today.toISOString());
                }}
              >
                Today
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
