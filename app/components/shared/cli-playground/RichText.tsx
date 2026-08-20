"use client";

/**
 * Inline emphasis for the playground's explanatory copy.
 *
 * Every description in `commandSpecs.ts` is prose about code — flags, slugs,
 * file paths, package names. Rendering it as flat grey text buries exactly the
 * tokens the reader is scanning for, and writing it as JSX would make the specs
 * unreadable to edit. So the specs are written in a two-mark subset of markdown
 * and rendered here:
 *
 *   `code`     → monospace, tinted, `dir="ltr"` so paths survive RTL locales
 *   **strong** → emphasised in the foreground colour
 *
 * Deliberately not a markdown parser. Two marks, no nesting, no links — anything
 * more and the copy stops being scannable, which is the whole point.
 */

import { cn } from "@/lib/utils";

const TOKEN = /(`[^`]+`|\*\*[^*]+\*\*)/g;

interface RichTextProps {
    text: string;
    className?: string;
    as?: "span" | "p";
}

export function RichText({ text, className, as: Tag = "span" }: RichTextProps) {
    const parts = text.split(TOKEN).filter((part) => part !== "");

    return (
        <Tag className={className}>
            {parts.map((part, index) => {
                if (part.startsWith("`") && part.endsWith("`")) {
                    return (
                        <code
                            key={index}
                            dir="ltr"
                            className={cn(
                                "rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]",
                                "text-primary",
                            )}
                        >
                            {part.slice(1, -1)}
                        </code>
                    );
                }
                if (part.startsWith("**") && part.endsWith("**")) {
                    return (
                        <strong key={index} className="font-semibold text-foreground">
                            {part.slice(2, -2)}
                        </strong>
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </Tag>
    );
}
