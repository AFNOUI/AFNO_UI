"use client";

import { cn } from "@/lib/utils";

export type EngineBehaviorItem =
  | { label: string }
  | { label: string; value: string };

interface CarouselEngineBehaviorProps {
  items: EngineBehaviorItem[];
  className?: string;
}

function renderItem(item: EngineBehaviorItem) {
  if ("value" in item) {
    return (
      <>
        <span className="text-sm text-muted-foreground">{item.label}</span>
        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
          {item.value}
        </span>
      </>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
      {item.label}
    </span>
  );
}

export function CarouselEngineBehavior({ items, className }: CarouselEngineBehaviorProps) {
  const middleItems = items.slice(0, -1);
  const lastItem = items[items.length - 1];

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-border",
        className,
      )}
    >
      <span className="text-sm font-medium text-muted-foreground shrink-0">
        Engine Behavior
      </span>
      {middleItems.length > 0 && (
        <span className="flex items-center gap-2">
          {middleItems.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              {renderItem(item)}
            </span>
          ))}
        </span>
      )}
      {lastItem && (
        <span className="flex items-center gap-2 shrink-0">
          {renderItem(lastItem)}
        </span>
      )}
    </div>
  );
}
