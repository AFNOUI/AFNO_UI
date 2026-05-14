import { describe, expect, it } from "vitest";

import {
  getExtraKeyValues,
  getExtraKeyValuesFromOptions,
} from "@/forms/utils/fieldExtraKeys";
import type { FieldOption } from "@/forms/types/types";

/** Test helper: cast a raw object literal to FieldOption (the prod type doesn't expose `_raw` publicly). */
const opt = (o: Record<string, unknown>): FieldOption => o as unknown as FieldOption;

describe("fieldExtraKeys / getExtraKeyValues", () => {
  it("returns {} when option is undefined", () => {
    expect(getExtraKeyValues("country", undefined)).toEqual({});
  });

  it("returns {} when option has no _raw", () => {
    expect(getExtraKeyValues("country", { value: "1", label: "USA" })).toEqual({});
  });

  it("returns {} when _raw is not an object", () => {
    expect(
      getExtraKeyValues(
        "country",
        opt({ value: "1", label: "USA", _raw: null }),
      ),
    ).toEqual({});
  });

  it("namespaces every _raw key as `<field>__<key>`", () => {
    expect(
      getExtraKeyValues(
        "country",
        opt({
          value: "1",
          label: "USA",
          _raw: { code: "US", region: "NA", population: 330 },
        }),
      ),
    ).toEqual({
      country__code: "US",
      country__region: "NA",
      country__population: 330,
    });
  });

  it("preserves nested values verbatim (no JSON-stringify)", () => {
    const nested = { lat: 10, lng: 20 };
    expect(
      getExtraKeyValues(
        "city",
        opt({ value: "1", label: "Kathmandu", _raw: { coords: nested } }),
      ),
    ).toEqual({ city__coords: nested });
  });
});

describe("fieldExtraKeys / getExtraKeyValuesFromOptions", () => {
  it("returns {} for empty options", () => {
    expect(getExtraKeyValuesFromOptions("tags", [])).toEqual({});
  });

  it("aggregates multiple selected options into comma-separated strings", () => {
    expect(
      getExtraKeyValuesFromOptions("tags", [
        opt({ value: "1", label: "A", _raw: { color: "red", weight: 1 } }),
        opt({ value: "2", label: "B", _raw: { color: "blue", weight: 2 } }),
      ]),
    ).toEqual({
      tags__color: "red, blue",
      tags__weight: "1, 2",
    });
  });

  it("skips empty/null values when aggregating", () => {
    expect(
      getExtraKeyValuesFromOptions("tags", [
        opt({ value: "1", label: "A", _raw: { color: "red", note: null } }),
        opt({ value: "2", label: "B", _raw: { color: "", note: "ok" } }),
      ]),
    ).toEqual({
      tags__color: "red",
      tags__note: "ok",
    });
  });

  it("ignores options without _raw", () => {
    expect(
      getExtraKeyValuesFromOptions("tags", [
        opt({ value: "1", label: "A" }),
        opt({ value: "2", label: "B", _raw: { color: "blue" } }),
      ]),
    ).toEqual({ tags__color: "blue" });
  });
});
