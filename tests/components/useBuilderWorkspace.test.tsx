import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import {
    readDoc,
    readIndex,
    useBuilderWorkspace,
    WORKSPACE_DIRTY_DEBOUNCE_MS,
} from "@/components/shared/builder-workspace";

/** Stand-in for a builder's draft: a template key plus something to edit. */
interface Draft {
    templateKey: string;
    title: string;
}

/**
 * The harness owns the draft, exactly as a builder page does — `onRestore` must
 * apply the payload in the same batch as the hook's own state, or the tests
 * stop describing the thing that actually ships.
 */
function setup(initial: Draft) {
    const restored: { value: Draft; source: string }[] = [];
    const view = renderHook(() => {
        const [draft, setDraft] = React.useState(initial);
        const workspace = useBuilderWorkspace<Draft>({
            id: "form",
            deps: [draft],
            snapshot: () => draft,
            label: draft.templateKey,
            identity: draft.templateKey,
            onRestore: (value, source) => {
                restored.push({ value, source });
                setDraft(value);
            },
        });
        return { workspace, setDraft };
    });
    return { view, restored };
}

type View = ReturnType<typeof setup>["view"];

const workspace = (view: View) => view.result.current.workspace;

/** Apply an edit and let the dirty check settle. */
function edit(view: View, draft: Draft) {
    act(() => view.result.current.setDraft(draft));
    act(() => {
        vi.advanceTimersByTime(WORKSPACE_DIRTY_DEBOUNCE_MS + 1);
    });
}

beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

describe("nothing is written without a save", () => {
    it("stores nothing while the user works", () => {
        const { view } = setup({ templateKey: "invoice", title: "Invoice" });
        edit(view, { templateKey: "invoice", title: "Invoice v2" });
        edit(view, { templateKey: "order", title: "Order summary" });

        expect(workspace(view).docs).toHaveLength(0);
        expect(readIndex("form")).toHaveLength(0);
    });

    it("loses unsaved work on reload, and says so while it is at risk", () => {
        const { view } = setup({ templateKey: "invoice", title: "Invoice" });
        edit(view, { templateKey: "invoice", title: "Invoice v2" });
        expect(workspace(view).dirty).toBe(true);
        view.unmount();

        const next = setup({ templateKey: "blank", title: "Untitled" });
        expect(next.restored).toHaveLength(0);
        expect(workspace(next.view).docs).toHaveLength(0);
    });

    it("reports a clean build until it is edited", () => {
        const { view } = setup({ templateKey: "invoice", title: "Invoice" });
        expect(workspace(view).dirty).toBe(false);

        edit(view, { templateKey: "invoice", title: "Invoice v2" });
        expect(workspace(view).dirty).toBe(true);
    });

    // Undo is the whole reason the dirty check is debounced rather than a
    // reference comparison: coming back to the saved state is not a change.
    it("stops reporting unsaved changes once the build is edited back", () => {
        const { view } = setup({ templateKey: "invoice", title: "Invoice" });
        act(() => workspace(view).saveAs("Invoice calculator"));

        edit(view, { templateKey: "invoice", title: "Invoice v2" });
        expect(workspace(view).dirty).toBe(true);

        edit(view, { templateKey: "invoice", title: "Invoice" });
        expect(workspace(view).dirty).toBe(false);
    });
});

describe("saving", () => {
    it("keeps the current work under a new name", () => {
        const { view } = setup({ templateKey: "invoice", title: "Invoice" });
        edit(view, { templateKey: "invoice", title: "Invoice v2" });

        act(() => workspace(view).saveAs("Invoice calculator"));

        const [doc] = workspace(view).docs;
        expect(doc.name).toBe("Invoice calculator");
        expect(workspace(view).activeDocId).toBe(doc.id);
        expect(workspace(view).dirty).toBe(false);
        expect(readDoc<Draft>("form", doc.id)?.title).toBe("Invoice v2");
    });

    it("writes later work into the build that is open", () => {
        const { view } = setup({ templateKey: "invoice", title: "Invoice" });
        act(() => workspace(view).saveAs("Invoice calculator"));
        const docId = workspace(view).activeDocId!;

        edit(view, { templateKey: "invoice", title: "Invoice v2" });
        act(() => workspace(view).update());

        expect(workspace(view).docs).toHaveLength(1);
        expect(workspace(view).dirty).toBe(false);
        expect(readDoc<Draft>("form", docId)?.title).toBe("Invoice v2");
    });

    it("branches later work off instead, when that is what was asked", () => {
        const { view } = setup({ templateKey: "invoice", title: "Invoice" });
        act(() => workspace(view).saveAs("Invoice calculator"));
        const first = workspace(view).activeDocId!;

        edit(view, { templateKey: "invoice", title: "Invoice v2" });
        act(() => workspace(view).saveAs("Invoice v2"));

        expect(workspace(view).docs).toHaveLength(2);
        expect(workspace(view).activeDocId).not.toBe(first);
        // The build it branched from is untouched.
        expect(readDoc<Draft>("form", first)?.title).toBe("Invoice");
    });

    it("does nothing when no build is open", () => {
        const { view } = setup({ templateKey: "invoice", title: "Invoice" });
        edit(view, { templateKey: "invoice", title: "Invoice v2" });

        act(() => workspace(view).update());

        expect(workspace(view).docs).toHaveLength(0);
        expect(workspace(view).dirty).toBe(true);
    });

    // The bug this whole rework exists to stop: a saved build coming back
    // holding something else.
    it("releases the open build when the template changes", () => {
        const { view } = setup({ templateKey: "invoice", title: "Invoice" });
        act(() => workspace(view).saveAs("Invoice calculator"));
        const invoiceId = workspace(view).activeDocId!;

        edit(view, { templateKey: "order", title: "Order summary" });
        expect(workspace(view).activeDocId).toBeNull();
        expect(workspace(view).dirty).toBe(true);

        // Update cannot reach the invoice build any more, even if pressed.
        act(() => workspace(view).update());
        expect(readDoc<Draft>("form", invoiceId)?.title).toBe("Invoice");

        act(() => workspace(view).saveAs("Order summary"));
        expect(workspace(view).docs).toHaveLength(2);
        expect(readDoc<Draft>("form", invoiceId)?.title).toBe("Invoice");
    });
});

describe("opening a saved build", () => {
    it("hands back the build that was asked for, not the newest", () => {
        const { view, restored } = setup({ templateKey: "invoice", title: "Invoice" });
        act(() => workspace(view).saveAs("Invoice calculator"));
        const invoiceId = workspace(view).activeDocId!;

        edit(view, { templateKey: "order", title: "Order summary" });
        act(() => workspace(view).saveAs("Order summary"));

        act(() => workspace(view).restore(invoiceId));

        expect(restored.at(-1)).toEqual({
            value: { templateKey: "invoice", title: "Invoice" },
            source: "user",
        });
        expect(workspace(view).activeDocId).toBe(invoiceId);
        expect(workspace(view).dirty).toBe(false);
    });

    it("makes the opened build the one later work updates", () => {
        const { view } = setup({ templateKey: "invoice", title: "Invoice" });
        act(() => workspace(view).saveAs("Invoice calculator"));
        const invoiceId = workspace(view).activeDocId!;
        edit(view, { templateKey: "order", title: "Order summary" });
        act(() => workspace(view).saveAs("Order summary"));

        act(() => workspace(view).restore(invoiceId));
        edit(view, { templateKey: "invoice", title: "Invoice v3" });
        act(() => workspace(view).update());

        expect(workspace(view).docs).toHaveLength(2);
        expect(readDoc<Draft>("form", invoiceId)?.title).toBe("Invoice v3");
    });

    it("reopens the last build on a fresh mount", () => {
        const { view } = setup({ templateKey: "invoice", title: "Invoice" });
        edit(view, { templateKey: "invoice", title: "Invoice v2" });
        act(() => workspace(view).saveAs("Invoice calculator"));
        view.unmount();

        const next = setup({ templateKey: "blank", title: "Untitled" });
        expect(next.restored.at(-1)).toEqual({
            value: { templateKey: "invoice", title: "Invoice v2" },
            source: "mount",
        });
        expect(workspace(next.view).dirty).toBe(false);
    });

    it("falls back to the newest readable build when the last one is gone", () => {
        const { view } = setup({ templateKey: "invoice", title: "Invoice" });
        act(() => workspace(view).saveAs("Invoice calculator"));
        const invoiceId = workspace(view).activeDocId!;
        edit(view, { templateKey: "order", title: "Order summary" });
        act(() => workspace(view).saveAs("Order summary"));
        const orderId = workspace(view).activeDocId!;
        view.unmount();

        window.localStorage.removeItem(`afnoui:builder-workspace:form:doc:${orderId}`);

        const next = setup({ templateKey: "blank", title: "Untitled" });
        expect(workspace(next.view).activeDocId).toBe(invoiceId);
        expect(next.restored.at(-1)?.value).toEqual({ templateKey: "invoice", title: "Invoice" });
    });

    it("leaves the builder on its defaults when nothing is stored", () => {
        const { view, restored } = setup({ templateKey: "blank", title: "Untitled" });
        expect(restored).toHaveLength(0);
        expect(workspace(view).docs).toHaveLength(0);
        expect(workspace(view).savedAt).toBeNull();
    });
});

describe("managing the list", () => {
    it("deleting the open build leaves the work on screen with nowhere to go", () => {
        const { view } = setup({ templateKey: "invoice", title: "Invoice" });
        act(() => workspace(view).saveAs("Invoice calculator"));
        const docId = workspace(view).activeDocId!;

        act(() => workspace(view).remove(docId));

        expect(workspace(view).docs).toHaveLength(0);
        expect(workspace(view).activeDocId).toBeNull();
        expect(workspace(view).dirty).toBe(true);
    });

    it("copies a build without opening it", () => {
        const { view } = setup({ templateKey: "invoice", title: "Invoice" });
        act(() => workspace(view).saveAs("Invoice calculator"));
        const docId = workspace(view).activeDocId!;

        act(() => workspace(view).duplicate(docId));

        expect(workspace(view).docs).toHaveLength(2);
        expect(workspace(view).activeDocId).toBe(docId);
        expect(workspace(view).docs.map((doc) => doc.name).sort()).toEqual([
            "Invoice calculator",
            "Invoice calculator 2",
        ]);
    });
});
