import { describe, expect, it } from "vitest";

import {
  applyWatchTransform,
  emptyValueForFieldType,
  isMultiStringFieldType,
  mergeGhostOptionForSingle,
  mergeGhostOptionsForMultiValues,
  optionValueKey,
  optionValuesEqual,
  pickWatchBaseString,
  resetFieldValueForConfig,
  resolveWatchPopulateValue,
  valueMapLookupKeys,
} from "@/forms/utils/watchPopulate";
import type { FormFieldConfig } from "@/forms/types/types";

describe("watchPopulate / isMultiStringFieldType", () => {
  it("classifies known multi-string types", () => {
    for (const type of [
      "multiselect",
      "multicombobox",
      "asyncmultiselect",
      "asyncmulticombobox",
      "infinitemultiselect",
      "infinitemulticombobox",
      "checkboxgroup",
    ] as const) {
      expect(isMultiStringFieldType(type)).toBe(true);
    }
  });

  it("rejects single-value types", () => {
    for (const type of [
      "text",
      "select",
      "asyncselect",
      "infiniteselect",
      "checkbox",
      "switch",
      "switchgroup",
      "number",
      "date",
    ] as const) {
      expect(isMultiStringFieldType(type)).toBe(false);
    }
  });
});

describe("watchPopulate / valueMapLookupKeys", () => {
  it("returns [''] for nullish", () => {
    expect(valueMapLookupKeys(undefined)).toEqual([""]);
    expect(valueMapLookupKeys(null)).toEqual([""]);
  });

  it("returns single string key for primitives", () => {
    expect(valueMapLookupKeys("a")).toEqual(["a"]);
    expect(valueMapLookupKeys(42)).toEqual(["42"]);
    expect(valueMapLookupKeys(true)).toEqual(["true"]);
  });

  it("returns String + JSON keys for arrays", () => {
    expect(valueMapLookupKeys(["a", "b"])).toEqual(["a,b", '["a","b"]']);
  });
});

describe("watchPopulate / pickWatchBaseString", () => {
  it("uses valueMap when key matches", () => {
    expect(pickWatchBaseString("CA", { CA: "California", NY: "New York" })).toBe("California");
  });

  it("falls back to coerced string when valueMap key not found", () => {
    expect(pickWatchBaseString("XX", { CA: "California" })).toBe("XX");
  });

  it("returns '' for null/undefined", () => {
    expect(pickWatchBaseString(undefined)).toBe("");
    expect(pickWatchBaseString(null)).toBe("");
  });

  it("returns string verbatim", () => {
    expect(pickWatchBaseString("hello")).toBe("hello");
  });

  it("coerces numbers/booleans to string", () => {
    expect(pickWatchBaseString(42)).toBe("42");
    expect(pickWatchBaseString(true)).toBe("true");
  });

  it("joins arrays with comma", () => {
    expect(pickWatchBaseString(["a", "b", "c"])).toBe("a,b,c");
  });

  it("JSON.stringifies plain objects", () => {
    expect(pickWatchBaseString({ x: 1 })).toBe('{"x":1}');
  });
});

describe("watchPopulate / applyWatchTransform", () => {
  it("filters numbers", () => {
    expect(applyWatchTransform("abc123def", { filter: "numbers" })).toBe("123");
  });

  it("filters letters (keeps spaces)", () => {
    expect(applyWatchTransform("abc 123 def!", { filter: "letters" })).toBe("abc  def");
  });

  it("filters alphanumeric", () => {
    expect(applyWatchTransform("a-b_c 1!2", { filter: "alphanumeric" })).toBe("abc12");
  });

  it("slices after filtering", () => {
    expect(
      applyWatchTransform("abcdef", { slice: { start: 1, end: 4 } }),
    ).toBe("bcd");
  });

  it("uppercases", () => {
    expect(applyWatchTransform("abc", { case: "upper" })).toBe("ABC");
  });

  it("lowercases", () => {
    expect(applyWatchTransform("ABC", { case: "lower" })).toBe("abc");
  });

  it("capitalizes (first char only)", () => {
    expect(applyWatchTransform("hELLo", { case: "capitalize" })).toBe("Hello");
  });

  it("title-cases each word", () => {
    expect(applyWatchTransform("hello world", { case: "title" })).toBe("Hello World");
  });

  it("substitutes {value} in template", () => {
    expect(applyWatchTransform("World", { template: "Hello {value}!" })).toBe("Hello World!");
  });

  it("composes filter -> slice -> case -> template in order", () => {
    expect(
      applyWatchTransform("abc123", {
        filter: "letters",
        slice: { start: 0, end: 2 },
        case: "upper",
        template: ">> {value} <<",
      }),
    ).toBe(">> AB <<");
  });

  it("returns '' for empty input", () => {
    expect(applyWatchTransform("", { case: "upper" })).toBe("");
  });
});

describe("watchPopulate / resolveWatchPopulateValue", () => {
  const mkField = (
    type: FormFieldConfig["type"],
    name = "target",
  ): Pick<FormFieldConfig, "type" | "name"> => ({ type, name });

  it("multi-string + array input → string[] (filtered)", () => {
    expect(
      resolveWatchPopulateValue(mkField("multiselect"), ["a", "", "b"], {
        watchField: "src",
      }),
    ).toEqual(["a", "b"]);
  });

  it("multi-string + comma string → string[]", () => {
    expect(
      resolveWatchPopulateValue(mkField("multiselect"), "a, b, ,c", {
        watchField: "src",
      }),
    ).toEqual(["a", "b", "c"]);
  });

  it("multi-string + empty string → []", () => {
    expect(
      resolveWatchPopulateValue(mkField("multiselect"), "", { watchField: "src" }),
    ).toEqual([]);
  });

  it("number → number when finite", () => {
    expect(
      resolveWatchPopulateValue(mkField("number"), "42", { watchField: "src" }),
    ).toBe(42);
  });

  it("number → '' when not finite", () => {
    expect(
      resolveWatchPopulateValue(mkField("number"), "abc", { watchField: "src" }),
    ).toBe("");
  });

  it("text → mapped+transformed string", () => {
    expect(
      resolveWatchPopulateValue(mkField("text"), "hello", {
        watchField: "src",
        transform: { case: "upper" },
      }),
    ).toBe("HELLO");
  });

  it("text + valueMap → mapped value", () => {
    expect(
      resolveWatchPopulateValue(mkField("text"), "CA", {
        watchField: "src",
        valueMap: { CA: "California" },
      }),
    ).toBe("California");
  });
});

describe("watchPopulate / emptyValueForFieldType + resetFieldValueForConfig", () => {
  it("multi-string types → []", () => {
    expect(emptyValueForFieldType("multiselect")).toEqual([]);
    expect(emptyValueForFieldType("checkboxgroup")).toEqual([]);
  });

  it("number → ''", () => {
    expect(emptyValueForFieldType("number")).toBe("");
  });

  it("checkbox/switch → false", () => {
    expect(emptyValueForFieldType("checkbox")).toBe(false);
    expect(emptyValueForFieldType("switch")).toBe(false);
  });

  it("default → ''", () => {
    expect(emptyValueForFieldType("text")).toBe("");
  });

  it("resetFieldValueForConfig prefers defaultValue when set", () => {
    expect(
      resetFieldValueForConfig({ type: "text", defaultValue: "X" }),
    ).toBe("X");
  });

  it("resetFieldValueForConfig falls back to empty when no defaultValue", () => {
    expect(resetFieldValueForConfig({ type: "multiselect" })).toEqual([]);
  });
});

describe("watchPopulate / option key helpers", () => {
  it("optionValueKey coerces", () => {
    expect(optionValueKey("a")).toBe("a");
    expect(optionValueKey(1)).toBe("1");
    expect(optionValueKey(undefined)).toBe("");
    expect(optionValueKey(null)).toBe("");
  });

  it("optionValuesEqual normalises types", () => {
    expect(optionValuesEqual("1", 1)).toBe(true);
    expect(optionValuesEqual(undefined, "")).toBe(true);
    expect(optionValuesEqual("a", "b")).toBe(false);
  });

  it("mergeGhostOptionForSingle prepends a ghost when value is missing", () => {
    expect(
      mergeGhostOptionForSingle([{ value: "a", label: "A" }], "b"),
    ).toEqual([
      { value: "b", label: "b" },
      { value: "a", label: "A" },
    ]);
  });

  it("mergeGhostOptionForSingle is no-op when value already present", () => {
    expect(
      mergeGhostOptionForSingle([{ value: "a", label: "A" }], "a"),
    ).toEqual([{ value: "a", label: "A" }]);
  });

  it("mergeGhostOptionForSingle is no-op for empty/nullish current", () => {
    const opts = [{ value: "a", label: "A" }];
    expect(mergeGhostOptionForSingle(opts, "")).toBe(opts);
    expect(mergeGhostOptionForSingle(opts, undefined)).toBe(opts);
  });

  it("mergeGhostOptionsForMultiValues prepends only the missing ones", () => {
    expect(
      mergeGhostOptionsForMultiValues(
        [{ value: "a", label: "A" }],
        ["a", "b", "c"],
      ),
    ).toEqual([
      { value: "b", label: "b" },
      { value: "c", label: "c" },
      { value: "a", label: "A" },
    ]);
  });

  it("mergeGhostOptionsForMultiValues is no-op when nothing missing", () => {
    const opts = [
      { value: "a", label: "A" },
      { value: "b", label: "B" },
    ];
    expect(mergeGhostOptionsForMultiValues(opts, ["a", "b"])).toBe(opts);
  });
});
