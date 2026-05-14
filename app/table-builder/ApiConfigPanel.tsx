import { useCallback } from "react";
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
  TableHttpMethod,
  TableBuilderConfig,
  TableRowActionConfig,
} from "@/table-builder/data/tableBuilderTemplates";

const METHODS: TableHttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const TRIGGERS: TableRowActionConfig["trigger"][] = ["switch", "checkbox", "radio", "dropdown", "button", "rating"];

interface ApiConfigPanelProps {
  config: TableBuilderConfig;
  onChange: (next: TableBuilderConfig) => void;
}

const defaultApi = (baseUrl = ""): TableApiConfig => ({
  baseUrl,
  listMethod: "GET",
  listPath: "",
  listQuery: {},
  rowActions: [],
});

export function ApiConfigPanel({ config, onChange }: ApiConfigPanelProps) {
  const api = config.apiConfig ?? defaultApi(config.apiEndpoint);
  const interactiveCols = config.columns.filter(c =>
    ["switch", "checkbox", "boolean", "radio", "dropdown", "rating", "actions"].includes(c.type)
  );

  const update = useCallback(<K extends keyof TableApiConfig>(key: K, value: TableApiConfig[K]) => {
    onChange({ ...config, apiConfig: { ...api, [key]: value } });
  }, [api, config, onChange]);

  const addAction = useCallback(() => {
    const firstCol = interactiveCols[0];
    const trigger: TableRowActionConfig["trigger"] =
      firstCol?.type === "switch" || firstCol?.type === "boolean" ? "switch" :
      firstCol?.type === "radio" ? "radio" :
      firstCol?.type === "dropdown" ? "dropdown" :
      firstCol?.type === "rating" ? "rating" : "button";
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
  }, [api.rowActions, interactiveCols, update]);

  const updateAction = useCallback((idx: number, patch: Partial<TableRowActionConfig>) => {
    const next = [...(api.rowActions ?? [])];
    next[idx] = { ...next[idx], ...patch };
    update("rowActions", next);
  }, [api.rowActions, update]);

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
          onChange={e => {
            update("baseUrl", e.target.value);
            onChange({ ...config, apiEndpoint: e.target.value, apiConfig: { ...api, baseUrl: e.target.value } });
          }}
          placeholder="https://api.example.com/users"
          className="h-8 text-xs font-mono"
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
            value={api.listPath ?? ""}
            onChange={e => update("listPath", e.target.value)}
            placeholder="/search"
            className="h-8 text-xs font-mono"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] text-muted-foreground">Static query params (JSON)</Label>
        <Textarea
          value={JSON.stringify(api.listQuery ?? {}, null, 2)}
          onChange={e => {
            try { update("listQuery", JSON.parse(e.target.value || "{}")); }
            catch { }
          }}
          className="min-h-[60px] font-mono text-[10px]"
          placeholder='{ "include": "stats", "lang": "en" }'
          spellCheck={false}
        />
        <p className="text-[9px] text-muted-foreground">
          The hook automatically appends <code>page</code>, <code>size</code>, <code>q</code>, <code>filter[*]</code>, <code>sort</code> based on enabled features.
        </p>
      </div>

      {isPostLike && (
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">List request body template</Label>
          <Textarea
            value={api.listBody ?? ""}
            onChange={e => update("listBody", e.target.value)}
            placeholder='{ "search": "{{search}}", "page": {{page}}, "size": {{pageSize}}, "filters": {{filters}}, "sort": {{sort}} }'
            className="min-h-[80px] font-mono text-[10px]"
            spellCheck={false}
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
          <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={addAction} disabled={interactiveCols.length === 0}>
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
        {interactiveCols.length === 0 && (
          <p className="text-[10px] text-muted-foreground italic">
            Add a switch / checkbox / radio / dropdown / rating / actions column to wire row mutations.
          </p>
        )}
        <div className="space-y-2">
          {(api.rowActions ?? []).map((action, idx) => (
            <div key={action.id} className="border border-border rounded-md p-2 space-y-1.5 bg-muted/30">
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-[9px] h-4 px-1">{action.method}</Badge>
                <code className="text-[10px] flex-1 truncate font-mono text-muted-foreground">{action.path || "/:id"}</code>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={() => removeAction(idx)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <Select value={action.columnKey} onValueChange={v => updateAction(idx, { columnKey: v })}>
                  <SelectTrigger className="h-6 text-[10px]"><SelectValue placeholder="Column" /></SelectTrigger>
                  <SelectContent>
                    {interactiveCols.map(c => <SelectItem key={c.id} value={c.key} className="text-xs">{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={action.trigger} onValueChange={v => updateAction(idx, { trigger: v as TableRowActionConfig["trigger"] })}>
                  <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TRIGGERS.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
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
