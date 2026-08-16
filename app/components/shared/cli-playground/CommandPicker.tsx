"use client";

/**
 * Step 1 — "what are you trying to do?"
 *
 * Grouped by intent rather than by command name, because someone who does not
 * know the CLI cannot look up a command by a name they have never seen. The
 * tagline under each command is doing the real work here; the command name is
 * almost a detail.
 */

import { cn } from "@/lib/utils";

import { RichText } from "./RichText";
import { CLI_GROUPS, commandsInGroup } from "./commandSpecs";
import type { CliCommandSpec, CliGroupId } from "./types";

interface CommandPickerProps {
    activeGroup: CliGroupId;
    onGroupChange: (group: CliGroupId) => void;
    selected: CliCommandSpec;
    onSelect: (command: CliCommandSpec) => void;
}

export function CommandPicker({
    activeGroup,
    onGroupChange,
    selected,
    onSelect,
}: CommandPickerProps) {
    const group = CLI_GROUPS.find((candidate) => candidate.id === activeGroup) ?? CLI_GROUPS[0];
    const commands = commandsInGroup(group.id);

    return (
        <div className="space-y-4">
            <div role="tablist" aria-label="What are you trying to do?" className="flex flex-wrap gap-2">
                {CLI_GROUPS.map((candidate) => {
                    const Icon = candidate.icon;
                    const isActive = candidate.id === activeGroup;
                    return (
                        <button
                            key={candidate.id}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => onGroupChange(candidate.id)}
                            className={cn(
                                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all sm:text-sm",
                                isActive
                                    ? "border-primary/50 bg-primary/10 text-foreground shadow-sm"
                                    : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
                            )}
                        >
                            <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                            {candidate.label}
                        </button>
                    );
                })}
            </div>

            <RichText as="p" text={group.blurb} className="text-sm leading-relaxed text-muted-foreground" />

            <div className="grid gap-2 sm:grid-cols-2">
                {commands.map((command) => {
                    const Icon = command.icon;
                    const isActive = command.id === selected.id;
                    return (
                        <button
                            key={command.id}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => onSelect(command)}
                            className={cn(
                                "flex items-start gap-3 rounded-lg border p-3 text-start transition-colors",
                                isActive
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:bg-muted/30",
                            )}
                        >
                            <Icon
                                className={cn(
                                    "mt-0.5 h-4 w-4 shrink-0",
                                    isActive ? "text-primary" : "text-muted-foreground",
                                )}
                            />
                            <span className="min-w-0">
                                <code dir="ltr" className="block font-mono text-sm font-semibold">
                                    afnoui {command.command}
                                </code>
                                <RichText
                                    text={command.tagline}
                                    className="mt-0.5 block text-xs leading-relaxed text-muted-foreground"
                                />
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
