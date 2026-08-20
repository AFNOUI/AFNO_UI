import { describe, expect, it, beforeEach } from "vitest";

import {
  draftKey,
  readDraft,
  clearDraft,
  formatSavedAgo,
  DRAFT_MAX_AGE_MS,
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

/**
 * Seeds a legacy draft directly.
 *
 * `writeDraft` is gone — `builder-workspace/` owns writing now, and this slot
 * is only ever read (once, to migrate it). Writing the envelope by hand is also
 * the more honest test: it pins the on-disk format these readers must keep
 * understanding, rather than round-tripping through our own serializer.
 */
function seedDraft(id: "form" | "table" | "kanban" | "tree", value: unknown, savedAt = NOW, label?: string) {
  localStorage.setItem(
    draftKey(id),
    JSON.stringify({ version: DRAFT_SCHEMA_VERSION, savedAt, label, value }),
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("storage round-trip", () => {
  it("reads a stored draft back whole", () => {
    seedDraft("form", { hello: "world" }, NOW, "Contact form");

    const offer = readDraft<{ hello: string }>("form", NOW + 1000);
    expect(offer).toEqual({
      savedAt: NOW,
      label: "Contact form",
      value: { hello: "world" },
    });
  });

  it("keeps one slot per builder", () => {
    seedDraft("form", { which: "form" });
    seedDraft("table", { which: "table" });

    expect(readDraft("form", NOW)?.value).toEqual({ which: "form" });
    expect(readDraft("table", NOW)?.value).toEqual({ which: "table" });
    expect(draftKey("form")).not.toBe(draftKey("table"));
  });

  it("returns null when there is no draft", () => {
    expect(readDraft("kanban", NOW)).toBeNull();
  });

  it("clears a slot", () => {
    seedDraft("tree", { a: 1 });
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
    seedDraft("form", { a: 1 });
    expect(readDraft("form", NOW + DRAFT_MAX_AGE_MS + 1)).toBeNull();
  });

  it("drops unparseable JSON", () => {
    localStorage.setItem(draftKey("form"), "{not json");
    expect(readDraft("form", NOW)).toBeNull();
  });

  it("drops a payload the builder's guard rejects", () => {
    seedDraft("form", { nonsense: true });
    expect(readDraft("form", NOW, isFormDraft)).toBeNull();
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
