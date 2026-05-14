/**
 * Table variant: Pinned + virtualized grid (expert, static).
 * Exercises column pinning (left + right), virtualization (@tanstack/react-virtual),
 * and dense layout — good for datasets 10k+ rows.
 */

import { tableTemplates } from "@/table-builder/data/tableBuilderTemplates";
import type { TableBuilderConfig } from "@/tables/types/types";

import type { DataMode } from "@/table-builder/utils/tableCodeGenerator";

export const tableConfig: TableBuilderConfig = tableTemplates.pinnedVirtualized.config;
export const sampleData = tableTemplates.pinnedVirtualized.sampleData;
export const dataMode: DataMode = "static";

export const data = {
  title: "Pinned + Virtualized",
  description: "Pinned columns and row virtualization for huge datasets.",
};
