import { describe, expect, it } from "vitest";

import {
  hasDependentApiConfig,
  hasOptions,
  hasWatchValue,
} from "@/forms/utils/formFieldGuards";
import type { FormFieldConfig } from "@/forms/types/types";

describe("formFieldGuards / hasOptions", () => {
  it("returns true when an `options` key exists (even if empty)", () => {
    expect(
      hasOptions({ name: "x", type: "select", options: [] } as unknown as FormFieldConfig),
    ).toBe(true);
  });

  it("returns false when no `options` key exists", () => {
    expect(hasOptions({ name: "x", type: "text" } as FormFieldConfig)).toBe(false);
  });
});

describe("formFieldGuards / hasDependentApiConfig", () => {
  it("matches every async* variant", () => {
    for (const t of [
      "asyncselect",
      "asyncmultiselect",
      "asynccombobox",
      "asyncmulticombobox",
    ] as const) {
      expect(
        hasDependentApiConfig({ name: "x", type: t } as FormFieldConfig),
      ).toBe(true);
    }
  });

  it("matches every infinite* variant", () => {
    for (const t of [
      "infiniteselect",
      "infinitemultiselect",
      "infinitecombobox",
      "infinitemulticombobox",
    ] as const) {
      expect(
        hasDependentApiConfig({ name: "x", type: t } as FormFieldConfig),
      ).toBe(true);
    }
  });

  it("rejects non-async/non-infinite types", () => {
    for (const t of [
      "text",
      "number",
      "select",
      "combobox",
      "checkbox",
      "date",
      "file",
    ] as const) {
      expect(
        hasDependentApiConfig({ name: "x", type: t } as FormFieldConfig),
      ).toBe(false);
    }
  });
});

describe("formFieldGuards / hasWatchValue", () => {
  it("returns false for undefined / null / empty string", () => {
    expect(hasWatchValue(undefined)).toBe(false);
    expect(hasWatchValue(null)).toBe(false);
    expect(hasWatchValue("")).toBe(false);
  });

  it("returns true for non-empty primitives", () => {
    expect(hasWatchValue("a")).toBe(true);
    expect(hasWatchValue(0)).toBe(true);   // zero is meaningful
    expect(hasWatchValue(false)).toBe(true); // false is meaningful
  });

  it("returns true for objects/arrays (their `String()` is non-empty)", () => {
    expect(hasWatchValue({ x: 1 })).toBe(true);
    expect(hasWatchValue([1, 2])).toBe(true);
  });

  it("returns false for an empty array (String([]) === '')", () => {
    // Documented behaviour: `String([])` is "", so an empty array is treated
    // as "no value" by every form-field router. Locking that contract here.
    expect(hasWatchValue([])).toBe(false);
  });
});
