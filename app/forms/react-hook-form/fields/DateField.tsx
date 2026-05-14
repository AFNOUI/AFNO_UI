import { useFormContext } from "react-hook-form";
import { format } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { DateFieldConfig } from "../../types/types";
import { HeaderlessMonth } from "../../utils/dateSerialize";
import {
  AMPM_VALUES,
  buildDateDisabler,
  generateYears,
  getDateFieldFormatString,
  HOUR_12_ITEMS,
  HOUR_24_ITEMS,
  MIN_60_ITEMS,
  MONTHS,
  stampPickedDay,
  to24Hour,
} from "../../utils/dateFieldHelpers";

import {
  FormItem,
  FormField,
  FormLabel,
  FormMessage,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DateFieldProps {
  config: DateFieldConfig;
}

/** Time scroll picker component */
function TimeScroller({
  value,
  items,
  onChange,
  label,
}: {
  value: number;
  items: readonly number[];
  onChange: (v: number) => void;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const el = ref.current.querySelector(`[data-value="${value}"]`);
      el?.scrollIntoView({ block: "center", behavior: "auto" });
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">{label}</span>
      <ScrollArea className="h-[320px] w-14" ref={ref}>
        <div className="flex flex-col items-center py-2">
          {items.map((i) => (
            <button
              key={i}
              type="button"
              data-value={i}
              onClick={() => onChange(i)}
              className={cn(
                "w-10 h-8 rounded-md text-sm font-medium transition-colors flex items-center justify-center",
                i === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {String(i).padStart(2, "0")}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

/** AM/PM selector */
function AmPmSelector({ value, onChange }: { value: "AM" | "PM"; onChange: (v: "AM" | "PM") => void }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">&nbsp;</span>
      <div className="flex flex-col gap-1 mt-2">
        {AMPM_VALUES.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-colors",
              v === value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DateField({ config }: DateFieldProps) {
  const form = useFormContext();

  const showTime = config.showTime ?? false;
  const showSeconds = showTime && (config.showSeconds ?? false);
  const timeFormat = config.timeFormat ?? "24h";
  const fromYear = config.fromYear ?? 1920;
  const toYear = config.toYear ?? 2100;
  const years = useMemo(() => generateYears(fromYear, toYear), [fromYear, toYear]);

  // Watch linked date fields for min/max constraints
  const minDateFieldValue = config.minDateField ? form.watch(config.minDateField) : undefined;
  const maxDateFieldValue = config.maxDateField ? form.watch(config.maxDateField) : undefined;

  const minDate = useMemo(
    () => (minDateFieldValue ? new Date(minDateFieldValue) : config.minDate),
    [minDateFieldValue, config.minDate],
  );
  const maxDate = useMemo(
    () => (maxDateFieldValue ? new Date(maxDateFieldValue) : config.maxDate),
    [maxDateFieldValue, config.maxDate],
  );

  const disabler = useMemo(
    () => buildDateDisabler(config, minDate, maxDate),
    [config, minDate, maxDate],
  );

  // Calendar month navigation state
  const [calMonth, setCalMonth] = useState<Date>(new Date());

  // Auto-clear if linked date makes current value invalid
  useEffect(() => {
    const val = form.getValues(config.name);
    if (!val) return;
    const current = new Date(val);
    if (!Number.isNaN(current.getTime()) && disabler(current)) {
      form.setValue(config.name, '', { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minDateFieldValue, maxDateFieldValue]);

  const formatStr = useMemo(
    () => getDateFieldFormatString({ showTime, showSeconds, timeFormat }),
    [showTime, showSeconds, timeFormat],
  );

  return (
    <FormField
      control={form.control}
      name={config.name}
      render={({ field }) => {
        const currentDate = field.value ? new Date(field.value) : undefined;
        const hours = currentDate ? currentDate.getHours() : 0;
        const minutes = currentDate ? currentDate.getMinutes() : 0;
        const seconds = currentDate ? currentDate.getSeconds() : 0;
        const is12h = timeFormat === "12h";
        const displayHour = is12h ? (hours % 12 || 12) : hours;
        const ampm: "AM" | "PM" = hours >= 12 ? "PM" : "AM";

        const setTime = (h: number, m: number, s: number) => {
          const d = new Date(currentDate ?? new Date());
          d.setHours(h, m, s, 0);
          field.onChange(d.toISOString());
        };

        const handleHourChange = (h: number) =>
          setTime(is12h ? to24Hour(h, ampm) : h, minutes, seconds);
        const handleAmPmChange = (period: "AM" | "PM") =>
          setTime(to24Hour(displayHour, period), minutes, seconds);

        return (
          <FormItem className={cn("flex flex-col", config.className)}>
            {config.label && (
              <FormLabel>
                {config.label}
                {config.required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                    disabled={config.disabled}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {currentDate ? (
                      format(currentDate, formatStr)
                    ) : (
                      <span>{config.placeholder || (showTime ? "Pick date & time" : "Pick a date")}</span>
                    )}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="flex">
                  <div className="flex flex-col">
                    {/* Month/Year dropdown navigation */}
                    <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        type="button"
                        onClick={() => setCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
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
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <Calendar
                      mode="single"
                      month={calMonth}
                      onMonthChange={setCalMonth}
                      selected={currentDate}
                      onSelect={(date) => {
                        if (!date) { field.onChange(''); return; }
                        field.onChange(stampPickedDay(date, currentDate ?? new Date()).toISOString());
                      }}
                      disabled={disabler}
                      className="p-3 pointer-events-auto"
                      components={{ Month: HeaderlessMonth }}
                    />
                  </div>

                  {/* Time Picker — height aligned with calendar */}
                  {showTime && (
                    <div className="border-l border-border flex items-stretch">
                      <div className="flex items-start gap-0 px-2 pt-3 pb-3">
                        <TimeScroller
                          value={is12h ? displayHour : hours}
                          items={is12h ? HOUR_12_ITEMS : HOUR_24_ITEMS}
                          onChange={handleHourChange}
                          label="Hr"
                        />
                        <TimeScroller
                          value={minutes}
                          items={MIN_60_ITEMS}
                          onChange={(m) => setTime(hours, m, seconds)}
                          label="Min"
                        />
                        {showSeconds && (
                          <TimeScroller
                            value={seconds}
                            items={MIN_60_ITEMS}
                            onChange={(s) => setTime(hours, minutes, s)}
                            label="Sec"
                          />
                        )}
                        {is12h && (
                          <AmPmSelector value={ampm} onChange={handleAmPmChange} />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {config.description && <FormDescription>{config.description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
