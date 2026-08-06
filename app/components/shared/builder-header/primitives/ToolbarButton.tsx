"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button, type ButtonProps } from "@/components/ui/button";

import { ToolbarTip } from "./ToolbarTip";

export interface ToolbarButtonProps extends Omit<ButtonProps, "size"> {
  /** Leading icon. */
  icon?: LucideIcon;
  /** Optional tooltip. */
  tip?: React.ReactNode;
  /**
   * Collapse the text label to icon-only below the `sm` breakpoint.
   * Keeps crowded toolbars (table builder) usable on phones.
   */
  collapseLabel?: boolean;
}

/**
 * PRIMITIVE — the labelled action button of a builder toolbar.
 *
 * Fixes height, radius, icon size and gap so "Generate 1k rows", "JSON",
 * "Import" and "Export" are visually interchangeable across builders.
 *
 * `forwardRef` + prop spreading are deliberate: this is meant to be handed to
 * `<DialogTrigger asChild>` by the per-builder JSON dialogs.
 */
export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ icon: Icon, tip, collapseLabel = false, variant = "outline", className, children, ...props }, ref) => (
    <ToolbarTip tip={tip}>
      <Button
        ref={ref}
        size="sm"
        variant={variant}
        className={cn(
          "h-9 gap-1.5 px-3 text-sm font-medium",
          collapseLabel && !children && "px-0",
          className,
        )}
        {...props}
      >
        {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
        {children ? (
          <span className={cn("truncate", collapseLabel && "hidden sm:inline")}>{children}</span>
        ) : null}
      </Button>
    </ToolbarTip>
  ),
);
ToolbarButton.displayName = "ToolbarButton";
