import { describe, expect, it } from "vitest";

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
import type { DateFieldConfig } from "@/forms/types/types";

describe("dateFieldHelpers / constants", () => {
  it("MONTHS lists 12 ordered names", () => {
    expect(MONTHS).toHaveLength(12);
    expect(MONTHS[0]).toBe("January");
    expect(MONTHS[11]).toBe("December");
  });

  it("HOUR_12_ITEMS = 1..12", () => {
    expect(HOUR_12_ITEMS).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("HOUR_24_ITEMS = 0..23", () => {
    expect(HOUR_24_ITEMS).toHaveLength(24);
    expect(HOUR_24_ITEMS[0]).toBe(0);
    expect(HOUR_24_ITEMS[23]).toBe(23);
  });

  it("MIN_60_ITEMS = 0..59", () => {
    expect(MIN_60_ITEMS).toHaveLength(60);
    expect(MIN_60_ITEMS[0]).toBe(0);
    expect(MIN_60_ITEMS[59]).toBe(59);
  });

  it("AMPM_VALUES = ['AM','PM']", () => {
    expect(AMPM_VALUES).toEqual(["AM", "PM"]);
  });
});

describe("dateFieldHelpers / to24Hour", () => {
  it("AM cases", () => {
    expect(to24Hour(12, "AM")).toBe(0); // midnight
    expect(to24Hour(1, "AM")).toBe(1);
    expect(to24Hour(11, "AM")).toBe(11);
  });

  it("PM cases", () => {
    expect(to24Hour(12, "PM")).toBe(12); // noon
    expect(to24Hour(1, "PM")).toBe(13);
    expect(to24Hour(11, "PM")).toBe(23);
  });
});

describe("dateFieldHelpers / generateYears", () => {
  it("inclusive ascending range", () => {
    expect(generateYears(2020, 2023)).toEqual([2020, 2021, 2022, 2023]);
  });

  it("single-year range", () => {
    expect(generateYears(2025, 2025)).toEqual([2025]);
  });

  it("empty when from > to", () => {
    expect(generateYears(2025, 2020)).toEqual([]);
  });
});

describe("dateFieldHelpers / stampPickedDay", () => {
  it("copies hours/minutes/seconds/ms from base onto picked (in place)", () => {
    const picked = new Date(2026, 3, 16, 0, 0, 0, 0);
    const base = new Date(2026, 3, 19, 14, 30, 45, 123);
    const result = stampPickedDay(picked, base);

    expect(result).toBe(picked);
    expect(picked.getHours()).toBe(14);
    expect(picked.getMinutes()).toBe(30);
    expect(picked.getSeconds()).toBe(45);
    expect(picked.getMilliseconds()).toBe(123);
    // Day stays as picked
    expect(picked.getDate()).toBe(16);
    expect(picked.getMonth()).toBe(3);
    expect(picked.getFullYear()).toBe(2026);
  });
});

describe("dateFieldHelpers / getDateFieldFormatString", () => {
  it("date-only when showTime is false", () => {
    expect(getDateFieldFormatString({ showTime: false })).toBe("PPP");
    expect(getDateFieldFormatString({ showTime: false, showSeconds: true, timeFormat: "12h" })).toBe(
      "PPP",
    );
  });

  it("24h with/without seconds", () => {
    expect(getDateFieldFormatString({ showTime: true, timeFormat: "24h" })).toBe(
      "MM/dd/yyyy HH:mm",
    );
    expect(
      getDateFieldFormatString({ showTime: true, showSeconds: true, timeFormat: "24h" }),
    ).toBe("MM/dd/yyyy HH:mm:ss");
  });

  it("12h with/without seconds", () => {
    expect(getDateFieldFormatString({ showTime: true, timeFormat: "12h" })).toBe(
      "MM/dd/yyyy hh:mm aa",
    );
    expect(
      getDateFieldFormatString({ showTime: true, showSeconds: true, timeFormat: "12h" }),
    ).toBe("MM/dd/yyyy hh:mm:ss aa");
  });

  it("defaults to 24h when timeFormat omitted", () => {
    expect(getDateFieldFormatString({ showTime: true })).toBe("MM/dd/yyyy HH:mm");
  });
});

describe("dateFieldHelpers / buildDateDisabler", () => {
  const cfg = (over: Partial<DateFieldConfig> = {}): DateFieldConfig =>
    ({ name: "d", type: "date", ...over }) as DateFieldConfig;

  const startOfToday = () => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  };
  const dayOffset = (days: number) => {
    const t = startOfToday();
    t.setDate(t.getDate() + days);
    return t;
  };

  it("no constraints → never disabled", () => {
    const f = buildDateDisabler(cfg());
    expect(f(dayOffset(-100))).toBe(false);
    expect(f(dayOffset(0))).toBe(false);
    expect(f(dayOffset(100))).toBe(false);
  });

  it("minDate disables earlier days only", () => {
    const f = buildDateDisabler(cfg(), dayOffset(0));
    expect(f(dayOffset(-1))).toBe(true);
    expect(f(dayOffset(0))).toBe(false);
    expect(f(dayOffset(1))).toBe(false);
  });

  it("maxDate disables later days only", () => {
    const f = buildDateDisabler(cfg(), undefined, dayOffset(0));
    expect(f(dayOffset(-1))).toBe(false);
    expect(f(dayOffset(0))).toBe(false);
    expect(f(dayOffset(1))).toBe(true);
  });

  it("futureOnly disables strict past", () => {
    const f = buildDateDisabler(cfg({ dateConstraint: "futureOnly" }));
    expect(f(dayOffset(-1))).toBe(true);
    expect(f(dayOffset(0))).toBe(false);
    expect(f(dayOffset(1))).toBe(false);
  });

  it("pastOnly disables strict future", () => {
    const f = buildDateDisabler(cfg({ dateConstraint: "pastOnly" }));
    expect(f(dayOffset(-1))).toBe(false);
    expect(f(dayOffset(0))).toBe(false);
    expect(f(dayOffset(1))).toBe(true);
  });

  it("todayOnly enables only today", () => {
    const f = buildDateDisabler(cfg({ dateConstraint: "todayOnly" }));
    expect(f(dayOffset(-1))).toBe(true);
    expect(f(dayOffset(0))).toBe(false);
    expect(f(dayOffset(1))).toBe(true);
  });

  it("noWeekends disables Saturday/Sunday", () => {
    const f = buildDateDisabler(cfg({ dateConstraint: "noWeekends" }));
    // Pick a fixed Saturday and Sunday
    expect(f(new Date(2026, 3, 18))).toBe(true); // Sat
    expect(f(new Date(2026, 3, 19))).toBe(true); // Sun
    expect(f(new Date(2026, 3, 20))).toBe(false); // Mon
  });

  it("futureNoWeekends disables past + weekends", () => {
    const f = buildDateDisabler(cfg({ dateConstraint: "futureNoWeekends" }));
    expect(f(dayOffset(-1))).toBe(true);
    // Future weekend
    const futureSat = new Date(2099, 0, 3); // 2099-01-03 is a Saturday
    expect(f(futureSat)).toBe(true);
  });
});
