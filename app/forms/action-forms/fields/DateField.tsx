import { format } from "date-fns";
import { useMemo, useRef, useEffect, useState } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { DateFieldConfig } from "@/forms/types/types";
import { HeaderlessMonth } from "@/forms/utils/dateSerialize";
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
} from "@/forms/utils/dateFieldHelpers";
import { useActionFormContext } from "../ActionFormContext";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";

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
    ref.current
      ?.querySelector(`[data-value="${value}"]`)
      ?.scrollIntoView({ block: "center", behavior: "auto" });
  }, [value]);
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">
        {label}
      </span>
      <ScrollArea className="h-[260px] w-14" ref={ref}>
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
                  : "text-muted-foreground hover:bg-accent",
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
export function DateField({ config }: { config: DateFieldConfig }) {
  const { values, errors, setValue, watch } = useActionFormContext();
  const v = values[config.name] as string;
  const showTime = config.showTime ?? false;
  const showSeconds = showTime && (config.showSeconds ?? false);
  const tf = config.timeFormat ?? "24h";
  const years = useMemo(
    () => generateYears(config.fromYear ?? 1920, config.toYear ?? 2100),
    [config.fromYear, config.toYear],
  );
  const [calMonth, setCalMonth] = useState<Date>(new Date());
  const mnFV = config.minDateField ? watch(config.minDateField) : undefined;
  const mxFV = config.maxDateField ? watch(config.maxDateField) : undefined;
  const mn = useMemo(
    () => (mnFV ? new Date(mnFV as string) : config.minDate),
    [mnFV, config.minDate],
  );
  const mx = useMemo(
    () => (mxFV ? new Date(mxFV as string) : config.maxDate),
    [mxFV, config.maxDate],
  );
  const dis = useMemo(() => buildDateDisabler(config, mn, mx), [config, mn, mx]);
  const fmtStr = useMemo(
    () => getDateFieldFormatString({ showTime, showSeconds, timeFormat: tf }),
    [showTime, showSeconds, tf],
  );
  const cur = v ? new Date(v) : undefined;
  const hours = cur ? cur.getHours() : 0;
  const minutes = cur ? cur.getMinutes() : 0;
  const seconds = cur ? cur.getSeconds() : 0;
  const is12h = tf === "12h";
  const dh = is12h ? hours % 12 || 12 : hours;
  const ampm: "AM" | "PM" = hours >= 12 ? "PM" : "AM";
  const setTime = (h: number, m: number, s: number) => {
    const n = new Date(cur ?? new Date());
    n.setHours(h, m, s, 0);
    setValue(config.name, n.toISOString());
  };
  return (
    <div className={cn("flex flex-col space-y-2", config.className)}>
      {config.label && (
        <Label>
          {config.label}
          {config.required && <span className="text-destructive ms-1">*</span>}
        </Label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full ps-3 text-start font-normal",
              !cur && "text-muted-foreground",
            )}
            disabled={config.disabled}
          >
            <CalendarIcon className="me-2 h-4 w-4 opacity-50" />
            {cur ? (
              format(cur, fmtStr)
            ) : (
              <span>
                {config.placeholder ||
                  (showTime ? "Pick date & time" : "Pick a date")}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  type="button"
                  onClick={() =>
                    setCalMonth(
                      (p) => new Date(p.getFullYear(), p.getMonth() - 1),
                    )
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  <Select
                    value={String(calMonth.getMonth())}
                    onValueChange={(v) =>
                      setCalMonth((p) => new Date(p.getFullYear(), Number(v)))
                    }
                  >
                    <SelectTrigger className="h-8 w-[110px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m, i) => (
                        <SelectItem
                          key={m}
                          value={String(i)}
                          className="text-xs"
                        >
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={String(calMonth.getFullYear())}
                    onValueChange={(v) =>
                      setCalMonth((p) => new Date(Number(v), p.getMonth()))
                    }
                  >
                    <SelectTrigger className="h-8 w-[80px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-[200px]">
                        {years.map((y) => (
                          <SelectItem
                            key={y}
                            value={String(y)}
                            className="text-xs"
                          >
                            {y}
                          </SelectItem>
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
                  onClick={() =>
                    setCalMonth(
                      (p) => new Date(p.getFullYear(), p.getMonth() + 1),
                    )
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Calendar
                mode="single"
                month={calMonth}
                onMonthChange={setCalMonth}
                selected={cur}
                onSelect={(d) => {
                  if (!d) {
                    setValue(config.name, "");
                    return;
                  }
                  setValue(config.name, stampPickedDay(d, cur ?? new Date()).toISOString());
                }}
                disabled={dis}
                className="p-3"
                components={{ Month: HeaderlessMonth }}
              />
            </div>
            {showTime && (
              <div className="border-s border-border flex items-stretch">
                <div className="flex items-start gap-0 px-2 pt-3 pb-3">
                  <TimeScroller
                    value={is12h ? dh : hours}
                    items={is12h ? HOUR_12_ITEMS : HOUR_24_ITEMS}
                    onChange={(h) =>
                      setTime(is12h ? to24Hour(h, ampm) : h, minutes, seconds)
                    }
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
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-medium text-muted-foreground mb-1">
                        &nbsp;
                      </span>
                      <div className="flex flex-col gap-1 mt-2">
                        {AMPM_VALUES.map((vv) => (
                          <button
                            key={vv}
                            type="button"
                            onClick={() =>
                              setTime(to24Hour(dh, vv), minutes, seconds)
                            }
                            className={cn(
                              "px-3 py-1.5 rounded-md text-xs font-semibold",
                              vv === ampm
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent",
                            )}
                          >
                            {vv}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {config.description && (
        <FieldDescription>{config.description}</FieldDescription>
      )}
      <FieldError error={errors[config.name]} />
    </div>
  );
}
