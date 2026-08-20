"use client";

/**
 * The transport chooser shown in every builder Export tab.
 *
 * The four generator families have accepted a `TransportChoice` since Wave-9,
 * but nothing in the UI ever passed one — so every Export tab silently rendered
 * the `fetch` + React-state default and the axios / TanStack code paths were
 * unreachable from the site. This is the control that closes that gap.
 *
 * Two INDEPENDENT axes (AI_AGENT_RULES § R-56). They compose: picking axios
 * does not change where the result is held, and vice versa. Keep them as two
 * separate groups — collapsing them into one four-way list is what makes people
 * believe the choices are coupled.
 *
 * Visual shape deliberately mirrors the other option cards in the Export tabs
 * (radio + icon + bold name + one-line description), so this reads as one more
 * optional choice rather than a special case.
 */

import { Boxes, Database, Globe, Zap } from "lucide-react";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import {
    isDefaultTransport,
    transportFlags,
    transportNpmDependencies,
    type HttpClient,
    type QueryStrategy,
    type TransportChoice,
} from "@/lib/codegen/transport";

/** Same classes the other option cards use — keep them in step. */
const OPTION_CLASS =
    "flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/30 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5";

interface TransportPickerProps {
    value: TransportChoice;
    onChange: (choice: TransportChoice) => void;
    /**
     * Rendered under the axes as the exact command that reproduces the choice.
     * Omit on surfaces that show their own install bar.
     */
    installCommand?: string;
    /** Prefix for the radio ids, so two pickers can coexist on one page. */
    idPrefix?: string;
    /**
     * Render the axes without the surrounding Card and heading. Set when the
     * picker sits inside `BuilderInstallPanel`, which supplies its own numbered
     * step header — a card inside a card reads as a separate concern.
     */
    bare?: boolean;
    className?: string;
}

export function TransportPicker({
    value,
    onChange,
    installCommand,
    idPrefix = "transport",
    bare,
    className,
}: TransportPickerProps) {
    const deps = transportNpmDependencies(value);
    const flags = transportFlags(value);

    const body = (
            <div className="space-y-4">
                <div>
                    <p className="text-[11px] font-medium text-muted-foreground mb-2">
                        HTTP client — used by <code className="bg-muted px-1 rounded">services.ts</code>
                    </p>
                    <RadioGroup
                        value={value.http}
                        onValueChange={(v) => onChange({ ...value, http: v as HttpClient })}
                        className="grid sm:grid-cols-2 gap-3"
                    >
                        <Label htmlFor={`${idPrefix}-fetch`} className={OPTION_CLASS}>
                            <RadioGroupItem value="fetch" id={`${idPrefix}-fetch`} className="mt-0.5" />
                            <div className="flex-1">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Globe className="h-3.5 w-3.5 text-primary" />
                                    <span className="text-sm font-semibold">fetch</span>
                                    <span className="text-[10px] text-muted-foreground">(default)</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    Built into the browser. Nothing to install.
                                </p>
                            </div>
                        </Label>
                        <Label htmlFor={`${idPrefix}-axios`} className={OPTION_CLASS}>
                            <RadioGroupItem value="axios" id={`${idPrefix}-axios`} className="mt-0.5" />
                            <div className="flex-1">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Zap className="h-3.5 w-3.5 text-primary" />
                                    <span className="text-sm font-semibold">axios</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    Interceptors, shared instances, auth headers. Adds{" "}
                                    <code className="bg-muted px-1 rounded">axios</code>.
                                </p>
                            </div>
                        </Label>
                    </RadioGroup>
                </div>

                <div>
                    <p className="text-[11px] font-medium text-muted-foreground mb-2">
                        Where results are held — used by <code className="bg-muted px-1 rounded">hooks.ts</code>
                    </p>
                    <RadioGroup
                        value={value.query}
                        onValueChange={(v) => onChange({ ...value, query: v as QueryStrategy })}
                        className="grid sm:grid-cols-2 gap-3"
                    >
                        <Label htmlFor={`${idPrefix}-local`} className={OPTION_CLASS}>
                            <RadioGroupItem value="local" id={`${idPrefix}-local`} className="mt-0.5" />
                            <div className="flex-1">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Boxes className="h-3.5 w-3.5 text-primary" />
                                    <span className="text-sm font-semibold">React state</span>
                                    <span className="text-[10px] text-muted-foreground">(default)</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    Plain <code className="bg-muted px-1 rounded">useState</code>. Nothing to install.
                                </p>
                            </div>
                        </Label>
                        <Label htmlFor={`${idPrefix}-tanstack`} className={OPTION_CLASS}>
                            <RadioGroupItem value="tanstack" id={`${idPrefix}-tanstack`} className="mt-0.5" />
                            <div className="flex-1">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Database className="h-3.5 w-3.5 text-primary" />
                                    <span className="text-sm font-semibold">TanStack Query</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    Caching, refetching, shared server state. Adds{" "}
                                    <code className="bg-muted px-1 rounded">@tanstack/react-query</code>.
                                </p>
                            </div>
                        </Label>
                    </RadioGroup>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5">
                    <p className="text-[11px] text-muted-foreground">
                        {isDefaultTransport(value) ? (
                            <>
                                Installs <span className="font-medium text-foreground">no extra packages</span>.
                            </>
                        ) : (
                            <>
                                Adds{" "}
                                {deps.map((d, i) => (
                                    <span key={d}>
                                        {i > 0 && " and "}
                                        <code className="bg-muted px-1 rounded">{d}</code>
                                    </span>
                                ))}
                                , installed for you by the CLI.
                            </>
                        )}
                    </p>
                    {installCommand && (
                        <p className="text-[11px] font-mono text-foreground break-all">{installCommand}</p>
                    )}
                    {flags.length > 0 && !installCommand && (
                        <p className="text-[11px] text-muted-foreground">
                            CLI flags: <code className="bg-muted px-1 rounded">{flags.join(" ")}</code>
                        </p>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                        Already installed? Switch without reinstalling:{" "}
                        <code className="bg-muted px-1 rounded">afnoui transport &lt;variant&gt; {flags.join(" ") || "--fetch --local-state"}</code>
                    </p>
                </div>
            </div>
    );

    if (bare) {
        return (
            <div className={className}>
                <CompactTransport value={value} onChange={onChange} idPrefix={idPrefix} />
            </div>
        );
    }

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm">Transport</CardTitle>
                <CardDescription className="text-xs">
                    Both are optional and independent. The default adds{" "}
                    <span className="font-medium text-foreground">no dependency at all</span> — axios and
                    TanStack Query are opt-ins the CLI installs only when you ask for them.
                </CardDescription>
            </CardHeader>
            <CardContent>{body}</CardContent>
        </Card>
    );
}

/**
 * The compact form used inside `BuilderInstallPanel`.
 *
 * Same two independent axes, but as segmented controls rather than four option
 * cards — inside a numbered step the surrounding panel already explains the
 * choice, so the cards were repeating context and costing ~14 rows to say what
 * fits in three. The axes stay side by side and separately labelled: collapsing
 * them into one four-way control is what makes people read them as coupled.
 */
function CompactTransport({
    value,
    onChange,
    idPrefix,
}: Pick<TransportPickerProps, "value" | "onChange" | "idPrefix">) {
    const deps = transportNpmDependencies(value);

    return (
        <div className="space-y-2.5">
            <div className="grid gap-3 sm:grid-cols-2">
                <Segmented
                    label="HTTP client"
                    hint="used by services.ts"
                    name={`${idPrefix}-http`}
                    value={value.http}
                    onChange={(next) => onChange({ ...value, http: next as HttpClient })}
                    options={[
                        { value: "fetch", label: "fetch" },
                        { value: "axios", label: "axios" },
                    ]}
                />
                <Segmented
                    label="Where results live"
                    hint="used by hooks.ts"
                    name={`${idPrefix}-query`}
                    value={value.query}
                    onChange={(next) => onChange({ ...value, query: next as QueryStrategy })}
                    options={[
                        { value: "local", label: "React state" },
                        { value: "tanstack", label: "TanStack Query" },
                    ]}
                />
            </div>

            <p className="text-[11px] text-muted-foreground">
                {isDefaultTransport(value) ? (
                    <>
                        Adds <span className="font-medium text-foreground">no extra packages</span>.
                    </>
                ) : (
                    <>
                        Adds{" "}
                        {deps.map((dep, index) => (
                            <span key={dep}>
                                {index > 0 && " and "}
                                <code className="rounded bg-muted px-1">{dep}</code>
                            </span>
                        ))}
                        .
                    </>
                )}
            </p>
        </div>
    );
}

function Segmented({
    label,
    hint,
    name,
    value,
    onChange,
    options,
}: {
    label: string;
    hint: string;
    name: string;
    value: string;
    onChange: (next: string) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground">
                {label} <span className="font-normal opacity-70">— {hint}</span>
            </p>
            <RadioGroup
                value={value}
                onValueChange={onChange}
                className="inline-flex w-full gap-0.5 rounded-lg border border-border bg-muted/30 p-0.5"
            >
                {options.map((option) => (
                    <Label
                        key={option.value}
                        htmlFor={`${name}-${option.value}`}
                        className="flex-1 cursor-pointer rounded-md px-3 py-1.5 text-center text-xs font-medium text-muted-foreground transition-colors hover:text-foreground [&:has([data-state=checked])]:bg-background [&:has([data-state=checked])]:text-foreground [&:has([data-state=checked])]:shadow-sm"
                    >
                        <RadioGroupItem
                            id={`${name}-${option.value}`}
                            value={option.value}
                            className="sr-only"
                        />
                        {option.label}
                    </Label>
                ))}
            </RadioGroup>
        </div>
    );
}
