"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button, type ButtonProps } from "@/components/ui/button";

import { ToolbarTip } from "./ToolbarTip";

export interface ToolbarIconButtonProps extends Omit<ButtonProps, "size" | "children"> {
  icon: LucideIcon;
  /** Accessible name — also rendered as the tooltip unless `tip` overrides it. */
  label: string;
  tip?: React.ReactNode;
}

/**
 * PRIMITIVE — square, icon-only toolbar control (undo, redo, and friends).
 *
 * `label` is mandatory: an icon-only button without an accessible name is
 * invisible to screen readers.
 */
export const ToolbarIconButton = React.forwardRef<HTMLButtonElement, ToolbarIconButtonProps>(
  ({ icon: Icon, label, tip, variant = "outline", className, ...props }, ref) => (
    <ToolbarTip tip={tip ?? label}>
      <Button
        ref={ref}
        size="icon"
        variant={variant}
        aria-label={label}
        className={cn("h-9 w-9 shrink-0", className)}
        {...props}
      >
        <Icon className="h-4 w-4" />
      </Button>
    </ToolbarTip>
  ),
);
ToolbarIconButton.displayName = "ToolbarIconButton";
