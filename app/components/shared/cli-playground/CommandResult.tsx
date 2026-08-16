"use client";

/**
 * The result — the half of the playground people actually read.
 *
 * What stays visible without a click: the command, the package-manager choice,
 * copy, a one-line summary of the damage ("writes 2 places · adds axios"), and
 * anything wrong. What hides behind the disclosure: the token legend and the
 * full effect list.
 *
 * That split is the whole compactness argument. Someone who clicked a preset
 * wants the command and nothing else; someone who is confused wants the
 * legend — and a command like `npx afnoui add tables/tables-server-crm --axios
 * --dry-run` is five decisions flattened into one line, so the legend has to
 * exist. Warnings are never behind the disclosure: a warning nobody opens is
 * not a warning.
 */

import { useEffect, useState } from "react";
import { AlertTriangle, Check, ChevronDown, Copy, Package, ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { PACKAGE_MANAGERS, type PackageManager } from "../cliInstallCommands";

import { RichText } from "./RichText";
import type { BuiltCommand, CliCommandSpec, CommandToken } from "./types";

const TOKEN_CLASS: Record<CommandToken["kind"], string> = {
    runner: "text-muted-foreground",
    binary: "text-foreground",
    command: "text-primary font-semibold",
    arg: "text-emerald-600 dark:text-emerald-400",
    flag: "text-amber-600 dark:text-amber-400",
    value: "text-amber-600/80 dark:text-amber-400/80",
};

interface CommandResultProps {
    spec: CliCommandSpec;
    built: BuiltCommand;
    packageManager: PackageManager;
    onPackageManagerChange: (pm: PackageManager) => void;
    /**
     * Hide the local package-manager tabs. Set when the surrounding page owns
     * that choice — a second set of tabs next to the page's own reads as a
     * different setting rather than the same one.
     */
    showPackageManagers?: boolean;
    /** Rendered beside Copy — the scoped surfaces put their Options menu here. */
    headerAction?: React.ReactNode;
}

export function CommandResult({
    spec,
    built,
    packageManager,
    onPackageManagerChange,
    showPackageManagers = true,
    headerAction,
}: CommandResultProps) {
    const [copied, setCopied] = useState(false);
    const [explaining, setExplaining] = useState(false);

    // Reset the tick when the command changes underneath it, so a stale "copied"
    // never claims the clipboard holds something it does not.
    useEffect(() => {
        setCopied(false);
    }, [built.text]);

    const copy = async () => {
        await navigator.clipboard.writeText(built.text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    };

    const errors = built.problems.filter((problem) => problem.level === "error");

    return (
        <div className="space-y-3">
            <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
                <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
                    {showPackageManagers ? (
                        <div className="inline-flex rounded-full border border-border bg-card p-0.5">
                            {PACKAGE_MANAGERS.map((pm) => (
                                <button
                                    key={pm}
                                    type="button"
                                    onClick={() => onPackageManagerChange(pm)}
                                    aria-pressed={packageManager === pm}
                                    className={cn(
                                        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                        packageManager === pm
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    {pm}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Your command
                        </p>
                    )}
                    <div className="flex items-center gap-1">
                        {headerAction}
                        <Button
                        size="sm"
                        variant="ghost"
                        onClick={copy}
                        disabled={built.incomplete || errors.length > 0}
                        className="h-7 gap-1.5 text-xs"
                    >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copied" : "Copy"}
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto px-5 py-5">
                    <code dir="ltr" className="whitespace-nowrap font-mono text-[15px] leading-relaxed">
                        {built.tokens.map((token, index) => (
                            <span key={`${token.text}-${index}`} className={TOKEN_CLASS[token.kind]}>
                                {index > 0 ? " " : ""}
                                {token.text}
                            </span>
                        ))}
                    </code>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-4 py-2.5">
                    <Summary built={built} />
                    <button
                        type="button"
                        onClick={() => setExplaining((current) => !current)}
                        aria-expanded={explaining}
                        className="ms-auto inline-flex items-center gap-1 rounded-md text-xs font-medium text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                        {explaining ? "Hide explanation" : "Explain this command"}
                        <ChevronDown
                            className={cn("h-3.5 w-3.5 transition-transform", explaining && "rotate-180")}
                        />
                    </button>
                </div>

                {explaining && (
                    <div className="space-y-4 border-t border-border bg-muted/20 px-4 py-3.5">
                        <div>
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                What each part means
                            </p>
                            <dl className="space-y-1.5">
                                {built.tokens.map((token, index) => (
                                    <div key={`${token.text}-legend-${index}`} className="flex gap-3">
                                        <dt
                                            dir="ltr"
                                            className={cn(
                                                "w-[34%] shrink-0 break-all font-mono text-[11px]",
                                                TOKEN_CLASS[token.kind],
                                            )}
                                        >
                                            {token.text}
                                        </dt>
                                        <dd className="text-xs leading-relaxed text-muted-foreground">
                                            <RichText text={token.note} />
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        <div>
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                What it does
                            </p>
                            <ul className="space-y-1.5">
                                {spec.whatItDoes.map((line) => (
                                    <li
                                        key={line}
                                        className="flex gap-2 text-xs leading-relaxed text-muted-foreground"
                                    >
                                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                                        <RichText text={line} />
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {built.writes.length > 0 && (
                            <div>
                                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    {built.dryRun ? "Would write" : "Writes"}
                                </p>
                                <div className="space-y-1">
                                    {built.writes.map((line) => (
                                        <RichText
                                            key={line}
                                            as="p"
                                            text={line}
                                            className="text-xs leading-relaxed text-muted-foreground"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <p className="rounded-lg border border-dashed border-border p-2.5 text-xs leading-relaxed text-muted-foreground">
                            <span className="font-medium text-foreground">When to use it: </span>
                            <RichText text={spec.whenToUse} />
                        </p>

                        {spec.caution && (
                            <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                                <RichText text={spec.caution} />
                            </p>
                        )}
                    </div>
                )}
            </div>

            {built.incomplete && (
                <Note>Pick at least one thing to install — this command needs an argument.</Note>
            )}

            {built.problems.map((problem) => (
                <div
                    key={problem.message}
                    className={cn(
                        "flex gap-2 rounded-lg border p-2.5 text-xs leading-relaxed",
                        problem.level === "error"
                            ? "border-destructive/40 bg-destructive/5 text-destructive"
                            : "border-amber-500/40 bg-amber-500/5 text-muted-foreground",
                    )}
                >
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <RichText text={problem.message} />
                </div>
            ))}
        </div>
    );
}

/** The one-line "what will this do to my project" strip. */
function Summary({ built }: { built: BuiltCommand }) {
    if (built.incomplete) {
        return <span className="text-xs text-muted-foreground">Incomplete</span>;
    }

    // A div rather than a span for the same reason `WorkspacePanel` uses one:
    // it contains `Badge`, which renders a div.
    return (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {built.dryRun ? (
                <span className="font-medium text-foreground">Preview only — writes nothing</span>
            ) : built.writes.length > 0 ? (
                <span>
                    Writes to{" "}
                    <span className="font-medium text-foreground">
                        {built.writes.length} {built.writes.length === 1 ? "place" : "places"}
                    </span>
                </span>
            ) : (
                <span>Changes no files</span>
            )}

            {built.installs.length > 0 && (
                <>
                    <span aria-hidden>·</span>
                    <Package className="h-3 w-3" />
                    {built.installs.map((dep) => (
                        <Badge key={dep} variant="secondary" className="font-mono text-[10px]">
                            {dep}
                        </Badge>
                    ))}
                </>
            )}
        </div>
    );
}

function Note({ children }: { children: React.ReactNode }) {
    return (
        <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
            {children}
        </p>
    );
}
