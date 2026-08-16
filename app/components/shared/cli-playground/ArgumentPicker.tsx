"use client";

/**
 * Step 2 — the positional arguments.
 *
 * This is the part of the playground that justifies its existence: there are
 * 358 variant slugs across 39 categories, nobody memorises them, and typing one
 * wrong produces a 404 from the registry rather than a helpful error. Every
 * option offered here comes straight from the registry index, so a slug that
 * cannot be installed can never be selected.
 */

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
    BASE_ENTRIES,
    CATALOG_COUNTS,
    VARIANTS_BY_CATEGORY,
    getCategory,
    type CatalogEntry,
} from "./catalog";
import { RichText } from "./RichText";
import type { CliArgSpec } from "./types";

/**
 * Rendered at once before the list asks you to narrow the search. Higher than
 * it looks because results are laid out in columns, not one per row — a wide,
 * short panel fits on screen where a narrow, tall one gets clipped.
 */
const RESULT_LIMIT = 60;

/** Category chips shown before the "+N more" toggle, in this order. */
const PRIMARY_BUCKETS = [
    "base",
    "forms",
    "tables",
    "kanban",
    "tree",
    "charts",
    "dnd",
    "progress",
];

interface ArgumentPickerProps {
    spec: CliArgSpec;
    value: string[];
    onChange: (next: string[]) => void;
    idPrefix: string;
}

interface Bucket {
    id: string;
    label: string;
    entries: CatalogEntry[];
}

function bucketsFor(spec: CliArgSpec): Bucket[] {
    const buckets: Bucket[] = [];

    if (spec.kind === "components" || spec.kind === "base-components") {
        buckets.push({ id: "base", label: "Base components", entries: BASE_ENTRIES });
    }

    if (spec.kind === "components" || spec.kind === "variant") {
        for (const [categoryId, entries] of VARIANTS_BY_CATEGORY) {
            if (spec.categoryFilter && !spec.categoryFilter(categoryId)) continue;
            buckets.push({ id: categoryId, label: getCategory(categoryId).label, entries });
        }
    }

    return buckets;
}

export function ArgumentPicker({ spec, value, onChange, idPrefix }: ArgumentPickerProps) {
    const [query, setQuery] = useState("");
    const [activeBucket, setActiveBucket] = useState<string | null>(null);
    const [showAllBuckets, setShowAllBuckets] = useState(false);

    const buckets = useMemo(() => bucketsFor(spec), [spec]);
    const multiple = spec.kind === "components" || spec.kind === "base-components";

    // 40 category chips is a wall. Show the families people actually come for,
    // and keep the rest one click away — search reaches them either way.
    const primaryBuckets = useMemo(
        () => buckets.filter((bucket) => PRIMARY_BUCKETS.includes(bucket.id)),
        [buckets],
    );
    const overflowBuckets = useMemo(
        () => buckets.filter((bucket) => !PRIMARY_BUCKETS.includes(bucket.id)),
        [buckets],
    );
    const visibleBuckets = showAllBuckets ? [...primaryBuckets, ...overflowBuckets] : primaryBuckets;

    const matches = useMemo(() => {
        const needle = query.trim().toLowerCase();
        const pool = activeBucket
            ? buckets.filter((bucket) => bucket.id === activeBucket)
            : buckets;
        const flat = pool.flatMap((bucket) => bucket.entries);
        if (!needle) return flat;
        return flat.filter((entry) => entry.slug.toLowerCase().includes(needle));
    }, [buckets, query, activeBucket]);

    if (spec.kind === "none") return null;

    if (spec.kind === "scope") {
        return (
            <fieldset className="space-y-3">
                <legend className="text-sm font-semibold">{spec.label}</legend>
                <RadioGroup
                    value={value[0] ?? ""}
                    onValueChange={(next) => onChange(next ? [next] : [""])}
                    className="grid gap-2 sm:grid-cols-2"
                >
                    {spec.choices?.map((choice) => (
                        <Label
                            key={choice.value || "default"}
                            htmlFor={`${idPrefix}-scope-${choice.value || "default"}`}
                            className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/30 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
                        >
                            <RadioGroupItem
                                id={`${idPrefix}-scope-${choice.value || "default"}`}
                                value={choice.value}
                                className="mt-0.5"
                            />
                            <span className="min-w-0">
                                <span className="block text-sm font-medium">{choice.label}</span>
                                <RichText
                                    text={choice.note}
                                    className="mt-0.5 block text-xs leading-relaxed text-muted-foreground"
                                />
                            </span>
                        </Label>
                    ))}
                </RadioGroup>
            </fieldset>
        );
    }

    const toggle = (slug: string) => {
        if (!multiple) {
            onChange(value[0] === slug ? [] : [slug]);
            return;
        }
        onChange(value.includes(slug) ? value.filter((item) => item !== slug) : [...value, slug]);
    };

    const shown = matches.slice(0, RESULT_LIMIT);
    const hidden = matches.length - shown.length;

    return (
        <div className="space-y-3">
            <div>
                <p className="text-sm font-semibold">{spec.label}</p>
                <RichText
                    as="p"
                    text={spec.help}
                    className="mt-0.5 text-xs leading-relaxed text-muted-foreground"
                />
            </div>

            {value.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {value.filter(Boolean).map((slug) => (
                        <Badge key={slug} variant="secondary" className="gap-1 font-mono text-[11px]">
                            {slug}
                            <button
                                type="button"
                                onClick={() => toggle(slug)}
                                aria-label={`Remove ${slug}`}
                                className="rounded-sm opacity-60 transition-opacity hover:opacity-100"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            <div className="relative">
                <Search className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={`Search ${CATALOG_COUNTS.variants} variants and every primitive…`}
                    className="ps-9"
                    aria-label={spec.label}
                />
            </div>

            <div className="flex flex-wrap gap-1.5">
                <FilterChip
                    label="All"
                    active={activeBucket === null}
                    onClick={() => setActiveBucket(null)}
                />
                {visibleBuckets.map((bucket) => (
                    <FilterChip
                        key={bucket.id}
                        label={`${bucket.label} (${bucket.entries.length})`}
                        active={activeBucket === bucket.id}
                        onClick={() => setActiveBucket(activeBucket === bucket.id ? null : bucket.id)}
                    />
                ))}
                {overflowBuckets.length > 0 && (
                    <FilterChip
                        label={showAllBuckets ? "Fewer" : `+${overflowBuckets.length} more`}
                        active={false}
                        onClick={() => setShowAllBuckets((current) => !current)}
                    />
                )}
            </div>

            <div className="max-h-64 overflow-y-auto rounded-lg border border-border p-1.5">
                {shown.length === 0 ? (
                    <p className="p-3 text-xs text-muted-foreground">
                        Nothing matches “{query}”. Try a category name like{" "}
                        <code dir="ltr">tables</code> or <code dir="ltr">charts</code>.
                    </p>
                ) : (
                    <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                        {shown.map((entry) => {
                            const isSelected = value.includes(entry.slug);
                            return (
                                <li key={entry.slug}>
                                    <button
                                        type="button"
                                        onClick={() => toggle(entry.slug)}
                                        aria-pressed={isSelected}
                                        title={entry.slug}
                                        className={cn(
                                            "w-full rounded-md px-2 py-1.5 text-start transition-colors",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                                            isSelected
                                                ? "bg-primary/10 text-primary"
                                                : "hover:bg-muted/50",
                                        )}
                                    >
                                        <code
                                            dir="ltr"
                                            className={cn(
                                                "block truncate font-mono text-xs",
                                                isSelected && "font-semibold",
                                            )}
                                        >
                                            {entry.slug}
                                        </code>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {hidden > 0 && (
                <p className="text-xs text-muted-foreground">
                    Showing {shown.length} of {matches.length}. {hidden} more match — narrow the search
                    or pick a category to see them.
                </p>
            )}

            {spec.filterNote && (
                <RichText
                    as="p"
                    text={spec.filterNote}
                    className="text-xs leading-relaxed text-muted-foreground"
                />
            )}
            {spec.emptyMeans && value.length === 0 && (
                <RichText
                    as="p"
                    text={spec.emptyMeans}
                    className="rounded-lg border border-dashed border-border p-3 text-xs leading-relaxed text-muted-foreground"
                />
            )}
        </div>
    );
}

function FilterChip({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
            )}
        >
            {label}
        </button>
    );
}
