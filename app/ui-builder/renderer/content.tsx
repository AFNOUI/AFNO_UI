import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { CategoryRenderer } from "./types";

/**
 * Renders generic content primitives (headings, text, buttons, badges, media,
 * tabs, accordions, …). Extracted verbatim from the original monolithic
 * switch in `RenderNode.tsx` — output is byte-identical.
 */
export const renderContentNode: CategoryRenderer = (node, classes) => {
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
      // Builder canvas preview — raw <img> matches generated code paths.
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={p.src as string} alt={p.alt as string} className={classes} />;
    case "button":
      return (
        <Button
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          variant={(p.variant as any) || "default"}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          size={(p.size as any) || "default"}
          className={classes}
        >
          {p.text as string}
        </Button>
      );
    case "divider":
      return <Separator className={classes} />;
    case "spacer":
      return <div style={{ height: `${p.height || 40}px` }} className={classes} />;
    case "badge":
      return (
        <Badge
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          variant={(p.variant as any) || "default"}
          className={classes}
        >
          {p.text as string}
        </Badge>
      );
    case "link":
      return (
        <a
          href={p.href as string}
          className={cn("underline-offset-4 hover:underline", classes)}
        >
          {p.text as string}
        </a>
      );
    case "list": {
      const items = ((p.items as string) || "").split("\n").filter(Boolean);
      const Tag = p.ordered ? "ol" : "ul";
      return (
        <Tag className={cn(p.ordered ? "list-decimal" : "list-disc", classes)}>
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </Tag>
      );
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
        <Alert
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          variant={(p.variant as any) || "default"}
          className={classes}
        >
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
          <iframe
            src={p.src as string}
            className="w-full h-full"
            allowFullScreen
            style={{ border: 0 }}
          />
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
              <TabsTrigger key={i} value={String(i)}>
                {label}
              </TabsTrigger>
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
    default:
      return null;
  }
};
