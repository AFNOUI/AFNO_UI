import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type { CategoryRenderer } from "./types";

/**
 * Renders marketing-oriented sections (testimonials, pricing cards, feature
 * grids, stat counters, FAQs, newsletter form, footer). Behaviour is
 * byte-identical to the original `RenderNode.tsx` switch branches — in
 * particular the intentional lack of applied `classes` on most outer
 * wrappers matches the pre-refactor markup.
 */
export const renderMarketingNode: CategoryRenderer = (node, classes) => {
  const p = node.props;

  switch (node.type) {
    case "testimonial":
      return (
        <div>
          <blockquote className="text-lg italic text-foreground mb-4">
            &ldquo;{p.quote as string}&rdquo;
          </blockquote>
          <div className="font-medium text-foreground">{p.author as string}</div>
          <div className="text-sm text-muted-foreground">{p.role as string}</div>
        </div>
      );
    case "pricing": {
      const features = ((p.features as string) || "").split("\n").filter(Boolean);
      return (
        <div
          className={cn(
            (p.highlighted as boolean) && "border-primary ring-2 ring-primary/20",
          )}
        >
          <div className="text-lg font-semibold mb-1">{p.title as string}</div>
          <div className="text-3xl font-bold mb-1">
            {p.price as string}
            <span className="text-sm font-normal text-muted-foreground">
              {p.period as string}
            </span>
          </div>
          <ul className="space-y-2 my-4 text-sm text-muted-foreground">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                ✓ {f}
              </li>
            ))}
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
        <div className={classes}>
          {(p.title as string) && (
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              {p.title as string}
            </h2>
          )}
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
          <p className="text-sm text-muted-foreground mb-4">
            {p.description as string}
          </p>
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
                <a
                  key={i}
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
          <Separator className="mb-4" />
          <p className="text-xs text-muted-foreground">{p.copyright as string}</p>
        </div>
      );
    }
    default:
      return null;
  }
};
