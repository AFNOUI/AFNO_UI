import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CodePreview from "@/components/lab/CodePreview";
import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * `CodePreview` gained an optional `files` prop so multi-file variant bundles
 * (`component → hooks → services`) show real per-file tabs instead of one
 * concatenated blob, which hid the layering the bundle exists to teach.
 *
 * The prop is ADDITIVE: dozens of lab pages still pass a single `fullCode`
 * string. Half of these tests exist to keep that path byte-identical — a
 * regression there breaks every component page at once, silently, because
 * nothing else covers them.
 */

vi.mock("react-i18next", () => ({
    // the component only uses `t` for tab labels; identity keys keep the
    // assertions about *content* rather than about translation wiring
    useTranslation: () => ({ t: (key: string) => key }),
}));

const FILES = [
    { name: "constants.ts", code: "export const PAGE_SIZE = 10;" },
    { name: "services.ts", code: "export async function fetchPage() {}" },
    { name: "hooks.ts", code: "export function useThing() {}" },
    { name: "Widget.tsx", code: "export function Widget() { return null; }" },
];

/**
 * Radix Tabs activate on pointer-down / focus, not on a bare DOM `.click()`,
 * so drive them through userEvent. `pointerEventsCheck: 0` because happy-dom
 * does not compute the CSS that userEvent's visibility guard looks for.
 */
const user = userEvent.setup({ pointerEventsCheck: 0 });

async function openTab(name: string) {
    await user.click(screen.getByRole("tab", { name: new RegExp(name, "i") }));
}

/**
 * The code view's copy button is a Radix Tooltip, which throws without a
 * provider ancestor. The app supplies one at the layout level; tests must too.
 */
function withProvider(ui: React.ReactNode) {
    return <TooltipProvider>{ui}</TooltipProvider>;
}

afterEach(cleanup);

describe("CodePreview — single-file path (must not regress)", () => {
    it("shows only Preview and Snippet when no full source is supplied", async () => {
        render(
            withProvider(<CodePreview title="Demo" code="<Widget />">
                <div>live</div>
            </CodePreview>),
        );
        expect(screen.getAllByRole("tab")).toHaveLength(2);
        expect(screen.queryByRole("tab", { name: /component/i })).toBeNull();
    });

    it("adds the Component tab when `fullCode` is supplied", async () => {
        render(
            withProvider(<CodePreview title="Demo" code="<Widget />" fullCode="export function Widget() {}">
                <div>live</div>
            </CodePreview>),
        );
        expect(screen.getAllByRole("tab")).toHaveLength(3);
    });

    it("renders children on the Preview tab, not code", async () => {
        render(
            withProvider(<CodePreview title="Demo" code="SNIPPET_ONLY">
                <div>live child</div>
            </CodePreview>),
        );
        expect(screen.getByText("live child")).toBeDefined();
        expect(document.body.textContent).not.toContain("SNIPPET_ONLY");
    });

    it("shows the snippet on the Snippet tab and the full source on Component", async () => {
        render(
            withProvider(<CodePreview title="Demo" code="SNIPPET_TEXT" fullCode="FULL_SOURCE_TEXT">
                <div>live</div>
            </CodePreview>),
        );
        await openTab("code.snippet");
        expect(document.body.textContent).toContain("SNIPPET_TEXT");
        expect(document.body.textContent).not.toContain("FULL_SOURCE_TEXT");

        await openTab("code.component");
        expect(document.body.textContent).toContain("FULL_SOURCE_TEXT");
    });

    it("treats a blank `fullCode` as absent rather than showing an empty tab", async () => {
        render(
            withProvider(<CodePreview title="Demo" code="<Widget />" fullCode="   ">
                <div>live</div>
            </CodePreview>),
        );
        expect(screen.queryByRole("tab", { name: /code.component/i })).toBeNull();
    });
});

describe("CodePreview — multi-file bundles", () => {
    function renderFiles(files = FILES) {
        return render(
            withProvider(<CodePreview title="Async Field Select" code="<AsyncFieldSelect />" files={files}>
                <div>live</div>
            </CodePreview>),
        );
    }

    it("offers the Component tab when `files` is supplied without `fullCode`", async () => {
        renderFiles();
        expect(screen.getByRole("tab", { name: /code.component/i })).toBeDefined();
    });

    it("lists every file, in the order given", async () => {
        const { container } = renderFiles();
        await openTab("code.component");
        const names = [...container.querySelectorAll("button")]
            .map((b) => b.textContent ?? "")
            .filter((t) => /\.(ts|tsx)$/.test(t));
        // install order is meaningful: constants → services → hooks → component
        expect(names).toEqual(["constants.ts", "services.ts", "hooks.ts", "Widget.tsx"]);
    });

    it("shows the first file's code by default", async () => {
        renderFiles();
        await openTab("code.component");
        expect(document.body.textContent).toContain("export const PAGE_SIZE = 10;");
        expect(document.body.textContent).not.toContain("export async function fetchPage");
    });

    it("switches the displayed code when another file is chosen", async () => {
        renderFiles();
        await openTab("code.component");
        await user.click(screen.getByRole("button", { name: "services.ts" }));
        expect(document.body.textContent).toContain("export async function fetchPage");
        expect(document.body.textContent).not.toContain("export const PAGE_SIZE = 10;");
    });

    it("keeps the file strip out of the Snippet tab", async () => {
        renderFiles();
        await openTab("code.snippet");
        // the strip belongs to the Component view only; showing it beside the
        // snippet would imply the snippet is one of the installed files
        expect(screen.queryByRole("button", { name: "services.ts" })).toBeNull();
    });

    it("takes precedence over `fullCode` when both are passed", async () => {
        render(
            withProvider(<CodePreview
                title="Demo"
                code="<Widget />"
                fullCode="LEGACY_BLOB"
                files={FILES}
            >
                <div>live</div>
            </CodePreview>),
        );
        await openTab("code.component");
        expect(document.body.textContent).toContain("export const PAGE_SIZE = 10;");
        expect(document.body.textContent).not.toContain("LEGACY_BLOB");
    });

    it("ignores an empty `files` array and falls back to `fullCode`", async () => {
        render(
            withProvider(<CodePreview title="Demo" code="<Widget />" fullCode="FALLBACK_SOURCE" files={[]}>
                <div>live</div>
            </CodePreview>),
        );
        await openTab("code.component");
        expect(document.body.textContent).toContain("FALLBACK_SOURCE");
    });

    it("survives the file list shrinking under a stale selection", async () => {
        // the selected index is clamped, so a variant whose bundle loses a file
        // (e.g. a transport switch dropping constants.ts) cannot blank the panel
        const { rerender } = renderFiles();
        await openTab("code.component");
        await user.click(screen.getByRole("button", { name: "Widget.tsx" }));
        expect(document.body.textContent).toContain("export function Widget()");

        rerender(
            withProvider(<CodePreview title="Async Field Select" code="<AsyncFieldSelect />" files={FILES.slice(0, 2)}>
                <div>live</div>
            </CodePreview>),
        );
        await openTab("code.component");
        // index 3 no longer exists — must show the last available file, not blank
        expect(document.body.textContent).toContain("export async function fetchPage");
    });
});
