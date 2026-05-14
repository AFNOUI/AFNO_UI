import { getCardVariantClass, getStatCardVariantClass } from "@/ui-builder/data/uiBuilderRegistry";
import type { BuilderNode } from "@/ui-builder/data/uiBuilderRegistry";
import type { ImportTracker } from "./imports";
import { esc } from "./esc";
import { resolveResponsiveClasses } from "./responsiveClasses";
import type { RenderFn } from "./rendererTypes";

/**
 * Layout, content, and marketing node renderers.
 *
 * Each function returns the emitted JSX string for a single node type at the
 * given indent. The shape is byte-identical to the original monolithic
 * `nodeToJSX` switch; refactors must keep this guarantee (it's locked in by
 * `tests/codegen/uiBuilderCodeGen.test.ts` snapshots).
 */

export function renderContainerLike(node: BuilderNode, imports: ImportTracker, indent: number, render: RenderFn): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    const children = node.children.map((c) => render(c, imports, indent + 2)).join("\n");
    return `${pad}<div${classAttr}>\n${children}\n${pad}</div>`;
}

export function renderCard(node: BuilderNode, imports: ImportTracker, indent: number, render: RenderFn): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const p = node.props;
    imports.shadcn.add("Card");
    imports.shadcn.add("CardContent");
    const children = node.children.map((c) => render(c, imports, indent + 4)).join("\n");
    const variantClass = getCardVariantClass(p.variant as string);
    const merged = [variantClass, classes].filter(Boolean).join(" ");
    return `${pad}<Card${merged ? ` className="${merged}"` : ""}>\n${pad}  <CardContent>\n${children}\n${pad}  </CardContent>\n${pad}</Card>`;
}

export function renderHeading(node: BuilderNode, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    const tag = (node.props.level as string) || "h2";
    return `${pad}<${tag}${classAttr}>${esc(node.props.text as string)}</${tag}>`;
}

export function renderText(node: BuilderNode, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    return `${pad}<p${classAttr}>${esc(node.props.text as string)}</p>`;
}

export function renderImage(node: BuilderNode, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    const p = node.props;
    return `${pad}<img src="${p.src}" alt="${p.alt}"${classAttr} />`;
}

export function renderButton(node: BuilderNode, imports: ImportTracker, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    const p = node.props;
    imports.shadcn.add("Button");
    const variant = p.variant !== "default" ? ` variant="${p.variant}"` : "";
    const size = p.size && p.size !== "default" ? ` size="${p.size}"` : "";
    return `${pad}<Button${variant}${size}${classAttr}>${esc(p.text as string)}</Button>`;
}

export function renderDivider(node: BuilderNode, imports: ImportTracker, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    imports.shadcn.add("Separator");
    return `${pad}<Separator${classAttr} />`;
}

export function renderSpacer(node: BuilderNode, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    return `${pad}<div${classAttr} style={{ height: "${node.props.height || 40}px" }} />`;
}

export function renderBadge(node: BuilderNode, imports: ImportTracker, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    const p = node.props;
    imports.shadcn.add("Badge");
    const variant = p.variant !== "default" ? ` variant="${p.variant}"` : "";
    return `${pad}<Badge${variant}${classAttr}>${esc(p.text as string)}</Badge>`;
}

export function renderLink(node: BuilderNode, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    const p = node.props;
    return `${pad}<a href="${p.href}"${classAttr}>${esc(p.text as string)}</a>`;
}

export function renderList(node: BuilderNode, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const p = node.props;
    const items = ((p.items as string) || "").split("\n").filter(Boolean);
    const tag = p.ordered ? "ol" : "ul";
    const listClass = p.ordered ? "list-decimal" : "list-disc";
    const fullClass = classes ? `${listClass} ${classes}` : listClass;
    return `${pad}<${tag} className="${fullClass}">\n${items.map((i) => `${pad}  <li>${esc(i)}</li>`).join("\n")}\n${pad}</${tag}>`;
}

export function renderAvatar(node: BuilderNode, imports: ImportTracker, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    const p = node.props;
    imports.shadcn.add("Avatar");
    imports.shadcn.add("AvatarImage");
    imports.shadcn.add("AvatarFallback");
    return `${pad}<Avatar${classAttr}>\n${pad}  <AvatarImage src="${p.src}" />\n${pad}  <AvatarFallback>${esc(p.fallback as string)}</AvatarFallback>\n${pad}</Avatar>`;
}

export function renderAlert(node: BuilderNode, imports: ImportTracker, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    const p = node.props;
    imports.shadcn.add("Alert");
    imports.shadcn.add("AlertTitle");
    imports.shadcn.add("AlertDescription");
    const variant = p.variant !== "default" ? ` variant="${p.variant}"` : "";
    return `${pad}<Alert${variant}${classAttr}>\n${pad}  <AlertTitle>${esc(p.title as string)}</AlertTitle>\n${pad}  <AlertDescription>${esc(p.description as string)}</AlertDescription>\n${pad}</Alert>`;
}

export function renderCodeBlock(node: BuilderNode, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const p = node.props;
    return `${pad}<pre className="bg-muted rounded-lg p-4 overflow-auto text-sm font-mono${classes ? ` ${classes}` : ""}">\n${pad}  <code>${esc(p.code as string)}</code>\n${pad}</pre>`;
}

export function renderProgress(node: BuilderNode, imports: ImportTracker, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const p = node.props;
    imports.shadcn.add("Progress");
    imports.shadcn.add("Label");
    return `${pad}<div className="space-y-2${classes ? ` ${classes}` : ""}">\n${pad}  <Label>${esc(p.label as string)}</Label>\n${pad}  <Progress value={${p.value}} />\n${pad}</div>`;
}

export function renderVideo(node: BuilderNode, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    const p = node.props;
    return `${pad}<div${classAttr} style={{ aspectRatio: "${p.aspectRatio || "16/9"}" }}>\n${pad}  <iframe src="${p.src}" className="w-full h-full" allowFullScreen style={{ border: 0 }} />\n${pad}</div>`;
}

export function renderTabsContainer(node: BuilderNode, imports: ImportTracker, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    const p = node.props;
    imports.shadcn.add("Tabs");
    imports.shadcn.add("TabsList");
    imports.shadcn.add("TabsTrigger");
    imports.shadcn.add("TabsContent");
    const tabs = ((p.tabs as string) || "").split("\n").filter(Boolean);
    return `${pad}<Tabs defaultValue="0"${classAttr}>\n${pad}  <TabsList>\n${tabs.map((t, i) => `${pad}    <TabsTrigger value="${i}">${esc(t)}</TabsTrigger>`).join("\n")}\n${pad}  </TabsList>\n${tabs.map((t, i) => `${pad}  <TabsContent value="${i}">Content for ${esc(t)}</TabsContent>`).join("\n")}\n${pad}</Tabs>`;
}

export function renderAccordionContainer(node: BuilderNode, imports: ImportTracker, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    const p = node.props;
    imports.shadcn.add("Accordion");
    imports.shadcn.add("AccordionItem");
    imports.shadcn.add("AccordionTrigger");
    imports.shadcn.add("AccordionContent");
    const lines = ((p.items as string) || "").split("\n").filter(Boolean);
    const pairs: string[] = [];
    for (let i = 0; i < lines.length; i += 2) {
        pairs.push(`${pad}  <AccordionItem value="item-${i / 2}">\n${pad}    <AccordionTrigger>${esc(lines[i])}</AccordionTrigger>\n${pad}    <AccordionContent>${esc(lines[i + 1] || "")}</AccordionContent>\n${pad}  </AccordionItem>`);
    }
    return `${pad}<Accordion type="single" collapsible${classAttr}>\n${pairs.join("\n")}\n${pad}</Accordion>`;
}

export function renderTestimonial(node: BuilderNode, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    const p = node.props;
    return `${pad}<div${classAttr}>\n${pad}  <blockquote className="text-lg italic text-foreground mb-4">"${esc(p.quote as string)}"</blockquote>\n${pad}  <div className="font-medium text-foreground">${esc(p.author as string)}</div>\n${pad}  <div className="text-sm text-muted-foreground">${esc(p.role as string)}</div>\n${pad}</div>`;
}

export function renderPricing(node: BuilderNode, imports: ImportTracker, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const p = node.props;
    imports.shadcn.add("Button");
    const features = ((p.features as string) || "").split("\n").filter(Boolean);
    const highlightClass = p.highlighted ? " border-primary ring-2 ring-primary/20" : "";
    return `${pad}<div${classes ? ` className="${classes}${highlightClass}"` : ""}>\n${pad}  <div className="text-lg font-semibold mb-1">${esc(p.title as string)}</div>\n${pad}  <div className="text-3xl font-bold mb-1">${esc(p.price as string)}<span className="text-sm font-normal text-muted-foreground">${esc(p.period as string)}</span></div>\n${pad}  <ul className="space-y-2 my-4 text-sm text-muted-foreground">\n${features.map((f) => `${pad}    <li className="flex items-center gap-2">✓ ${esc(f)}</li>`).join("\n")}\n${pad}  </ul>\n${pad}  <Button className="w-full">${esc(p.cta as string)}</Button>\n${pad}</div>`;
}

export function renderFeatureGrid(node: BuilderNode, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    const p = node.props;
    const lines = ((p.features as string) || "").split("\n").filter(Boolean);
    const items: string[] = [];
    for (let i = 0; i < lines.length; i += 2) {
        items.push(`${pad}  <div className="p-4 rounded-lg border bg-card">\n${pad}    <div className="font-semibold text-foreground mb-1">${esc(lines[i])}</div>\n${pad}    <div className="text-sm text-muted-foreground">${esc(lines[i + 1] || "")}</div>\n${pad}  </div>`);
    }
    return `${pad}<div${classAttr}>\n${items.join("\n")}\n${pad}</div>`;
}

export function renderStatsCounter(node: BuilderNode, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    const p = node.props;
    const lines = ((p.stats as string) || "").split("\n").filter(Boolean);
    const items: string[] = [];
    for (let i = 0; i < lines.length; i += 2) {
        items.push(`${pad}  <div>\n${pad}    <div className="text-3xl font-bold text-foreground">${esc(lines[i])}</div>\n${pad}    <div className="text-sm text-muted-foreground">${esc(lines[i + 1] || "")}</div>\n${pad}  </div>`);
    }
    return `${pad}<div${classAttr}>\n${items.join("\n")}\n${pad}</div>`;
}

export function renderFaq(node: BuilderNode, imports: ImportTracker, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    const p = node.props;
    imports.shadcn.add("Accordion");
    imports.shadcn.add("AccordionItem");
    imports.shadcn.add("AccordionTrigger");
    imports.shadcn.add("AccordionContent");
    const lines = ((p.items as string) || "").split("\n").filter(Boolean);
    const pairs: string[] = [];
    for (let i = 0; i < lines.length; i += 2) {
        pairs.push(`${pad}    <AccordionItem value="faq-${i / 2}">\n${pad}      <AccordionTrigger>${esc(lines[i])}</AccordionTrigger>\n${pad}      <AccordionContent>${esc(lines[i + 1] || "")}</AccordionContent>\n${pad}    </AccordionItem>`);
    }
    return `${pad}<div${classAttr}>\n${pad}  <h2 className="text-2xl font-bold text-foreground mb-6 text-center">${esc(p.title as string)}</h2>\n${pad}  <Accordion type="single" collapsible>\n${pairs.join("\n")}\n${pad}  </Accordion>\n${pad}</div>`;
}

export function renderNewsletter(node: BuilderNode, imports: ImportTracker, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    const p = node.props;
    imports.shadcn.add("Button");
    imports.shadcn.add("Input");
    return `${pad}<div${classAttr}>\n${pad}  <h3 className="text-xl font-bold mb-2">${esc(p.title as string)}</h3>\n${pad}  <p className="text-sm text-muted-foreground mb-4">${esc(p.description as string)}</p>\n${pad}  <div className="flex gap-2 max-w-md mx-auto">\n${pad}    <Input placeholder="Enter your email" className="flex-1" />\n${pad}    <Button>${esc(p.buttonText as string)}</Button>\n${pad}  </div>\n${pad}</div>`;
}

export function renderFooter(node: BuilderNode, imports: ImportTracker, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    const p = node.props;
    imports.shadcn.add("Separator");
    const links = ((p.links as string) || "").split("\n").filter(Boolean);
    return `${pad}<footer${classAttr}>\n${pad}  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">\n${pad}    <span className="text-lg font-bold">${esc(p.brand as string)}</span>\n${pad}    <div className="flex flex-wrap gap-4">\n${links.map((l) => `${pad}      <a href="#" className="text-sm text-muted-foreground hover:text-foreground">${esc(l)}</a>`).join("\n")}\n${pad}    </div>\n${pad}  </div>\n${pad}  <Separator className="mb-4" />\n${pad}  <p className="text-xs text-muted-foreground">${esc(p.copyright as string)}</p>\n${pad}</footer>`;
}

export function renderStatCard(node: BuilderNode, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const p = node.props;
    return `${pad}<div className="${[getStatCardVariantClass(p.variant as string), classes].filter(Boolean).join(" ")}">\n${pad}  <div className="text-sm text-muted-foreground mb-1">${esc(p.title as string)}</div>\n${pad}  <div className="text-2xl font-bold text-foreground">${esc(p.value as string)}</div>\n${pad}  <div className="text-xs mt-1">${esc(p.change as string)}</div>\n${pad}</div>`;
}

export function renderDataTable(node: BuilderNode, imports: ImportTracker, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    const p = node.props;
    imports.shadcn.add("Table");
    imports.shadcn.add("TableHeader");
    imports.shadcn.add("TableRow");
    imports.shadcn.add("TableHead");
    imports.shadcn.add("TableBody");
    imports.shadcn.add("TableCell");
    const headers = ((p.headers as string) || "").split("\n").filter(Boolean);
    const cells = ((p.rows as string) || "").split("\n").filter(Boolean);
    const colCount = headers.length || 1;
    const rows: string[][] = [];
    for (let i = 0; i < cells.length; i += colCount) rows.push(cells.slice(i, i + colCount));
    return `${pad}<div${classAttr}>\n${pad}  <Table>\n${pad}    <TableHeader>\n${pad}      <TableRow>\n${headers.map((h) => `${pad}        <TableHead>${esc(h)}</TableHead>`).join("\n")}\n${pad}      </TableRow>\n${pad}    </TableHeader>\n${pad}    <TableBody>\n${rows.map((row) => `${pad}      <TableRow>\n${row.map((cell) => `${pad}        <TableCell>${esc(cell)}</TableCell>`).join("\n")}\n${pad}      </TableRow>`).join("\n")}\n${pad}    </TableBody>\n${pad}  </Table>\n${pad}</div>`;
}

export function renderMetricWidget(node: BuilderNode, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    const p = node.props;
    return `${pad}<div${classAttr}>\n${pad}  <div className="text-xs text-muted-foreground">${esc(p.label as string)}</div>\n${pad}  <div className="text-lg font-bold text-foreground">${esc(p.value as string)}</div>\n${pad}</div>`;
}

export function renderFallback(node: BuilderNode, indent: number): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    return `${pad}<div${classAttr}>/* ${node.type} */</div>`;
}
