/**
 * Types + derivations shared by `tableCodeGenerator.ts` and the emitters in
 * this folder.
 *
 * Lives here rather than in `tableCodeGenerator.ts` so `dataFiles.ts` can use
 * them without importing its own parent (which would be a cycle).
 */
import type { TableBuilderConfig } from "@/tables/types";

export interface GeneratedFile {
  name: string;
  path: string;
  description: string;
  isFixed: boolean;
  language: "tsx" | "ts" | "json";
  code: string;
}

export type DataMode = "static" | "api";

/**
 * Per-feature data source. Search / filter / sort / pagination can each be
 * "client" or "api" independently; explicit `config.sources` wins, otherwise
 * we fall back to the legacy `sortMode` / `paginationMode` flags.
 */
export function resolveSource(
  config: TableBuilderConfig,
  key: "search" | "filter" | "sort" | "pagination",
): "client" | "api" {
  const explicit = config.sources?.[key];
  if (explicit) return explicit;
  if (key === "sort") return config.sortMode;
  if (key === "pagination") return config.paginationMode;
  return config.sortMode;
}
