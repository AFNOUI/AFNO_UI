/**
 * Table variant: Invoice tracker (intermediate, static).
 * Exercises footer aggregation, multi-sort, and currency/switch column types.
 */

import { tableTemplates } from "@/table-builder/data/tableBuilderTemplates";
import type { TableBuilderConfig } from "@/tables/types/types";

import type { DataMode } from "@/table-builder/utils/tableCodeGenerator";

export const tableConfig: TableBuilderConfig = tableTemplates.invoiceTracker.config;
export const sampleData = tableTemplates.invoiceTracker.sampleData;
export const dataMode: DataMode = "static";

export const data = {
  title: "Invoice Tracker",
  description: "Currency totals, multi-sort, footer aggregation, paid switches.",
};
