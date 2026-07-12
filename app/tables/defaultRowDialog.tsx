/**
 * Default row-detail dialog body — the single built-in fallback rendered when
 * `rowClickAction.type === "dialog"` and neither `renderDialog` nor
 * `dialogTemplate` is supplied.
 *
 * Resolution order (built into the engine):
 *   rowClickAction.renderDialog → rowClickAction.dialogTemplate → <DefaultRowDialogBody />
 */
import type { TableRow } from "./types";

export function DefaultRowDialogBody({ row }: { row: TableRow }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {Object.entries(row).map(([k, v]) => (
        <div key={k} className="p-2.5 rounded-md bg-muted/40 border border-border/50">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{k}</div>
          <div className="text-xs font-medium break-words mt-0.5">
            {typeof v === "object" ? JSON.stringify(v) : String(v ?? "—")}
          </div>
        </div>
      ))}
    </div>
  );
}
