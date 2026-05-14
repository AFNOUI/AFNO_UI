import { describe, expect, it } from "vitest";
import * as React from "react";

import { HeaderlessMonth } from "@/forms/utils/dateSerialize";

describe("dateSerialize / HeaderlessMonth", () => {
  it("renders only the LAST child in the wrapper div", () => {
    const caption = React.createElement("div", { key: "c" }, "caption");
    const grid = React.createElement("div", { key: "g" }, "grid");

    const element = HeaderlessMonth({
      children: [caption, grid],
      className: "extra",
    }) as React.ReactElement;

    const props = element.props as { className: string; children: React.ReactNode };
    expect(props.className).toContain("space-y-4");
    expect(props.className).toContain("extra");
    // React.Children.toArray re-keys but preserves order — last child should be grid.
    const lastChild = props.children as React.ReactElement;
    expect(lastChild.props).toEqual({ children: "grid" });
  });

  it("renders null when no children", () => {
    const element = HeaderlessMonth({ children: undefined }) as React.ReactElement;
    expect((element.props as { children: unknown }).children).toBeNull();
  });

  it("works with a single child (returns it as the last)", () => {
    const only = React.createElement("div", { key: "o" }, "only");
    const element = HeaderlessMonth({ children: only }) as React.ReactElement;
    const lastChild = (element.props as { children: React.ReactElement }).children;
    expect(lastChild.props).toEqual({ children: "only" });
  });
});
