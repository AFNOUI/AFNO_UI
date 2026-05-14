/**
 * Table variant: Team members (intermediate, static).
 * Exercises row selection, inline edit, column visibility, bulk actions, and column filters.
 */

import { tableTemplates } from "@/table-builder/data/tableBuilderTemplates";
import type { TableBuilderConfig } from "@/tables/types/types";

import type { DataMode } from "@/table-builder/utils/tableCodeGenerator";

export const tableConfig: TableBuilderConfig = tableTemplates.teamMembers.config;
export const sampleData = tableTemplates.teamMembers.sampleData;
export const dataMode: DataMode = "static";

export const data = {
  title: "Team Members",
  description: "Avatars, roles, status badges, row selection, inline edit, bulk actions.",
};
