import { describe, expect, it } from "vitest";

import {
  getAtPath,
  setAtPath,
  diffConfigs,
  deleteAtPath,
  humanizePath,
  formatDiffValue,
  resetDiffEntry,
  resetAllDiffEntries,
} from "@/components/shared/builder-diff";

import { tableTemplates, defaultTableConfig } from "@/table-builder/data/tableBuilderTemplates";

describe("path helpers", () => {
  it("reads nested paths and returns undefined for missing segments", () => {
    const config = { a: { b: { c: 1 } } };
    expect(getAtPath(config, "a.b.c")).toBe(1);
    expect(getAtPath(config, "a.x.c")).toBeUndefined();
    expect(getAtPath(null, "a")).toBeUndefined();
  });

  it("writes immutably, leaving untouched branches identical", () => {
    const config = { a: { b: 1 }, keep: { deep: true } };
    const next = setAtPath(config, "a.b", 2);

    expect(next.a.b).toBe(2);
    expect(config.a.b).toBe(1);
    // Structural sharing is load-bearing — the undo stack holds every previous
    // config, so a reset must not deep-clone branches it did not touch.
    expect(next.keep).toBe(config.keep);
  });

  it("creates missing intermediates when writing", () => {
    expect(setAtPath({}, "a.b.c", 7)).toEqual({ a: { b: { c: 7 } } });
  });

  it("deletes keys rather than setting them undefined", () => {
    const next = deleteAtPath({ a: 1, b: 2 }, "a");
    expect("a" in next).toBe(false);
    expect(next).toEqual({ b: 2 });
  });
});

describe("humanizePath", () => {
  it("turns camelCase dotted paths into readable labels", () => {
    expect(humanizePath("pageSize")).toBe("Page size");
    expect(humanizePath("pagination.pageSize")).toBe("Pagination · Page size");
    expect(humanizePath("enable_virtualization")).toBe("Enable virtualization");
  });
});

describe("formatDiffValue", () => {
  it("collapses collections to counts and renders scalars readably", () => {
    expect(formatDiffValue(true)).toBe("On");
    expect(formatDiffValue(false)).toBe("Off");
    expect(formatDiffValue(24)).toBe("24");
    expect(formatDiffValue("")).toBe("empty");
    expect(formatDiffValue(undefined)).toBe("not set");
    expect(formatDiffValue(null)).toBe("not set");
    expect(formatDiffValue([1])).toBe("1 item");
    expect(formatDiffValue([1, 2, 3])).toBe("3 items");
    expect(formatDiffValue({ a: 1, b: 2 })).toBe("2 settings");
  });

  it("truncates long strings", () => {
    expect(formatDiffValue("x".repeat(100))).toHaveLength(48);
  });
});

describe("diffConfigs", () => {
  it("reports nothing when the config still matches the template", () => {
    expect(diffConfigs({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toEqual([]);
  });

  it("classifies changed, added and removed settings", () => {
    const entries = diffConfigs(
      { changed: 2, added: "new" },
      { changed: 1, removed: "gone" },
    );
    const byPath = Object.fromEntries(entries.map((e) => [e.path, e.kind]));

    expect(byPath).toEqual({ changed: "changed", added: "added", removed: "removed" });
  });

  it("treats arrays as one value instead of walking them", () => {
    const entries = diffConfigs({ columns: [1, 2, 3] }, { columns: [1, 2] });

    expect(entries).toHaveLength(1);
    expect(entries[0].path).toBe("columns");
    expect(entries[0].currentLabel).toBe("3 items");
    expect(entries[0].templateLabel).toBe("2 items");
  });

  it("treats `atomic` object subtrees as one value", () => {
    const walked = diffConfigs({ api: { url: "a", method: "GET" } }, { api: { url: "b", method: "GET" } });
    expect(walked.map((e) => e.path)).toEqual(["api.url"]);

    const atomic = diffConfigs(
      { api: { url: "a", method: "GET" } },
      { api: { url: "b", method: "GET" } },
      { atomic: ["api"] },
    );
    expect(atomic.map((e) => e.path)).toEqual(["api"]);
  });

  it("skips `ignore`d paths and everything under them", () => {
    const entries = diffConfigs(
      { keep: 1, skip: { deep: 1 } },
      { keep: 2, skip: { deep: 2 } },
      { ignore: ["skip"] },
    );
    expect(entries.map((e) => e.path)).toEqual(["keep"]);
  });

  it("stops walking at maxDepth", () => {
    const entries = diffConfigs(
      { a: { b: { c: 1 } } },
      { a: { b: { c: 2 } } },
      { maxDepth: 2 },
    );
    expect(entries.map((e) => e.path)).toEqual(["a.b"]);
  });

  it("never emits an entry for the root itself", () => {
    expect(diffConfigs(1, 2).map((e) => e.path)).toEqual([""].slice(1));
  });
});

describe("resetDiffEntry", () => {
  it("restores the template value", () => {
    const current = { pageSize: 50 };
    const [entry] = diffConfigs(current, { pageSize: 10 });
    expect(resetDiffEntry(current, entry)).toEqual({ pageSize: 10 });
  });

  it("deletes a key the template never defined", () => {
    const current = { extra: true };
    const [entry] = diffConfigs(current, {});
    const next = resetDiffEntry(current, entry);

    // Not `{ extra: undefined }` — that key would survive into exported JSON
    // and read as a deliberate choice.
    expect("extra" in next).toBe(false);
  });

  it("restores every entry at once and lands back on the template", () => {
    const template = { a: 1, b: { c: 2 }, d: [1, 2] };
    const current = { a: 9, b: { c: 9 }, d: [1], e: "added" };
    const entries = diffConfigs(current, template);

    expect(resetAllDiffEntries(current, entries)).toEqual(template);
  });
});

describe("against real table templates", () => {
  const template = tableTemplates.basic ?? Object.values(tableTemplates)[0];

  it("finds no drift between a freshly loaded template and itself", () => {
    const diff = diffConfigs(template.config, template.config, {
      atomic: ["columns", "columnGroups"],
    });
    expect(diff).toEqual([]);
  });

  it("reports a toggled setting and resets it cleanly", () => {
    const current = { ...template.config, enablePagination: !template.config.enablePagination };
    const entries = diffConfigs(current, template.config, {
      atomic: ["columns", "columnGroups"],
    });

    expect(entries.map((e) => e.path)).toEqual(["enablePagination"]);
    expect(resetAllDiffEntries(current, entries)).toEqual(template.config);
  });

  it("collapses a column edit into a single entry", () => {
    const current = {
      ...defaultTableConfig,
      columns: defaultTableConfig.columns.slice(0, 2),
    };
    const entries = diffConfigs(current, defaultTableConfig, {
      atomic: ["columns", "columnGroups"],
    });

    expect(entries.filter((e) => e.path.startsWith("columns"))).toHaveLength(1);
  });
});
