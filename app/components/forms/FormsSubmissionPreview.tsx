"use client";

import { CheckCircle2, Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

import { ScrollArea } from "@/components/ui/scroll-area";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatValue(value: unknown): { kind: "text" | "json"; content: string } {
  if (value instanceof File) {
    return {
      kind: "text",
      content: `${value.name} · ${formatBytes(value.size)}${value.type ? ` · ${value.type}` : ""}`,
    };
  }
  if (value === null || value === undefined) {
    return { kind: "text", content: "—" };
  }
  if (typeof value === "boolean") {
    return { kind: "text", content: value ? "Yes" : "No" };
  }
  if (typeof value === "object") {
    return { kind: "json", content: JSON.stringify(value, null, 2) };
  }
  return { kind: "text", content: String(value) };
}

function humanizeKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/_/g, " ")
    .trim();
}

type FormsSubmissionPreviewProps = {
  data: Record<string, unknown> | null;
  submittedAt: Date | null;
  className?: string;
};

export function FormsSubmissionPreview({ data, submittedAt, className }: FormsSubmissionPreviewProps) {
  const entries = data ? Object.entries(data) : [];

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/40 shadow-sm overflow-hidden",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">Submitted data</h3>
          {submittedAt ? (
            <p className="text-xs text-muted-foreground">
              {submittedAt.toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Waiting for a submit…</p>
          )}
        </div>
      </div>

      {!data || entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/80 text-muted-foreground">
            <Inbox className="h-6 w-6 opacity-70" />
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Submit the form above to see the validated payload rendered here.
          </p>
        </div>
      ) : (
        <ScrollArea className="max-h-[min(420px,50vh)]">
          <dl className="grid gap-0 divide-y divide-border/60 p-1">
            {entries.map(([key, raw]) => {
              const { kind, content } = formatValue(raw);
              return (
                <div
                  key={key}
                  className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,0.35fr)_minmax(0,1fr)] sm:items-start sm:gap-4"
                >
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:pt-0.5">
                    {humanizeKey(key)}
                  </dt>
                  <dd className="min-w-0 text-sm text-foreground">
                    {kind === "json" ? (
                      <pre className="overflow-x-auto rounded-lg bg-muted/50 p-3 text-xs font-mono leading-relaxed text-foreground/90 ring-1 ring-border/50">
                        {content}
                      </pre>
                    ) : (
                      <span className="font-mono text-[13px] leading-relaxed break-words">{content}</span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </ScrollArea>
      )}
    </div>
  );
}
