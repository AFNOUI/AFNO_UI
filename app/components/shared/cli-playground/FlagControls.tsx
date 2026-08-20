"use client";

/**
 * Step 3 — the options.
 *
 * Two rules, both learned the hard way elsewhere in this codebase:
 *
 * 1. Only offer flags that apply. `--stack` means nothing unless a `forms/*`
 *    slug is selected, so it is not rendered at all until one is.
 * 2. Never render a live control that silently does nothing. A flag that is
 *    relevant but currently inert says so, and says what to change.
 *
 * Independent axes stay as separate controls — collapsing the transport axes
 * into one four-way list is exactly what makes people believe the choices are
 * coupled (see the note at the top of `TransportPicker.tsx`).
 */

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { RichText } from "./RichText";
import { GLOBAL_FLAGS } from "./commandSpecs";
import type { CliCommandSpec, CliFlagSpec, CommandContext } from "./types";

interface FlagControlsProps {
    spec: CliCommandSpec;
    ctx: CommandContext;
    onChange: (flagId: string, value: string | boolean | undefined) => void;
    idPrefix: string;
    /**
     * Flags the surrounding page already has a control for. On a variant page
     * the transport radios sit right above this panel, so repeating them here
     * reads as a second, possibly-conflicting setting rather than the same one.
     */
    hiddenFlagIds?: string[];
}

export function FlagControls({
    spec,
    ctx,
    onChange,
    idPrefix,
    hiddenFlagIds = [],
}: FlagControlsProps) {
    const applicable = spec.flags.filter(
        (flag) => (flag.relevantWhen?.(ctx) ?? true) && !hiddenFlagIds.includes(flag.id),
    );
    const hidden = spec.flags.filter((flag) => flag.relevantWhen?.(ctx) === false).length;
    const globals = GLOBAL_FLAGS.filter((flag) =>
        (spec.globalFlags as string[]).includes(flag.id),
    );

    if (applicable.length === 0 && globals.length === 0) return null;

    return (
        <div className="space-y-5">
            {applicable.length > 0 && (
                <div className="space-y-3">
                    <p className="text-sm font-semibold">Options for this command</p>
                    {applicable.map((flag) => (
                        <FlagControl
                            key={flag.id}
                            flag={flag}
                            ctx={ctx}
                            onChange={onChange}
                            idPrefix={idPrefix}
                        />
                    ))}
                </div>
            )}

            {hidden > 0 && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                    {hidden === 1 ? "One more option applies" : `${hidden} more options apply`} to this
                    command, but not to what you have selected — pick a bundle that has a data layer or
                    a <code dir="ltr">forms/*</code> variant and they appear here.
                </p>
            )}

            {globals.length > 0 && (
                <div className="space-y-3">
                    <p className="text-sm font-semibold">
                        Flags that work on any command
                    </p>
                    {globals.map((flag) => (
                        <FlagControl
                            key={flag.id}
                            flag={flag}
                            ctx={ctx}
                            onChange={onChange}
                            idPrefix={idPrefix}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function FlagControl({
    flag,
    ctx,
    onChange,
    idPrefix,
}: {
    flag: CliFlagSpec;
    ctx: CommandContext;
    onChange: (flagId: string, value: string | boolean | undefined) => void;
    idPrefix: string;
}) {
    const inert = flag.inertWhen?.(ctx) ?? null;

    if (flag.kind === "boolean") {
        const checked = ctx.flags[flag.id] === true;
        return (
            <div
                className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                    checked ? "border-primary bg-primary/5" : "border-border",
                )}
            >
                <Switch
                    id={`${idPrefix}-${flag.id}`}
                    checked={checked}
                    onCheckedChange={(next) => onChange(flag.id, next ? true : undefined)}
                    className="mt-0.5"
                />
                <div className="min-w-0 space-y-1">
                    <Label htmlFor={`${idPrefix}-${flag.id}`} className="cursor-pointer">
                        <code dir="ltr" className="font-mono text-xs font-semibold text-primary">
                            {flag.flag}
                        </code>
                        {flag.label !== flag.flag && (
                            <span className="ms-2 text-sm font-medium">{flag.label}</span>
                        )}
                    </Label>
                    <RichText
                        as="p"
                        text={flag.note}
                        className="text-xs leading-relaxed text-muted-foreground"
                    />
                    {checked && flag.detail && (
                        <RichText
                            as="p"
                            text={flag.detail}
                            className="text-xs leading-relaxed text-muted-foreground/80"
                        />
                    )}
                    {inert && <InertNote reason={inert} />}
                </div>
            </div>
        );
    }

    const value = (ctx.flags[flag.id] as string | undefined) ?? flag.defaultValue ?? "";
    return (
        <fieldset className="space-y-2 rounded-lg border border-border p-3">
            <legend className="px-1 text-sm font-medium">{flag.label}</legend>
            <RichText
                as="p"
                text={flag.note}
                className="text-xs leading-relaxed text-muted-foreground"
            />
            <RadioGroup
                value={value}
                onValueChange={(next) => onChange(flag.id, next)}
                className="grid gap-2 pt-1"
            >
                {flag.options?.map((option) => (
                    <Label
                        key={option.value}
                        htmlFor={`${idPrefix}-${flag.id}-${option.value}`}
                        className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-2.5 transition-colors hover:bg-muted/30 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
                    >
                        <RadioGroupItem
                            id={`${idPrefix}-${flag.id}-${option.value}`}
                            value={option.value}
                            className="mt-0.5"
                        />
                        <span className="min-w-0">
                            <span className="block text-sm font-medium">
                                {option.label}
                                {option.token && (
                                    <code
                                        dir="ltr"
                                        className="ms-2 font-mono text-[11px] font-normal text-primary"
                                    >
                                        {option.token}
                                    </code>
                                )}
                            </span>
                            <RichText
                                text={option.note}
                                className="mt-0.5 block text-xs leading-relaxed text-muted-foreground"
                            />
                        </span>
                    </Label>
                ))}
            </RadioGroup>
            {value !== flag.defaultValue && flag.detail && (
                <RichText
                    as="p"
                    text={flag.detail}
                    className="text-xs leading-relaxed text-muted-foreground/80"
                />
            )}
            {inert && <InertNote reason={inert} />}
        </fieldset>
    );
}

function InertNote({ reason }: { reason: string }) {
    return (
        <p className="rounded-md border border-dashed border-border px-2 py-1.5 text-xs leading-relaxed text-muted-foreground">
            {reason}
        </p>
    );
}
