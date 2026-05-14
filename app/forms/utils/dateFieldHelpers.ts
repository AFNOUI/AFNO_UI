import { isWeekend, startOfDay } from "date-fns";

import type { DateFieldConfig } from "../types/types";

/** Localised month names used by the calendar's month dropdown (12 entries, January → December). */
export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

/** Hour values for a 12-hour time scroller (1 → 12). */
export const HOUR_12_ITEMS: readonly number[] = Array.from({ length: 12 }, (_, i) => i + 1);
/** Hour values for a 24-hour time scroller (0 → 23). */
export const HOUR_24_ITEMS: readonly number[] = Array.from({ length: 24 }, (_, i) => i);
/** Minute / second values for a time scroller (0 → 59). */
export const MIN_60_ITEMS: readonly number[] = Array.from({ length: 60 }, (_, i) => i);
/** Period values for the AM/PM selector. */
export const AMPM_VALUES = ["AM", "PM"] as const;
export type AmPm = (typeof AMPM_VALUES)[number];

/** Convert a 12-hour display hour (1–12) + AM/PM into the equivalent 24-hour value (0–23). */
export function to24Hour(displayHour: number, period: AmPm): number {
  if (period === "PM") return displayHour === 12 ? 12 : displayHour + 12;
  return displayHour === 12 ? 0 : displayHour;
}

/** Inclusive year range used to populate the calendar's year dropdown. */
export function generateYears(from: number, to: number): number[] {
  const years: number[] = [];
  for (let y = from; y <= to; y++) years.push(y);
  return years;
}

/**
 * Build a `react-day-picker`-compatible disabled-date predicate from the field config
 * + (optionally) live min/max date limits read from sibling fields.
 *
 * Behaviour exactly mirrors the inline implementations previously duplicated across
 * the three stack DateFields (RHF, TanStack, Action).
 */
export function buildDateDisabler(
  config: DateFieldConfig,
  minDate?: Date,
  maxDate?: Date,
): (date: Date) => boolean {
  return (date: Date) => {
    const today = startOfDay(new Date());
    const d = startOfDay(date);

    if (minDate && d < startOfDay(minDate)) return true;
    if (maxDate && d > startOfDay(maxDate)) return true;

    switch (config.dateConstraint) {
      case "futureOnly":         return d < today;
      case "pastOnly":           return d > today;
      case "todayOnly":          return d.getTime() !== today.getTime();
      case "noWeekends":         return isWeekend(date);
      case "futureNoWeekends":   return d < today || isWeekend(date);
      default:                   return false;
    }
  };
}

/**
 * Stamp the user-picked day with a meaningful wall-clock time so the resulting ISO
 * never collapses to local midnight (which would shift the day in UTC).
 *
 * `base` provides the time-of-day source — typically the previously selected value, or
 * `new Date()` on the first pick. The original `picked` instance is mutated in place
 * to match `react-day-picker`'s onSelect contract; the same instance is returned for
 * convenience.
 */
export function stampPickedDay(picked: Date, base: Date): Date {
  picked.setHours(
    base.getHours(),
    base.getMinutes(),
    base.getSeconds(),
    base.getMilliseconds(),
  );
  return picked;
}

/** Optional time-format flags for {@link getDateFieldFormatString}. */
export interface DateFieldFormatOptions {
  showTime: boolean;
  showSeconds?: boolean;
  timeFormat?: "12h" | "24h";
}

/** date-fns format string matching the user's date/time + 12h/24h + seconds preferences. */
export function getDateFieldFormatString({
  showTime,
  showSeconds,
  timeFormat,
}: DateFieldFormatOptions): string {
  if (!showTime) return "PPP";
  if (timeFormat === "12h") {
    return showSeconds ? "MM/dd/yyyy hh:mm:ss aa" : "MM/dd/yyyy hh:mm aa";
  }
  return showSeconds ? "MM/dd/yyyy HH:mm:ss" : "MM/dd/yyyy HH:mm";
}
