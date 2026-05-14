import { useMemo } from "react";
import { GripVertical, Trash2, Copy, TrendingUp, TrendingDown, Minus as MinusIcon, Activity, Upload } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDraggable, useDropZone } from "@/components/ui/dnd";
import { BuilderNode, componentRegistry, BreakpointStyles, Breakpoint, getCardVariantClass } from "@/ui-builder/data/uiBuilderRegistry";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

import { BarChart, LineChart, PieChart, AreaChart } from "@/components/ui/charts";

// ─── Style resolver ───
function resolveClasses(styles: BreakpointStyles, breakpoint: Breakpoint): string {
  const base = Object.values(styles.base || {}).filter(Boolean).join(" ");
  if (breakpoint === "base") return base;
  const bpStyles = styles[breakpoint];
  if (!bpStyles) return base;
  const bpClasses = Object.values(bpStyles).filter(Boolean).join(" ");
  return `${base} ${bpClasses}`;
}

// ─── Component Renderers ───
function RenderComponent({ node, breakpoint }: { node: BuilderNode; breakpoint: Breakpoint }) {
  const classes = resolveClasses(node.styles, breakpoint);
  const p = node.props;

  switch (node.type) {
    case "heading": {
      const level = (p.level as string) || "h2";
      const HeadingEl = level as keyof React.JSX.IntrinsicElements;
      return <HeadingEl className={classes}>{p.text as string}</HeadingEl>;
    }
    case "text":
      return <p className={classes}>{p.text as string}</p>;
    case "image":
      return <img src={p.src as string} alt={p.alt as string} className={classes} />;
    case "button":
      return <Button variant={(p.variant as any) || "default"} size={(p.size as any) || "default"} className={classes}>{p.text as string}</Button>;
    case "divider":
      return <Separator className={classes} />;
    case "spacer":
      return <div style={{ height: `${p.height || 40}px` }} className={classes} />;
    case "badge":
      return <Badge variant={(p.variant as any) || "default"} className={classes}>{p.text as string}</Badge>;
    case "link":
      return <a href={p.href as string} className={cn("underline-offset-4 hover:underline", classes)}>{p.text as string}</a>;
    case "list": {
      const items = ((p.items as string) || "").split("\n").filter(Boolean);
      const Tag = p.ordered ? "ol" : "ul";
      return <Tag className={cn(p.ordered ? "list-decimal" : "list-disc", classes)}>{items.map((item, i) => <li key={i}>{item}</li>)}</Tag>;
    }
    case "avatar":
      return (
        <Avatar className={classes}>
          <AvatarImage src={p.src as string} alt={p.fallback as string} />
          <AvatarFallback>{p.fallback as string}</AvatarFallback>
        </Avatar>
      );
    case "alert":
      return (
        <Alert variant={(p.variant as any) || "default"} className={classes}>
          <AlertTitle>{p.title as string}</AlertTitle>
          <AlertDescription>{p.description as string}</AlertDescription>
        </Alert>
      );
    case "code-block":
      return (
        <pre className={cn("bg-muted rounded-lg p-4 overflow-auto text-sm font-mono", classes)}>
          <code>{p.code as string}</code>
        </pre>
      );
    case "progress":
      return (
        <div className={cn("space-y-2", classes)}>
          {(p.label as string) && <Label className="text-sm">{p.label as string}</Label>}
          <Progress value={p.value as number} />
        </div>
      );
    case "video": {
      const ratio = (p.aspectRatio as string) || "16/9";
      const [w, h] = ratio.split("/").map(Number);
      return (
        <div className={classes} style={{ aspectRatio: `${w}/${h}` }}>
          <iframe src={p.src as string} className="w-full h-full" allowFullScreen style={{ border: 0 }} />
        </div>
      );
    }
    case "tabs-container": {
      const tabLabels = ((p.tabs as string) || "Tab 1\nTab 2").split("\n").filter(Boolean);
      const active = Number(p.activeTab) || 0;
      return (
        <Tabs defaultValue={String(active)} className={classes}>
          <TabsList>
            {tabLabels.map((label, i) => (
              <TabsTrigger key={i} value={String(i)}>{label}</TabsTrigger>
            ))}
          </TabsList>
          {tabLabels.map((label, i) => (
            <TabsContent key={i} value={String(i)}>
              <div className="p-4 text-sm text-muted-foreground">Content for {label}</div>
            </TabsContent>
          ))}
        </Tabs>
      );
    }
    case "accordion-container": {
      const lines = ((p.items as string) || "").split("\n").filter(Boolean);
      const pairs: { q: string; a: string }[] = [];
      for (let i = 0; i < lines.length; i += 2) {
        pairs.push({ q: lines[i], a: lines[i + 1] || "" });
      }
      return (
        <Accordion type="single" collapsible className={classes}>
          {pairs.map((pair, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{pair.q}</AccordionTrigger>
              <AccordionContent>{pair.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      );
    }
    case "testimonial":
      return (
        <div>
          <blockquote className="text-lg italic text-foreground mb-4">"{p.quote as string}"</blockquote>
          <div className="font-medium text-foreground">{p.author as string}</div>
          <div className="text-sm text-muted-foreground">{p.role as string}</div>
        </div>
      );
    case "pricing": {
      const features = ((p.features as string) || "").split("\n").filter(Boolean);
      return (
        <div className={cn((p.highlighted as boolean) && "border-primary ring-2 ring-primary/20")}>
          <div className="text-lg font-semibold mb-1">{p.title as string}</div>
          <div className="text-3xl font-bold mb-1">{p.price as string}<span className="text-sm font-normal text-muted-foreground">{p.period as string}</span></div>
          <ul className="space-y-2 my-4 text-sm text-muted-foreground">
            {features.map((f, i) => <li key={i} className="flex items-center gap-2">✓ {f}</li>)}
          </ul>
          <Button className="w-full">{p.cta as string}</Button>
        </div>
      );
    }
    case "feature-grid": {
      const lines = ((p.features as string) || "").split("\n").filter(Boolean);
      const items: { title: string; desc: string }[] = [];
      for (let i = 0; i < lines.length; i += 2) {
        items.push({ title: lines[i], desc: lines[i + 1] || "" });
      }
      return (
        <div className="grid grid-cols-2 gap-4">
          {items.map((item, i) => (
            <div key={i} className="p-4 rounded-lg border bg-card">
              <div className="font-semibold text-foreground mb-1">{item.title}</div>
              <div className="text-sm text-muted-foreground">{item.desc}</div>
            </div>
          ))}
        </div>
      );
    }
    case "stats-counter": {
      const lines = ((p.stats as string) || "").split("\n").filter(Boolean);
      const items: { value: string; label: string }[] = [];
      for (let i = 0; i < lines.length; i += 2) {
        items.push({ value: lines[i], label: lines[i + 1] || "" });
      }
      return (
        <div className="grid grid-cols-4 gap-6 text-center">
          {items.map((item, i) => (
            <div key={i}>
              <div className="text-3xl font-bold text-foreground">{item.value}</div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      );
    }
    case "faq": {
      const lines = ((p.items as string) || "").split("\n").filter(Boolean);
      const pairs: { q: string; a: string }[] = [];
      for (let i = 0; i < lines.length; i += 2) {
        pairs.push({ q: lines[i], a: lines[i + 1] || "" });
      }
      return (
        <div>
          {(p.title as string) && <h2 className="text-2xl font-bold text-foreground mb-6 text-center">{p.title as string}</h2>}
          <Accordion type="single" collapsible>
            {pairs.map((pair, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger>{pair.q}</AccordionTrigger>
                <AccordionContent>{pair.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      );
    }
    case "newsletter":
      return (
        <div>
          <h3 className="text-xl font-bold mb-2">{p.title as string}</h3>
          <p className="text-sm text-muted-foreground mb-4">{p.description as string}</p>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input placeholder="Enter your email" className="flex-1" />
            <Button>{p.buttonText as string}</Button>
          </div>
        </div>
      );
    case "footer": {
      const links = ((p.links as string) || "").split("\n").filter(Boolean);
      return (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <span className="text-lg font-bold">{p.brand as string}</span>
            <div className="flex flex-wrap gap-4">
              {links.map((link, i) => (
                <a key={i} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link}</a>
              ))}
            </div>
          </div>
          <Separator className="mb-4" />
          <p className="text-xs text-muted-foreground">{p.copyright as string}</p>
        </div>
      );
    }
    case "input":
      return (
        <div className={cn("space-y-2", classes)}>
          <Label>{p.label as string}</Label>
          <Input type={(p.inputType as string) || "text"} placeholder={p.placeholder as string} />
        </div>
      );
    case "textarea":
      return (
        <div className={cn("space-y-2", classes)}>
          <Label>{p.label as string}</Label>
          <Textarea placeholder={p.placeholder as string} rows={(p.rows as number) || 4} />
        </div>
      );
    case "select": {
      const opts = ((p.options as string) || "").split("\n").filter(Boolean);
      return (
        <div className={cn("space-y-2", classes)}>
          <Label>{p.label as string}</Label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {opts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      );
    }
    case "checkbox":
      return (
        <div className={cn("flex items-center gap-2", classes)}>
          <Checkbox />
          <Label>{p.label as string}</Label>
        </div>
      );
    case "switch":
      return (
        <div className={cn("flex items-center gap-3", classes)}>
          <Switch defaultChecked={!!p.defaultChecked} />
          <Label>{p.label as string}</Label>
        </div>
      );
    case "radio-group": {
      const opts = ((p.options as string) || "").split("\n").filter(Boolean);
      return (
        <div className={cn("space-y-2", classes)}>
          <Label>{p.label as string}</Label>
          <RadioGroup>
            {opts.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <RadioGroupItem value={opt} id={`radio-${node.id}-${i}`} />
                <Label htmlFor={`radio-${node.id}-${i}`} className="font-normal">{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );
    }
    case "date-picker":
      return (
        <div className={cn("space-y-2", classes)}>
          <Label>{p.label as string}</Label>
          <Input type="date" />
        </div>
      );
    case "file-upload":
      return (
        <div className={cn("space-y-2", classes)}>
          <Label>{p.label as string}</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{p.description as string}</p>
          </div>
        </div>
      );
    case "stat-card": {
      const changeType = p.changeType as string;
      return (
        <div>
          <div className="text-sm text-muted-foreground mb-1">{p.title as string}</div>
          <div className="text-2xl font-bold text-foreground">{p.value as string}</div>
          <div className={cn("text-xs mt-1 flex items-center gap-1", changeType === "positive" ? "text-emerald-500" : changeType === "negative" ? "text-red-500" : "text-muted-foreground")}>
            {changeType === "positive" ? <TrendingUp className="h-3 w-3" /> : changeType === "negative" ? <TrendingDown className="h-3 w-3" /> : <MinusIcon className="h-3 w-3" />}
            {p.change as string}
          </div>
        </div>
      );
    }
    case "data-table": {
      const headers = ((p.headers as string) || "").split("\n").filter(Boolean);
      const cells = ((p.rows as string) || "").split("\n").filter(Boolean);
      const colCount = headers.length || 1;
      const rows: string[][] = [];
      for (let i = 0; i < cells.length; i += colCount) {
        rows.push(cells.slice(i, i + colCount));
      }
      return (
        <div className={classes}>
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((h, i) => <TableHead key={i}>{h}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, ri) => (
                <TableRow key={ri}>
                  {row.map((cell, ci) => <TableCell key={ci}>{cell}</TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }
    case "metric-widget": {
      const trend = p.trend as string;
      return (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{p.label as string}</div>
            <div className="text-lg font-bold text-foreground">{p.value as string}</div>
          </div>
          <div className="ms-auto">
            {trend === "up" ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : trend === "down" ? <TrendingDown className="h-4 w-4 text-red-500" /> : <MinusIcon className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>
      );
    }
    case "bar-chart":
      return <BarChart data={p.data as string} variant={p.variant as any} title={p.title as string} className={classes} />;
    case "line-chart":
      return <LineChart data={p.data as string} variant={p.variant as any} title={p.title as string} className={classes} />;
    case "pie-chart":
      return <PieChart data={p.data as string} variant={p.variant as any} title={p.title as string} className={classes} />;
    case "area-chart":
      return <AreaChart data={p.data as string} variant={p.variant as any} title={p.title as string} className={classes} />;
    default:
      return null;
  }
}

// ─── Sortable wrapper ───
interface SortableNodeProps {
  node: BuilderNode;
  breakpoint: Breakpoint;
  selectedId: string | null;
  interactivePreview?: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function SortableNode({ node, breakpoint, selectedId, interactivePreview = false, onSelect, onDelete, onDuplicate }: SortableNodeProps) {
  const entry = componentRegistry.find(c => c.type === node.type);
  const isContainer = entry?.isContainer ?? false;
  const isComposite = entry?.isComposite ?? false;
  const isSelected = selectedId === node.id;

  const dragData = useMemo(
    () => ({ type: node.type, source: "canvas", nodeId: node.id }),
    [node.id, node.type],
  );
  const { dragProps, isDragging } = useDraggable({
    id: node.id,
    data: dragData,
    disabled: node.locked,
    preview: () => (
      <div className="rounded-md border border-primary bg-card px-3 py-1.5 text-xs shadow-lg">
        {node.layerName || entry?.label || node.type}
      </div>
    ),
  });
  const style: React.CSSProperties = {
    opacity: isDragging ? 0.4 : 1,
  };

  if (node.hidden) {
    return null;
  }

  return (
    <div
      style={style}
      className={cn(
        "relative group rounded-lg transition-all",
        !interactivePreview && (isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:ring-1 hover:ring-primary/40"),
        node.locked && "opacity-70",
      )}
      onClick={(e) => {
        if (interactivePreview) return;
        e.stopPropagation();
        onSelect(node.id);
      }}
    >
      {/* Toolbar */}
      {!interactivePreview && <div className={cn(
        "absolute -top-3 start-2 z-10 flex items-center gap-0.5 bg-primary text-primary-foreground rounded-md px-1.5 py-0.5 text-[10px] font-medium shadow-lg transition-opacity",
        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
        {!node.locked && (
          <button {...dragProps} className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-primary-foreground/20 rounded">
            <GripVertical className="h-3 w-3" />
          </button>
        )}
        <span className="px-1">{node.layerName || entry?.label || node.type}</span>
        <button onClick={(e) => { e.stopPropagation(); onDuplicate(node.id); }} className="p-0.5 hover:bg-primary-foreground/20 rounded">
          <Copy className="h-3 w-3" />
        </button>
        {!node.locked && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(node.id); }} className="p-0.5 hover:bg-destructive/80 rounded">
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>}

      {/* Content */}
      {isComposite ? (
        <CompositeDropZone node={node} breakpoint={breakpoint} selectedId={selectedId} interactivePreview={interactivePreview} onSelect={onSelect} onDelete={onDelete} onDuplicate={onDuplicate} />
      ) : isContainer ? (
        <ContainerDropZone node={node} breakpoint={breakpoint} selectedId={selectedId} interactivePreview={interactivePreview} onSelect={onSelect} onDelete={onDelete} onDuplicate={onDuplicate} />
      ) : (
        <div className={cn(!interactivePreview && "pointer-events-none")}>
          <RenderComponent node={node} breakpoint={breakpoint} />
        </div>
      )}
    </div>
  );
}

// ─── Composite: renders default visual from props + droppable children zone ───
function CompositeDropZone({ node, breakpoint, selectedId, interactivePreview = false, onSelect, onDelete, onDuplicate }: SortableNodeProps) {
  const zoneData = useMemo(() => ({ type: "container" as const, containerId: node.id }), [node.id]);
  const { zoneProps, isOver } = useDropZone({
    id: `droppable-${node.id}`,
    data: zoneData,
    axis: "y",
    onDrop: () => { /* central handler in PageBuilder */ },
  });

  const classes = resolveClasses(node.styles, breakpoint);

  return (
    <div
      {...(zoneProps as React.HTMLAttributes<HTMLDivElement> & { ref: React.Ref<HTMLDivElement> })}
      className={cn(classes, "min-h-[60px] relative", isOver && "ring-2 ring-dashed ring-primary/50 bg-primary/5")}
    >
      {/* Default visual from props – always shown */}
      <div className={cn(!interactivePreview && "pointer-events-none")}>
        <RenderComponent node={node} breakpoint={breakpoint} />
      </div>

      {/* Droppable children zone */}
        {node.children.length > 0 && (
          <div className="mt-3 space-y-2">
            {node.children.map(child => (
              <SortableNode
                key={child.id}
                node={child}
                breakpoint={breakpoint}
                selectedId={selectedId}
                interactivePreview={interactivePreview}
                onSelect={onSelect}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
              />
            ))}
          </div>
        )}
        {!interactivePreview && (
          <div className={cn(
            "flex items-center justify-center h-8 text-[10px] text-muted-foreground/60 border border-dashed border-border/50 rounded-md mt-2 transition-colors",
            isOver && "border-primary/50 bg-primary/5 text-primary"
          )}>
            + Drop to add
          </div>
        )}
    </div>
  );
}

// ─── Container with drop zone ───
function ContainerDropZone({ node, breakpoint, selectedId, interactivePreview = false, onSelect, onDelete, onDuplicate }: SortableNodeProps) {
  const zoneData = useMemo(() => ({ type: "container" as const, containerId: node.id }), [node.id]);
  const { zoneProps, isOver } = useDropZone({
    id: `droppable-${node.id}`,
    data: zoneData,
    axis: "y",
    onDrop: () => { /* central handler in PageBuilder */ },
  });

  const classes = resolveClasses(node.styles, breakpoint);
  const currentDisplay = node.styles[breakpoint]?.display || node.styles.base?.display;
  const stackChildren = currentDisplay !== "grid" && currentDisplay !== "flex" && node.type !== "grid" && node.type !== "columns";
  const containerClasses = cn(
    node.type === "card" && getCardVariantClass(node.props.variant as string),
    classes,
    "min-h-[60px] relative"
  );

  return (
    <div
      {...(zoneProps as React.HTMLAttributes<HTMLDivElement> & { ref: React.Ref<HTMLDivElement> })}
      className={cn(containerClasses, isOver && "ring-2 ring-dashed ring-primary/50 bg-primary/5")}
    >
        {node.children.length === 0 ? (
          <div className="flex items-center justify-center h-[60px] text-xs text-muted-foreground border border-dashed border-border rounded-lg">
            Drop components here
          </div>
        ) : (
          <div className={cn(stackChildren ? "space-y-3" : "contents", !stackChildren && "min-h-[inherit]")}>
            {node.children.map(child => (
              <SortableNode
                key={child.id}
                node={child}
                breakpoint={breakpoint}
                selectedId={selectedId}
                interactivePreview={interactivePreview}
                onSelect={onSelect}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
              />
            ))}
          </div>
        )}
    </div>
  );
}
