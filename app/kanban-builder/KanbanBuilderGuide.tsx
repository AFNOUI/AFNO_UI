/**
 * Guide tab — quick-reference for the kanban builder.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, MousePointer2, AlertTriangle, Code2, MessageSquare, Languages, Activity, Webhook } from "lucide-react";

export function KanbanBuilderGuide() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Layers className="h-4 w-4" /> Layouts</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p><Badge variant="secondary" className="mr-1.5">Board</Badge> Classic horizontal columns. Best for sprints, bug triage, sales pipelines.</p>
          <p><Badge variant="secondary" className="mr-1.5">Compact</Badge> Responsive 4-col grid. Best for quick task lists.</p>
          <p><Badge variant="secondary" className="mr-1.5">Swimlane</Badge> Matrix grouped by assignee/priority/custom key. Best for multi-owner content calendars.</p>
          <p><Badge variant="secondary" className="mr-1.5">Timeline</Badge> Horizontal time-bucket columns (week/sprint/quarter). Best for roadmaps.</p>
          <p><Badge variant="secondary" className="mr-1.5">Calendar</Badge> 7-column day-of-week grid. Best for scheduling.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><MousePointer2 className="h-4 w-4" /> Drag &amp; drop</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1.5">
          <p>DnD uses our custom Pointer DnD library (zero <code className="text-xs bg-muted px-1 rounded">@dnd-kit</code> dependency).</p>
          <p>Sibling cards animate to <em>open a real-sized gap</em> at the insertion point — exactly matching the dragged card's dimensions.</p>
          <p>Toggle <strong>Reduce motion</strong> in Features (or set the OS-level <code className="text-xs bg-muted px-1 rounded">prefers-reduced-motion</code>) to disable the animation.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> WIP limits</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Set per-column WIP limits in the Columns section. When exceeded, the column shows a red border and warning icon — useful for enforcing flow in lean teams.
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Code2 className="h-4 w-4" /> Multi-file export</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1.5">
          <p>The Export tab emits one <strong>per-board</strong> folder (<code className="text-xs bg-muted px-1 rounded">component / config / data / useCardChange / types</code>) plus the <strong>shared engine</strong> files (KanbanBoard, KanbanCard, dialog template engine, full DnD lib). Copy the engine once; generate as many boards as you want.</p>
          <p>Mirrors the same multi-file shape as the Table Builder export.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Custom card dialog</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1.5">
          <p>Configure the click-dialog from the <strong>Card click dialog</strong> section in the sidebar.</p>
          <p>Provide your own <strong>HTML / Tailwind template</strong> with <code className="text-xs bg-muted px-1 rounded">{`{{row.field}}`}</code> tokens, plus optional sandboxed JS that runs after mount. Same engine as the Table Builder's row-detail dialog.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Webhook className="h-4 w-4" /> Persist via onCardChange</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1.5">
          <p>Provide a sandboxed snippet in <strong>On card change (DnD)</strong> to call your backend after every drop. The snippet receives <code className="text-xs bg-muted px-1 rounded">row</code> = the full change event. The exported <code className="text-xs bg-muted px-1 rounded">useCardChange</code> hook gives you a typed surface for production.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Languages className="h-4 w-4" /> RTL support</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1.5">
          <p>Set <strong>Direction → RTL</strong> in Layout. The board flips visual order, scroll behavior, and the DnD index resolver uses <em>right-to-left midpoints</em> so insertion points stay correct.</p>
          <p>Try the <strong>Sprint Timeline (RTL)</strong> template for a verified end-to-end example.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Reduce motion</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1.5">
          <p>Toggle <strong>Reduce motion</strong> in Features to disable the smooth sibling translation. The library also auto-disables animations when the OS reports <code className="text-xs bg-muted px-1 rounded">prefers-reduced-motion: reduce</code>.</p>
        </CardContent>
      </Card>
    </div>
  );
}