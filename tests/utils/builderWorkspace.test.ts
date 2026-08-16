import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    deleteDoc,
    formatBytes,
    migrateLegacyDraft,
    readDoc,
    readIndex,
    serializeDoc,
    storageAvailable,
    uniqueName,
    writeDoc,
    writeIndex,
} from "@/components/shared/builder-workspace";
import {
    WORKSPACE_MAX_BYTES,
    WORKSPACE_SCHEMA_VERSION,
} from "@/components/shared/builder-workspace";
import { docKey, indexKey } from "@/components/shared/builder-workspace";
import type { WorkspaceDocMeta } from "@/components/shared/builder-workspace";

function meta(overrides: Partial<WorkspaceDocMeta> = {}): WorkspaceDocMeta {
    return {
        id: "a",
        name: "Sprint Board",
        savedAt: 1_000,
        createdAt: 1_000,
        bytes: 10,
        ...overrides,
    };
}

beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.restoreAllMocks();
});

describe("document storage", () => {
    it("round-trips a snapshot", () => {
        expect(writeDoc("table", "doc-1", { rows: 3 }, 5).ok).toBe(true);
        expect(readDoc("table", "doc-1")).toEqual({ rows: 3 });
    });

    it("keeps builders in separate namespaces", () => {
        writeDoc("table", "doc-1", { which: "table" }, 5);
        writeDoc("kanban", "doc-1", { which: "kanban" }, 5);
        expect(readDoc("table", "doc-1")).toEqual({ which: "table" });
        expect(readDoc("kanban", "doc-1")).toEqual({ which: "kanban" });
    });

    it("refuses an oversized payload instead of throwing a quota error", () => {
        const huge = { blob: "x".repeat(WORKSPACE_MAX_BYTES + 1) };
        const result = writeDoc("table", "doc-1", huge, 5);
        expect(result.ok).toBe(false);
        expect(result.reason).toBe("too-large");
        expect(readDoc("table", "doc-1")).toBeNull();
    });

    it("refuses an unserializable snapshot rather than crashing the builder", () => {
        const cyclic: Record<string, unknown> = {};
        cyclic.self = cyclic;
        expect(serializeDoc(cyclic, 0)).toBeNull();
        expect(writeDoc("table", "doc-1", cyclic, 5).reason).toBe("unserializable");
    });

    // Every builder must survive Safari private mode and blocked site data.
    it("degrades to 'no workspace' when storage throws", () => {
        // Restored explicitly rather than via `restoreAllMocks`: jsdom exposes
        // `localStorage` through a proxy, and the automatic restore does not
        // reach it — the throwing stub then leaks into every later test.
        const spy = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
            throw new Error("QuotaExceededError");
        });
        try {
            expect(writeDoc("table", "doc-1", { rows: 1 }, 5).reason).toBe("storage");
        } finally {
            spy.mockRestore();
        }
    });

    it("drops a payload written by an older schema", () => {
        window.localStorage.setItem(
            docKey("table", "doc-1"),
            JSON.stringify({ version: WORKSPACE_SCHEMA_VERSION + 1, savedAt: 1, value: { rows: 1 } }),
        );
        expect(readDoc("table", "doc-1")).toBeNull();
    });

    it("drops a payload the builder's own guard rejects", () => {
        writeDoc("table", "doc-1", { rows: 1 }, 5);
        const isString = (value: unknown): value is string => typeof value === "string";
        expect(readDoc("table", "doc-1", isString)).toBeNull();
    });

    it("deletes cleanly", () => {
        writeDoc("table", "doc-1", { rows: 1 }, 5);
        deleteDoc("table", "doc-1");
        expect(readDoc("table", "doc-1")).toBeNull();
    });
});

describe("the index", () => {
    it("round-trips and returns newest first", () => {
        writeIndex("table", [
            meta({ id: "old", savedAt: 100 }),
            meta({ id: "new", savedAt: 900 }),
        ]);
        expect(readIndex("table").map((doc) => doc.id)).toEqual(["new", "old"]);
    });

    it("returns nothing for a corrupt index rather than throwing", () => {
        window.localStorage.setItem(indexKey("table"), "{not json");
        expect(readIndex("table")).toEqual([]);
    });

    it("retires the whole index on a schema bump", () => {
        window.localStorage.setItem(
            indexKey("table"),
            JSON.stringify({ version: WORKSPACE_SCHEMA_VERSION + 1, docs: [meta()] }),
        );
        expect(readIndex("table")).toEqual([]);
    });

    it("skips malformed entries but keeps the good ones", () => {
        window.localStorage.setItem(
            indexKey("table"),
            JSON.stringify({
                version: WORKSPACE_SCHEMA_VERSION,
                docs: [meta({ id: "good" }), { id: "bad" }, null],
            }),
        );
        expect(readIndex("table").map((doc) => doc.id)).toEqual(["good"]);
    });
});

describe("migrating a pre-workspace draft", () => {
    // Anyone mid-build when the workspace shipped had their work in the old
    // single-slot key. Ignoring it would be indistinguishable from deleting it.
    const legacyKey = "afnoui:builder-draft:table";

    function seedLegacy(value: unknown, label?: string, savedAt = Date.now()) {
        window.localStorage.setItem(
            legacyKey,
            JSON.stringify({ version: 1, savedAt, label, value }),
        );
    }

    it("adopts the old draft as a named document", () => {
        seedLegacy({ rows: 7 }, "Server CRM");
        const migrated = migrateLegacyDraft("table", Date.now(), "Untitled");

        expect(migrated?.name).toBe("Server CRM");
        expect(migrated?.active).toBe(true);
        expect(readDoc("table", migrated!.id)).toEqual({ rows: 7 });
    });

    it("removes the old key, so the two systems stop writing past each other", () => {
        seedLegacy({ rows: 7 });
        migrateLegacyDraft("table", Date.now(), "Untitled");
        expect(window.localStorage.getItem(legacyKey)).toBeNull();
    });

    it("names it from the fallback when the draft carried no label", () => {
        seedLegacy({ rows: 7 });
        expect(migrateLegacyDraft("table", Date.now(), "Untitled")?.name).toBe("Untitled");
    });

    it("keeps the original save time rather than pretending it is new", () => {
        const savedAt = Date.now() - 60_000;
        seedLegacy({ rows: 7 }, "Server CRM", savedAt);
        expect(migrateLegacyDraft("table", Date.now(), "Untitled")?.savedAt).toBe(savedAt);
    });

    // The old system already refused to offer a draft older than a week, so
    // migrating one would resurrect work the user was never going to see again.
    it("ignores a draft past the old age limit", () => {
        seedLegacy({ rows: 7 }, "Server CRM", Date.now() - 8 * 24 * 60 * 60 * 1000);
        expect(migrateLegacyDraft("table", Date.now(), "Untitled")).toBeNull();
    });

    it("does nothing when there is no old draft", () => {
        expect(migrateLegacyDraft("table", Date.now(), "Untitled")).toBeNull();
    });

    it("leaves the old draft alone when the builder's guard rejects it", () => {
        seedLegacy({ rows: 7 });
        const isString = (value: unknown): value is string => typeof value === "string";
        expect(migrateLegacyDraft("table", Date.now(), "Untitled", isString)).toBeNull();
    });
});

describe("naming", () => {
    it("leaves a free name alone", () => {
        expect(uniqueName([meta({ name: "Sprint Board" })], "Hiring")).toBe("Hiring");
    });

    it("suffixes a collision rather than producing two identical rows", () => {
        const existing = [meta({ id: "a", name: "Sprint Board" })];
        expect(uniqueName(existing, "Sprint Board")).toBe("Sprint Board 2");
    });

    it("keeps counting past the first suffix", () => {
        const existing = [
            meta({ id: "a", name: "Sprint Board" }),
            meta({ id: "b", name: "Sprint Board 2" }),
        ];
        expect(uniqueName(existing, "Sprint Board")).toBe("Sprint Board 3");
    });

    it("falls back for an empty name", () => {
        expect(uniqueName([], "   ")).toBe("Untitled");
    });
});

describe("presentation", () => {
    it("formats sizes at each threshold", () => {
        expect(formatBytes(512)).toBe("512 B");
        expect(formatBytes(2048)).toBe("2 KB");
        expect(formatBytes(2 * 1024 * 1024)).toBe("2.0 MB");
    });

    it("reports storage as available in a normal browser", () => {
        expect(storageAvailable()).toBe(true);
    });
});
