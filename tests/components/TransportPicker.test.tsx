import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { TransportPicker } from "@/components/shared/TransportPicker";
import { DEFAULT_TRANSPORT, type TransportChoice } from "@/lib/codegen/transport";

/**
 * `TransportPicker` is the only place the axios / TanStack Query code paths are
 * reachable from the site — before it existed, `transportFlags()` had zero
 * callers and every Export tab silently rendered the fetch default.
 *
 * The contract worth protecting is what it *says*, not how it looks: the two
 * axes stay independent, and the dependency and flag text match the selection.
 * A config that would make the picker inert (a client-side table generating
 * no services.ts) isn't handled here — the caller (`BuilderInstallPanel`)
 * simply omits the `transport` slot in that case, so the whole step never
 * renders. A control nobody can make do anything is worse than no control.
 */

const AXIOS_TANSTACK: TransportChoice = { http: "axios", query: "tanstack" };

/**
 * Query by id, not by accessible name. Name matching is ambiguous here on
 * purpose-built copy: /fetch/i also matches "re-fetching" in the TanStack
 * description, and /axios/i matches both the option title and the <code>axios</code>
 * inside it. The `idPrefix` contract is the stable handle.
 */
function setup(value: TransportChoice = DEFAULT_TRANSPORT, extra = {}) {
    const onChange = vi.fn();
    const { container } = render(
        <TransportPicker value={value} onChange={onChange} idPrefix="tp" {...extra} />,
    );
    const radio = (axis: "fetch" | "axios" | "local" | "tanstack") => {
        const el = container.querySelector(`#tp-${axis}`);
        if (!el) throw new Error(`missing radio #tp-${axis}`);
        return el as HTMLElement;
    };
    return { onChange, radio, container };
}

afterEach(cleanup);

describe("TransportPicker — the two axes are independent", () => {
    it("renders both axes as separate groups", () => {
        const { radio } = setup();
        // two groups, not one four-way list: collapsing them reads as "these
        // choices are coupled", which is exactly what R-56 says they are not.
        expect(screen.getAllByRole("radiogroup")).toHaveLength(2);
        for (const axis of ["fetch", "axios", "local", "tanstack"] as const) {
            expect(radio(axis)).toBeDefined();
        }
    });

    it("checks the options matching `value`, and only those", () => {
        const { radio } = setup(AXIOS_TANSTACK);
        expect(radio("axios").getAttribute("aria-checked")).toBe("true");
        expect(radio("tanstack").getAttribute("aria-checked")).toBe("true");
        expect(radio("fetch").getAttribute("aria-checked")).toBe("false");
        expect(radio("local").getAttribute("aria-checked")).toBe("false");
    });

    it("changing the HTTP axis leaves the query axis untouched", () => {
        const { onChange, radio } = setup({ http: "fetch", query: "tanstack" });
        radio("axios").click();
        // the whole point: picking axios must not reset an existing TanStack choice
        expect(onChange).toHaveBeenCalledWith({ http: "axios", query: "tanstack" });
    });

    it("changing the query axis leaves the HTTP axis untouched", () => {
        const { onChange, radio } = setup({ http: "axios", query: "local" });
        radio("tanstack").click();
        expect(onChange).toHaveBeenCalledWith({ http: "axios", query: "tanstack" });
    });

    it("both directions are reachable, so a choice is reversible", () => {
        const { onChange, radio } = setup(AXIOS_TANSTACK);
        radio("fetch").click();
        expect(onChange).toHaveBeenCalledWith({ http: "fetch", query: "tanstack" });
        onChange.mockClear();
        radio("local").click();
        expect(onChange).toHaveBeenCalledWith({ http: "axios", query: "local" });
    });
});

describe("TransportPicker — what it promises to install", () => {
    it("says the default costs nothing", () => {
        setup();
        expect(document.body.textContent).toContain("no extra packages");
        expect(document.body.textContent).not.toContain("@tanstack/react-query,");
    });

    it("names exactly the packages a non-default choice adds", () => {
        setup(AXIOS_TANSTACK);
        const text = document.body.textContent ?? "";
        expect(text).toContain("axios");
        expect(text).toContain("@tanstack/react-query");
        expect(text).not.toContain("no extra packages");
    });

    it("shows the CLI flags for the current choice when no install command is given", () => {
        setup({ http: "axios", query: "local" });
        const text = document.body.textContent ?? "";
        expect(text).toContain("--axios");
        // the query axis was not selected, so its flag must not be advertised
        expect(text).not.toContain("--tanstack-query --");
    });

    it("prefers an explicit install command over the bare flag list", () => {
        setup(AXIOS_TANSTACK, {
            installCommand: "npx afnoui add tables/tables-server-crm --axios --tanstack-query",
        });
        expect(document.body.textContent).toContain(
            "npx afnoui add tables/tables-server-crm --axios --tanstack-query",
        );
    });

    it("always offers the no-reinstall switch command", () => {
        setup(AXIOS_TANSTACK);
        // `afnoui transport` is the whole reason switching doesn't need --force
        expect(document.body.textContent).toContain("afnoui transport");
    });
});

describe("TransportPicker — multiple instances on one page", () => {
    it("scopes its input ids by prefix so two pickers do not collide", () => {
        const onChange = vi.fn();
        const { container } = render(
            <div>
                <TransportPicker value={DEFAULT_TRANSPORT} onChange={onChange} idPrefix="one" />
                <TransportPicker value={DEFAULT_TRANSPORT} onChange={onChange} idPrefix="two" />
            </div>,
        );
        expect(container.querySelector("#one-axios")).not.toBeNull();
        expect(container.querySelector("#two-axios")).not.toBeNull();
        // a shared id would make clicking one picker drive the other
        expect(container.querySelectorAll("#one-axios")).toHaveLength(1);
    });

    it("labels are wired to their inputs, so clicking the card selects it", () => {
        const { container } = render(
            <TransportPicker value={DEFAULT_TRANSPORT} onChange={vi.fn()} idPrefix="lbl" />,
        );
        // every option must be inside a label bound to its radio, or the whole
        // card is not clickable and only the small dot is
        for (const axis of ["fetch", "axios", "local", "tanstack"]) {
            const label = container.querySelector(`label[for="lbl-${axis}"]`);
            expect(label, `label for ${axis}`).not.toBeNull();
            expect(label!.querySelector(`#lbl-${axis}`)).not.toBeNull();
        }
    });
});
