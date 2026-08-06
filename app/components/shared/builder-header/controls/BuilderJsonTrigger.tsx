"use client";

import * as React from "react";
import { FileJson } from "lucide-react";

import { ToolbarButton, type ToolbarButtonProps } from "../primitives/ToolbarButton";

/**
 * CONTROL — the single "JSON" button that opens a builder's import/export
 * dialog.
 *
 * Split out from `<BuilderJsonDialog />` so the trigger can also be handed to a
 * `<DialogTrigger asChild>` elsewhere; refs and props flow through.
 */
export const BuilderJsonTrigger = React.forwardRef<HTMLButtonElement, Partial<ToolbarButtonProps>>(
  ({ children = "JSON", tip = "Import or export this builder as JSON", ...props }, ref) => (
    <ToolbarButton ref={ref} icon={FileJson} tip={tip} collapseLabel {...props}>
      {children}
    </ToolbarButton>
  ),
);
BuilderJsonTrigger.displayName = "BuilderJsonTrigger";
