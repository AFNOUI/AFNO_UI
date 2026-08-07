import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

import {
  draftKey,
  readDraft,
  writeDraft,
  clearDraft,
  serializeDraft,
  formatSavedAgo,
  DRAFT_MAX_AGE_MS,
  DRAFT_MAX_BYTES,
  DRAFT_SCHEMA_VERSION,
} from "@/components/shared/builder-draft";

import { isFormDraft } from "@/form-builder/utils/formDraft";
import { isTreeDraft } from "@/tree-builder/utils/treeDraft";
import { isTableDraft } from "@/table-builder/utils/tableDraft";
import { isKanbanDraft } from "@/kanban-builder/utils/kanbanDraft";

import { initialConfig } from "@/form-builder/config/constants";
import { treeTemplates, defaultTreeKey } from "@/tree-builder/data/treeBuilderTemplates";
import {
  defaultTableConfig,
  defaultSampleData,
} from "@/table-builder/data/tableBuilderTemplates";
import {
  defaultKanbanCards,
  defaultKanbanConfig,
} from "@/kanban-builder/data/kanbanBuilderTemplates";

const NOW = 1_700_000_000_000;

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("storage round-trip", () => {
  it("writes a draft and reads the same value back", () => {
    expect(writeDraft("form", { hello: "world" }, NOW, "Contact form")).toBe(true);

    const offer = readDraft<{ hello: string }>("form", NOW + 1000);
    expect(offer).toEqual({
      savedAt: NOW,
      label: "Contact form",
      value: { hello: "world" },
    });
  });

  it("keeps one slot per builder", () => {
    writeDraft("form", { which: "form" }, NOW);
    writeDraft("table", { which: "table" }, NOW);

    expect(readDraft("form", NOW)?.value).toEqual({ which: "form" });
    expect(readDraft("table", NOW)?.value).toEqual({ which: "table" });
    expect(draftKey("form")).not.toBe(draftKey("table"));
  });

  it("returns null when there is no draft", () => {
    expect(readDraft("kanban", NOW)).toBeNull();
  });

  it("clears a slot", () => {
    writeDraft("tree", { a: 1 }, NOW);
    clearDraft("tree");
    expect(readDraft("tree", NOW)).toBeNull();
  });
});

describe("drafts that must not be offered", () => {
  it("drops a payload from a retired schema version", () => {
    localStorage.setItem(
      draftKey("form"),
      JSON.stringify({ version: DRAFT_SCHEMA_VERSION + 1, savedAt: NOW, value: { a: 1 } }),
    );

    expect(readDraft("form", NOW)).toBeNull();
    // Dropped, not left behind to be re-rejected on every load.
    expect(localStorage.getItem(draftKey("form"))).toBeNull();
  });

  it("drops a draft older than the max age", () => {
    writeDraft("form", { a: 1 }, NOW);
    expect(readDraft("form", NOW + DRAFT_MAX_AGE_MS + 1)).toBeNull();
  });

  it("drops unparseable JSON", () => {
    localStorage.setItem(draftKey("form"), "{not json");
    expect(readDraft("form", NOW)).toBeNull();
  });

  it("drops a payload the builder's guard rejects", () => {
    writeDraft("form", { nonsense: true }, NOW);
    expect(readDraft("form", NOW, isFormDraft)).toBeNull();
  });

  it("refuses to write a payload past the size cap", () => {
    const huge = { blob: "x".repeat(DRAFT_MAX_BYTES + 1) };
    expect(writeDraft("table", huge, NOW)).toBe(false);
    expect(readDraft("table", NOW)).toBeNull();
  });

  it("reports failure rather than throwing when storage is unavailable", () => {
    // Spy on the instance, not `Storage.prototype` — happy-dom's localStorage
    // carries `setItem` as an own property, so a prototype spy never fires.
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => writeDraft("form", { a: 1 }, NOW)).not.toThrow();
    expect(writeDraft("form", { a: 1 }, NOW)).toBe(false);
  });

  it("skips values that cannot be serialized", () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;

    expect(serializeDraft(cyclic)).toBeNull();
    expect(writeDraft("form", cyclic, NOW)).toBe(false);
  });
});

describe("per-builder guards accept their own real state", () => {
  it("form", () => {
    expect(isFormDraft({ config: initialConfig, layout: "single" })).toBe(true);
    expect(isFormDraft({ config: {} })).toBe(false);
    expect(isFormDraft(null)).toBe(false);
  });

  it("table", () => {
    expect(isTableDraft({ config: defaultTableConfig, sampleData: defaultSampleData })).toBe(true);
    expect(isTableDraft({ config: defaultTableConfig })).toBe(false);
  });

  it("kanban", () => {
    expect(isKanbanDraft({ config: defaultKanbanConfig, cards: defaultKanbanCards })).toBe(true);
    expect(isKanbanDraft({ config: defaultKanbanConfig })).toBe(false);
  });

  it("tree", () => {
    const template = treeTemplates[defaultTreeKey] ?? Object.values(treeTemplates)[0];
    expect(
      isTreeDraft({
        variant: defaultTreeKey,
        tree: template.tree,
        configPatch: {},
        layout: template.config.layout,
      }),
    ).toBe(true);
    expect(isTreeDraft({ variant: defaultTreeKey, configPatch: {} })).toBe(false);
  });
});

describe("formatSavedAgo", () => {
  it("stays coarse — this answers 'is my work safe', not 'what time is it'", () => {
    expect(formatSavedAgo(NOW, NOW)).toBe("just now");
    expect(formatSavedAgo(NOW, NOW + 30_000)).toBe("just now");
    expect(formatSavedAgo(NOW, NOW + 2 * 60_000)).toBe("2m ago");
    expect(formatSavedAgo(NOW, NOW + 3 * 3_600_000)).toBe("3h ago");
    expect(formatSavedAgo(NOW, NOW + 24 * 3_600_000)).toBe("yesterday");
    expect(formatSavedAgo(NOW, NOW + 3 * 24 * 3_600_000)).toBe("3d ago");
  });

  it("never renders a negative age from a clock skew", () => {
    expect(formatSavedAgo(NOW, NOW - 60_000)).toBe("just now");
  });
});
