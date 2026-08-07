"use client";

import { Info, AlertCircle, AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";

import type { BuilderIssueLevel } from "../types";

const LEVEL_ICONS = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

export interface IssueLevelIconProps {
  level: BuilderIssueLevel;
  className?: string;
}

/** PRIMITIVE — the severity glyph for one issue. */
export function IssueLevelIcon({ level, className }: IssueLevelIconProps) {
  const Icon = LEVEL_ICONS[level];
  return <Icon aria-hidden="true" className={cn("h-3.5 w-3.5 shrink-0", className)} />;
}
