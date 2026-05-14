/**
 * Table variant: Server-side CRM (expert, api).
 * Exercises API-driven sort + pagination, multi-sort, expandable rows, column filters,
 * column resize, inline edit, and drag-and-drop.
 *
 * Because `dataMode: "api"`, codegen emits the `useTableData` hook that talks to
 * `config.apiEndpoint`. The generated `DataTable.tsx` wires the hook into the engine.
 */

import { tableTemplates } from "@/table-builder/data/tableBuilderTemplates";
import type { TableBuilderConfig } from "@/tables/types/types";

import type { DataMode } from "@/table-builder/utils/tableCodeGenerator";

export const tableConfig: TableBuilderConfig = tableTemplates.serverSideCRM.config;
export const sampleData = tableTemplates.serverSideCRM.sampleData;
export const dataMode: DataMode = "api";

export const data = {
  title: "CRM Dashboard (Server-side)",
  description: "API sort/pagination, multi-sort, expandable rows, DnD, column filters.",
};
