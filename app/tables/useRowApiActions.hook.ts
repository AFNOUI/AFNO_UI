/**
 * Encapsulates every API-bound piece of row-action logic the engine needs:
 *
 *   • `wrappedCellUpdate(rowId, key, value)` — optimistic local update +
 *     user `onCellInteract` dispatch + matching `apiConfig.rowActions` fetch
 *     with rollback on failure.
 *   • `getRowActionButtons(row, col)` — builds the click handlers for any
 *     `trigger:"button"` row actions targeting an `actions` column.
 *
 * Network calls themselves live in `./tableServices` — this hook just glues
 * them to React state + the user's callback.
 */
import { useCallback } from "react";

import { toast } from "@/hooks/use-toast";
import { runRowActionRequest, runRowActionButton } from "./tableServices";
import type { TableBuilderConfig, TableColumnConfig, TableRow } from "./types";

import type { DefaultCellRowAction } from "./defaultCellRenderer";

export interface UseRowApiActionsArgs {
  rows: TableRow[];
  /** Optional user-supplied dispatcher (typed per-column handlers). */
  onCellInteract?: (
    row: TableRow,
    key: string,
    oldValue: unknown,
    newValue: unknown,
  ) => Promise<void> | void;
  config: TableBuilderConfig;
  /** Optimistic local mutation used by both the user dispatch + rollback. */
  applyLocalUpdate: (rowId: string, key: string, value: unknown) => void;
}

export interface UseRowApiActionsReturn {
  getRowActionButtons: (
    row: Record<string, unknown>,
    col: TableColumnConfig,
  ) => DefaultCellRowAction[];
  wrappedCellUpdate: (rowId: string, key: string, value: unknown) => void;
}

export function useRowApiActions({
  config,
  rows,
  applyLocalUpdate,
  onCellInteract,
}: UseRowApiActionsArgs): UseRowApiActionsReturn {
  const wrappedCellUpdate = useCallback(
    (rowId: string, key: string, value: unknown) => {
      const prev = rows.find((r) => r.id === rowId);
      const prevValue = prev ? prev[key] : undefined;
      applyLocalUpdate(rowId, key, value);

      // ── user-supplied dispatcher (errors surfaced via toast; never rollback) ──
      if (onCellInteract && prev && prevValue !== value) {
        try {
          const result = onCellInteract(prev, key, prevValue, value);
          if (result && typeof (result as Promise<void>).catch === "function") {
            (result as Promise<void>).catch((e: unknown) => {
              toast({
                title: "Interaction handler failed",
                description: e instanceof Error ? e.message : "Unknown error",
                variant: "destructive",
              });
            });
          }
        } catch (e) {
          toast({
            title: "Interaction handler failed",
            description: e instanceof Error ? e.message : "Unknown error",
            variant: "destructive",
          });
        }
      }

      // ── apiConfig.rowActions matching this column key ──
      const action = config.apiConfig?.rowActions?.find(
        (a) => a.columnKey === key && a.trigger !== "button",
      );
      const api = config.apiConfig;
      if (!action || !api?.baseUrl || !prev) return;

      void runRowActionRequest(action, api, prev, value).then((result) => {
        if (!result.ok) {
          if (action.optimistic !== false)
            applyLocalUpdate(rowId, key, prevValue);
          toast({
            title: "Update failed",
            description: `${result.label} — ${result.error?.message ?? "network error"}`,
            variant: "destructive",
          });
        }
      });
    },
    [config.apiConfig, applyLocalUpdate, rows, onCellInteract],
  );

  const getRowActionButtons = useCallback(
    (row: Record<string, unknown>, col: TableColumnConfig): DefaultCellRowAction[] => {
      if (col.type !== "actions") return [];
      const api = config.apiConfig;
      const actions =
        api?.rowActions?.filter(
          (a) => a.trigger === "button" && a.columnKey === col.key,
        ) ?? [];
      if (actions.length === 0 || !api?.baseUrl) return [];
      return actions.map((action) => ({
        id: action.id,
        title: `${action.method} ${action.path}`,
        onClick: () => {
          void runRowActionButton(action, api, row).then((result) => {
            if (result.ok)
              toast({ title: "Action complete", description: result.label });
            else
              toast({
                title: "Action failed",
                description: `${result.label} — ${result.error?.message ?? "network error"}`,
                variant: "destructive",
              });
          });
        },
      }));
    },
    [config.apiConfig],
  );

  return { wrappedCellUpdate, getRowActionButtons };
}
