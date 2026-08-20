"use client";

/**
 * The CLI playground — build an `afnoui` command by answering questions instead
 * of remembering flags.
 *
 * Layout is deliberately compact: a preset row, one toolbar of three dropdowns,
 * and the command itself. Everything explanatory sits behind a disclosure that
 * is closed by default. The first version of this put all three steps on the
 * page at once and read as a form to fill in — which is intimidating for a tool
 * whose whole job is to be less intimidating than `--help`. Presets mean the
 * common case is one click and no reading at all.
 *
 * Two modes, one component:
 *
 * - **Full** (the homepage): presets + every command.
 * - **Scoped** (`scope` prop, for builder and variant pages): one command with
 *   its argument pre-filled, so the page shows exactly the command that installs
 *   what is on screen.
 *
 * Command construction lives in `buildCommand.ts` rather than in each page: a
 * page that assembles its own string is a page that can disagree with the one
 * next to it, which has already happened here more than once.
 */

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Settings2, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import type { PackageManager } from "../cliInstallCommands";

import { buildCommand, visibleFlags } from "./buildCommand";
import { CommandPicker } from "./CommandPicker";
import { ArgumentPicker } from "./ArgumentPicker";
import { FlagControls } from "./FlagControls";
import { CommandResult } from "./CommandResult";
import { CLI_COMMANDS, COMMANDS_BY_ID, GLOBAL_FLAGS } from "./commandSpecs";
import { CLI_PRESETS, type CliPreset } from "./presets";
import type { CliCommandSpec, CliGroupId, CommandContext } from "./types";

export interface CliPlaygroundScope {
    /** Which command this surface is about, e.g. `"add"`. */
    commandId: string;
    /** Pre-filled positional arguments — usually the variant the page shows. */
    args?: string[];
    /** Hide the command picker. Set on builder / variant pages. */
    lockCommand?: boolean;
    /** Hide the argument picker too, when the page's subject is fixed. */
    lockArgs?: boolean;
    /**
     * Flag values driven by the surrounding page rather than by the user — a
     * builder that already knows you picked TanStack Form should print
     * `--stack tanstack`, not the default. Re-applied whenever they change, so
     * the command cannot fall behind the config it claims to describe.
     */
    flags?: Record<string, string | boolean>;
}

interface CliPlaygroundProps {
    scope?: CliPlaygroundScope;
    className?: string;
    idPrefix?: string;
    /**
     * Controlled package manager. Pass this when the page shows its own
     * selector, so both follow one choice instead of drifting apart.
     */
    packageManager?: PackageManager;
    onPackageManagerChange?: (pm: PackageManager) => void;
}

/** Enum flags start on their declared default so the command is valid at once. */
function initialFlags(spec: CliCommandSpec, preset?: CliPreset): CommandContext["flags"] {
    const flags: CommandContext["flags"] = {};
    for (const flag of spec.flags) {
        if (flag.kind === "enum" && flag.defaultValue) flags[flag.id] = flag.defaultValue;
    }
    return { ...flags, ...preset?.flags };
}

function initialArgs(spec: CliCommandSpec, args?: string[]): string[] {
    if (args) return args;
    // `list` always has a scope word, even when that word is the empty default.
    if (spec.args.kind === "scope") return [spec.args.choices?.[0]?.value ?? ""];
    return [];
}

export function CliPlayground({
    scope,
    className,
    idPrefix = "cli",
    packageManager: controlledPm,
    onPackageManagerChange,
}: CliPlaygroundProps) {
    const initialSpec = scope
        ? (COMMANDS_BY_ID[scope.commandId] ?? CLI_COMMANDS[0])
        : (COMMANDS_BY_ID.add ?? CLI_COMMANDS[0]);

    const [spec, setSpec] = useState<CliCommandSpec>(initialSpec);
    const [activeGroup, setActiveGroup] = useState<CliGroupId>(initialSpec.group);
    const [args, setArgs] = useState<string[]>(() =>
        // The preset fallback is the HOMEPAGE's opening state. A scoped surface
        // must never inherit it: `table init` takes no arguments, so falling
        // through to the "A form" preset printed
        // `npx afnoui table init forms/forms-contact` on the table builder.
        initialArgs(initialSpec, scope ? scope.args : CLI_PRESETS[2].args),
    );
    const [flags, setFlags] = useState<CommandContext["flags"]>(() => ({
        ...initialFlags(initialSpec),
        ...scope?.flags,
    }));
    const [internalPm, setInternalPm] = useState<PackageManager>("npm");
    const packageManager = controlledPm ?? internalPm;
    const setPackageManager = (pm: PackageManager) => {
        if (controlledPm === undefined) setInternalPm(pm);
        onPackageManagerChange?.(pm);
    };
    const [activePreset, setActivePreset] = useState<string | null>(scope ? null : "form");
    const [openPanel, setOpenPanel] = useState<"command" | "args" | "options" | null>(null);

    // Page-driven flags win over local state: the surrounding builder knows
    // things the playground does not (the stack you picked, the data mode), and
    // a command that disagrees with the config above it is worse than no command.
    const scopeFlagKey = JSON.stringify(scope?.flags ?? null);
    useEffect(() => {
        const next = scope?.flags;
        if (!next) return;
        setFlags((current) => ({ ...current, ...next }));
        // scopeFlagKey is the stable identity of `next` — the object itself is
        // re-created by the parent on every render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scopeFlagKey]);

    const ctx = useMemo<CommandContext>(() => ({ args, flags }), [args, flags]);
    const built = useMemo(
        () => buildCommand(spec, ctx, packageManager),
        [spec, ctx, packageManager],
    );

    // Switching commands resets the selection: `--stack` from `add` means
    // nothing on `doctor`, and carrying it over would print an invalid command.
    const selectCommand = (next: CliCommandSpec) => {
        setSpec(next);
        setArgs(initialArgs(next));
        setFlags(initialFlags(next));
        setActivePreset(null);
        setOpenPanel(next.args.kind === "none" ? null : "args");
    };

    const applyPreset = (preset: CliPreset) => {
        const next = COMMANDS_BY_ID[preset.commandId];
        if (!next) return;
        setSpec(next);
        setActiveGroup(next.group);
        setArgs(initialArgs(next, preset.args));
        setFlags(initialFlags(next, preset));
        setActivePreset(preset.id);
        setOpenPanel(null);
    };

    const setFlag = (flagId: string, value: string | boolean | undefined) => {
        setFlags((current) => ({ ...current, [flagId]: value }));
        setActivePreset(null);
    };

    const changeArgs = (next: string[]) => {
        setArgs(next);
        setActivePreset(null);
    };

    const activeOptionCount =
        visibleFlags(spec, ctx).filter((flag) =>
            flag.kind === "boolean"
                ? flags[flag.id] === true
                : typeof flags[flag.id] === "string" && flags[flag.id] !== flag.defaultValue,
        ).length +
        GLOBAL_FLAGS.filter(
            (flag) => (spec.globalFlags as string[]).includes(flag.id) && flags[flag.id] === true,
        ).length;

    const argSummary =
        spec.args.kind === "none"
            ? "Takes no arguments"
            : args.filter(Boolean).length === 0
              ? "Nothing selected"
              : args.filter(Boolean).length === 1
                ? args.filter(Boolean)[0]
                : `${args.filter(Boolean).length} selected`;

    const hasOptions = visibleFlags(spec, ctx).length > 0 || spec.globalFlags.length > 0;

    // Anything the page feeds in via `scope.flags` already has a control on the
    // page. The scoped Options menu offers only what is left.
    const pageDrivenFlagIds = useMemo(() => Object.keys(scope?.flags ?? {}), [scope?.flags]);
    const hasScopedOptions =
        visibleFlags(spec, ctx).some((flag) => !pageDrivenFlagIds.includes(flag.id)) ||
        spec.globalFlags.length > 0;
    const scopedOptionCount =
        visibleFlags(spec, ctx).filter(
            (flag) =>
                !pageDrivenFlagIds.includes(flag.id) &&
                (flag.kind === "boolean"
                    ? flags[flag.id] === true
                    : typeof flags[flag.id] === "string" && flags[flag.id] !== flag.defaultValue),
        ).length +
        GLOBAL_FLAGS.filter(
            (flag) => (spec.globalFlags as string[]).includes(flag.id) && flags[flag.id] === true,
        ).length;

    return (
        <div className={cn("space-y-7", className)}>
            {!scope && (
                <section className="space-y-3.5">
                    <StepLabel step={1} icon={Sparkles}>
                        Start from a common task
                    </StepLabel>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                        {CLI_PRESETS.map((preset) => {
                            const Icon = preset.icon;
                            const isActive = preset.id === activePreset;
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => applyPreset(preset)}
                                    aria-pressed={isActive}
                                    className={cn(
                                        "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-start text-sm font-medium transition-all",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                                        isActive
                                            ? "border-primary bg-primary/10 text-foreground shadow-sm"
                                            : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-muted/40 hover:text-foreground",
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "h-4 w-4 shrink-0",
                                            isActive ? "text-primary" : "text-muted-foreground",
                                        )}
                                    />
                                    <span className="truncate">{preset.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Full mode only. A scoped surface keeps its controls in the
                command card's header instead, because the page around it
                already owns most of them. */}
            {!scope && hasOptions && (
                <section className="space-y-3.5">
                    <StepLabel step={2} icon={Settings2}>
                        Or build it yourself
                    </StepLabel>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {(
                            <Dropdown
                                open={openPanel === "command"}
                                onOpenChange={(open) => setOpenPanel(open ? "command" : null)}
                                label="Command"
                                value={`afnoui ${spec.command}`}
                                panelClassName="w-[min(38rem,calc(100vw-2rem))]"
                            >
                                <CommandPicker
                                    activeGroup={activeGroup}
                                    onGroupChange={setActiveGroup}
                                    selected={spec}
                                    onSelect={selectCommand}
                                />
                            </Dropdown>
                        )}

                        {spec.args.kind !== "none" && (
                            <Dropdown
                                open={openPanel === "args"}
                                onOpenChange={(open) => setOpenPanel(open ? "args" : null)}
                                label={spec.args.kind === "scope" ? "List what" : "What to install"}
                                value={argSummary}
                                highlight={args.filter(Boolean).length > 0}
                                panelClassName="w-[min(54rem,calc(100vw-2rem))]"
                            >
                                <ArgumentPicker
                                    spec={spec.args}
                                    value={args}
                                    onChange={changeArgs}
                                    idPrefix={`${idPrefix}-${spec.id}`}
                                />
                            </Dropdown>
                        )}

                        {hasOptions && (
                            <Dropdown
                                open={openPanel === "options"}
                                onOpenChange={(open) => setOpenPanel(open ? "options" : null)}
                                label="Options"
                                value={
                                    activeOptionCount === 0
                                        ? "Defaults"
                                        : `${activeOptionCount} changed`
                                }
                                highlight={activeOptionCount > 0}
                                panelClassName="w-[min(26rem,calc(100vw-2rem))]"
                            >
                                <FlagControls
                                    spec={spec}
                                    ctx={ctx}
                                    onChange={setFlag}
                                    idPrefix={`${idPrefix}-${spec.id}`}
                                />
                            </Dropdown>
                        )}
                    </div>
                </section>
            )}


            <CommandResult
                spec={spec}
                built={built}
                packageManager={packageManager}
                onPackageManagerChange={setPackageManager}
                showPackageManagers={controlledPm === undefined}
                headerAction={
                    scope && hasScopedOptions ? (
                        <Dropdown
                            compact
                            open={openPanel === "options"}
                            onOpenChange={(open) => setOpenPanel(open ? "options" : null)}
                            label="Options"
                            value={
                                scopedOptionCount === 0 ? "Options" : `Options · ${scopedOptionCount}`
                            }
                            highlight={scopedOptionCount > 0}
                            panelClassName="w-[min(24rem,calc(100vw-2rem))]"
                        >
                            <FlagControls
                                spec={spec}
                                ctx={ctx}
                                onChange={setFlag}
                                idPrefix={`${idPrefix}-${spec.id}`}
                                hiddenFlagIds={pageDrivenFlagIds}
                            />
                        </Dropdown>
                    ) : null
                }
            />
        </div>
    );
}

/** A numbered step heading — the structure the flat version was missing. */
function StepLabel({
    step,
    icon: Icon,
    children,
}: {
    step?: number;
    icon: typeof Sparkles;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center gap-2.5">
            {step !== undefined ? (
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[11px] font-semibold text-primary">
                    {step}
                </span>
            ) : (
                <Icon className="h-4 w-4 text-primary" />
            )}
            <h3 className="text-sm font-semibold tracking-tight">{children}</h3>
        </div>
    );
}

function Dropdown({
    open,
    onOpenChange,
    label,
    value,
    highlight,
    compact,
    panelClassName,
    children,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    label: string;
    value: string;
    highlight?: boolean;
    /** Header-sized trigger: one line, no stacked label. */
    compact?: boolean;
    panelClassName?: string;
    children: React.ReactNode;
}) {
    if (compact) {
        return (
            <Popover open={open} onOpenChange={onOpenChange}>
                <PopoverTrigger asChild>
                    <Button
                        size="sm"
                        variant="ghost"
                        className={cn("h-7 gap-1.5 text-xs", highlight && "text-primary")}
                    >
                        <Settings2 className="h-3.5 w-3.5" />
                        {value}
                        <ChevronDown className="h-3 w-3" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    align="end"
                    collisionPadding={16}
                    className={cn("max-h-[75vh] overflow-y-auto p-4", panelClassName)}
                >
                    {children}
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "h-auto w-full justify-between gap-3 px-3.5 py-2.5",
                        highlight && "border-primary/50 bg-primary/5",
                    )}
                >
                    <span className="min-w-0 text-start">
                        <span className="block text-[10px] font-semibold uppercase leading-tight tracking-wider text-muted-foreground">
                            {label}
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-sm leading-tight">
                            {value}
                        </span>
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Button>
            </PopoverTrigger>
            {/* Centred on the trigger rather than left-aligned to it: these
                panels are much wider than the button that opens them, so
                `align="start"` pushes them off the side of the viewport.
                `collisionPadding` keeps them inside it either way. */}
            <PopoverContent
                align="center"
                collisionPadding={16}
                className={cn("max-h-[75vh] overflow-y-auto p-4", panelClassName)}
            >
                {children}
            </PopoverContent>
        </Popover>
    );
}
