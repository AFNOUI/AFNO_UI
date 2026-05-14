/**
 * Table variant: Simple contact list (static, basic).
 *
 * Mirrors the `forms/forms-login.tsx` pattern — thin re-export of a curated
 * template from `tableBuilderTemplates` so the builder UI and the CLI variant
 * registry consume the same source of truth.
 */

import { tableTemplates } from "@/table-builder/data/tableBuilderTemplates";
import type { TableBuilderConfig } from "@/tables/types/types";

import type { DataMode } from "@/table-builder/utils/tableCodeGenerator";

export const tableConfig: TableBuilderConfig = tableTemplates.simpleList.config;
export const sampleData = tableTemplates.simpleList.sampleData;
export const dataMode: DataMode = "static";

export const data = {
  title: "Simple Contact List",
  description: "Basic table with search + pagination — ideal starter variant.",
};
