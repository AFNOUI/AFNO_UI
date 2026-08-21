import { useCallback, useEffect } from "react";
import { Plus, Trash2, Webhook } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type {
  TableApiConfig,
  TableColumnType,
  TableHttpMethod,
  TableBuilderConfig,
  TableRowActionConfig,
} from "@/table-builder/data/tableBuilderTemplates";

const METHODS: TableHttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const COLUMN_TYPE_TO_TRIGGER: Partial<Record<TableColumnType, TableRowActionConfig["trigger"]>> = {
  radio: "radio",
  switch: "switch",
  rating: "rating",
  actions: "button",
  boolean: "checkbox",
  dropdown: "dropdown",
};

const INTERACTIVE_COLUMN_TYPES = Object.keys(
  COLUMN_TYPE_TO_TRIGGER,
) as TableColumnType[];

interface ApiConfigPanelProps {
  config: TableBuilderConfig;
  onChange: (next: TableBuilderConfig) => void;
}

const defaultApi = (baseUrl = ""): TableApiConfig => ({
  baseUrl,
  listPath: "",
  listQuery: {},
  rowActions: [],
  listMethod: "GET",
});

export function ApiConfigPanel({ config, onChange }: ApiConfigPanelProps) {
  const api = config.apiConfig ?? defaultApi(config.apiEndpoint);
  const interactiveCols = config.columns.filter(c =>
    INTERACTIVE_COLUMN_TYPES.includes(c.type)
  );

  const usedColumnKeys = new Set(
    (api.rowActions ?? []).map(a => a.columnKey),
  );
  const availableCols = interactiveCols.filter(c => !usedColumnKeys.has(c.key));

  const update = useCallback(<K extends keyof TableApiConfig>(key: K, value: TableApiConfig[K]) => {
    onChange({ ...config, apiConfig: { ...api, [key]: value } });
  }, [api, config, onChange]);

  useEffect(() => {
    const validKeys = new Set(interactiveCols.map(c => c.key));
    const rowActions = api.rowActions ?? [];
    const seen = new Set<string>();
    const kept = rowActions.filter(a => {
      if (!validKeys.has(a.columnKey)) return false;
      if (seen.has(a.columnKey)) return false;
      seen.add(a.columnKey);
      return true;
    });
    if (kept.length !== rowActions.length) {
      onChange({ ...config, apiConfig: { ...api, rowActions: kept } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.columns, api.rowActions]);

  const addAction = useCallback(() => {
    const firstCol = availableCols[0];
    const trigger: TableRowActionConfig["trigger"] =
      (firstCol && COLUMN_TYPE_TO_TRIGGER[firstCol.type]) ?? "button";
    const next: TableRowActionConfig = {
      id: `action-${Date.now()}`,
      columnKey: firstCol?.key ?? "",
      trigger,
      method: trigger === "button" ? "POST" : "PATCH",
      path: trigger === "button" ? "/:id/run" : "/:id",
      body: trigger === "button" ? "" : `{ "${firstCol?.key ?? "value"}": {{value}} }`,
      optimistic: true,
    };
    update("rowActions", [...(api.rowActions ?? []), next]);
  }, [api.rowActions, availableCols, update]);

  const updateAction = useCallback((idx: number, patch: Partial<TableRowActionConfig>) => {
    const next = [...(api.rowActions ?? [])];
    next[idx] = { ...next[idx], ...patch };
    update("rowActions", next);
  }, [api.rowActions, update]);

  // Column selection is the only thing that decides `trigger` now — re-derive
  // it from the newly picked column's type instead of leaving it stale.
  const changeActionColumn = useCallback((idx: number, columnKey: string) => {
    const col = interactiveCols.find((c) => c.key === columnKey);
    const trigger = (col && COLUMN_TYPE_TO_TRIGGER[col.type]) ?? "button";
    updateAction(idx, { columnKey, trigger });
  }, [interactiveCols, updateAction]);

  const removeAction = useCallback((idx: number) => {
    update("rowActions", (api.rowActions ?? []).filter((_, i) => i !== idx));
  }, [api.rowActions, update]);

  const isPostLike = api.listMethod !== "GET";

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-[11px] text-muted-foreground">Base URL</Label>
        <Input
          value={api.baseUrl}
          className="h-8 text-xs font-mono"
          placeholder="https://api.example.com/users"
          onChange={e => {
            update("baseUrl", e.target.value);
            onChange({ ...config, apiEndpoint: e.target.value, apiConfig: { ...api, baseUrl: e.target.value } });
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">List method</Label>
          <Select value={api.listMethod} onValueChange={v => update("listMethod", v as TableHttpMethod)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{METHODS.map(m => <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">List path (after baseUrl)</Label>
          <Input
            placeholder="/search"
            value={api.listPath ?? ""}
            className="h-8 text-xs font-mono"
            onChange={e => update("listPath", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] text-muted-foreground">Static query params (JSON)</Label>
        <Textarea
          spellCheck={false}
          className="min-h-[60px] font-mono text-[10px]"
          placeholder='{ "include": "stats", "lang": "en" }'
          value={JSON.stringify(api.listQuery ?? {}, null, 2)}
          onChange={e => {
            try { update("listQuery", JSON.parse(e.target.value || "{}")); }
            catch { }
          }}
        />
        <p className="text-[9px] text-muted-foreground">
          The hook automatically appends <code>page</code>, <code>size</code>, <code>q</code>, <code>filter[*]</code>, <code>sort</code> based on enabled features.
        </p>
      </div>

      {isPostLike && (
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">List request body template</Label>
          <Textarea
            spellCheck={false}
            value={api.listBody ?? ""}
            className="min-h-[80px] font-mono text-[10px]"
            onChange={e => update("listBody", e.target.value)}
            placeholder='{ "search": "{{search}}", "page": {{page}}, "size": {{pageSize}}, "filters": {{filters}}, "sort": {{sort}} }'
          />
          <p className="text-[9px] text-muted-foreground">
            Tokens: <code>{`{{search}}`}</code>, <code>{`{{page}}`}</code>, <code>{`{{pageSize}}`}</code>, <code>{`{{filters}}`}</code>, <code>{`{{sort}}`}</code>.
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-[11px] text-muted-foreground">Headers (JSON)</Label>
        <Textarea
          value={JSON.stringify(api.headers ?? {}, null, 2)}
          onChange={e => {
            try { update("headers", JSON.parse(e.target.value || "{}")); }
            catch { }
          }}
          placeholder='{ "Authorization": "Bearer …" }'
          className="min-h-[50px] font-mono text-[10px]"
          spellCheck={false}
        />
      </div>

      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-[11px] flex items-center gap-1.5 text-muted-foreground">
            <Webhook className="h-3 w-3" /> Row actions ({api.rowActions?.length ?? 0})
          </Label>
          <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={addAction} disabled={availableCols.length === 0}>
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
        {availableCols.length === 0 && (
          <p className="text-[10px] text-muted-foreground italic">
            {interactiveCols.length === 0
              ? "Add a switch / checkbox / radio / dropdown / rating / actions column to wire row mutations."
              : "Every editable column already has a row action wired."}
          </p>
        )}
        <div className="space-y-2">
          {(api.rowActions ?? []).map((action, idx) => (
            <div key={action.id} className="border border-border rounded-md p-2 space-y-1.5 bg-muted/30">
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-[9px] h-4 px-1">{action.method}</Badge>
                <Badge variant="secondary" className="text-[9px] h-4 px-1 font-normal">{action.trigger}</Badge>
                <code className="text-[10px] flex-1 truncate font-mono text-muted-foreground">{action.path || "/:id"}</code>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={() => removeAction(idx)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              {/* Column is the only picker here — its `type` (set in the Columns
                  panel) is what actually renders the cell control. `trigger`
                  above is read-only, derived from that column's type. */}
              <Select value={action.columnKey} onValueChange={v => changeActionColumn(idx, v)}>
                <SelectTrigger className="h-6 text-[10px]"><SelectValue placeholder="Column" /></SelectTrigger>
                <SelectContent>
                  {/* `label` is deliberately "" for an actions column (no header
                      text needed there) — but that same empty string renders as
                      invisible text once it's a Column choice, making the
                      trigger look blank even when correctly selected. */}
                  {/* This action's own current column stays listed even if it's
                      otherwise "used up", so switching away and back doesn't
                      strand the selector on a value with no matching item. */}
                  {interactiveCols
                    .filter(c => c.key === action.columnKey || availableCols.includes(c))
                    .map(c => <SelectItem key={c.id} value={c.key} className="text-xs">{c.label || c.key}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-[60px_1fr] gap-1.5">
                <Select value={action.method} onValueChange={v => updateAction(idx, { method: v as TableHttpMethod })}>
                  <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{METHODS.map(m => <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>)}</SelectContent>
                </Select>
                <Input
                  value={action.path}
                  onChange={e => updateAction(idx, { path: e.target.value })}
                  placeholder="/:id/toggle"
                  className="h-6 text-[10px] font-mono"
                />
              </div>
              {action.method !== "GET" && action.method !== "DELETE" && (
                <Textarea
                  value={action.body ?? ""}
                  onChange={e => updateAction(idx, { body: e.target.value })}
                  placeholder='{ "value": {{value}} }'
                  className="min-h-[40px] font-mono text-[10px]"
                  spellCheck={false}
                />
              )}
              <label className="flex items-center justify-between text-[10px] cursor-pointer pt-0.5">
                <span>Optimistic update</span>
                <Switch checked={action.optimistic !== false} onCheckedChange={v => updateAction(idx, { optimistic: v })} className="scale-[0.6]" />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
