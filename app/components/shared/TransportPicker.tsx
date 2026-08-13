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
     * Set when the current config emits no network layer, so the choice would
     * change nothing. The control stays visible (people should learn the option
     * exists) but says plainly that it is inert and what to change to use it —
     * a live control that silently no-ops is worse than no control.
     */
    inactiveReason?: string;
    className?: string;
}

export function TransportPicker({
    value,
    onChange,
    installCommand,
    idPrefix = "transport",
    inactiveReason,
    className,
}: TransportPickerProps) {
    const deps = transportNpmDependencies(value);
    const flags = transportFlags(value);

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
            <CardContent className="space-y-4">
                {inactiveReason && (
                    <p className="text-[11px] rounded-lg border border-dashed border-border bg-muted/30 p-2.5 text-muted-foreground">
                        <span className="font-medium text-foreground">Nothing to send yet.</span> {inactiveReason}
                    </p>
                )}
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
            </CardContent>
        </Card>
    );
}
