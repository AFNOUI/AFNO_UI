/**
 * Table variant: Product catalog (intermediate, static).
 * Exercises pinned columns, column resize, and progress/rating column types.
 */

import { tableTemplates } from "@/table-builder/data/tableBuilderTemplates";
import type { TableBuilderConfig } from "@/tables/types/types";

import type { DataMode } from "@/table-builder/utils/tableCodeGenerator";

export const tableConfig: TableBuilderConfig = tableTemplates.productCatalog.config;
export const sampleData = tableTemplates.productCatalog.sampleData;
export const dataMode: DataMode = "static";

export const data = {
  title: "Product Catalog",
  description: "Pinned columns, column resize, progress bars, and ratings.",
};
