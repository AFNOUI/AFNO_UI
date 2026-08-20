/**
 * The curated starting points — "I want a form" rather than "I want `add`".
 *
 * These replace the static command cards the homepage used to list. Same
 * curation, but clicking one now *loads it into the playground* instead of
 * dead-ending at a copy button, so the next question ("…but with axios?") has
 * somewhere to go.
 *
 * Every `args` entry here is a real registry slug, locked by a test. That
 * matters: the static cards these came from shipped two slugs that do not
 * exist (`charts/bar/charts-bar-grouped`, `button/variants`) and would have
 * 404'd for anyone who copied them.
 */

import {
    BarChart3,
    Boxes,
    Database,
    FormInput,
    Kanban,
    List,
    MousePointer2,
    Network,
    Rocket,
    Stethoscope,
    Table2,
    type LucideIcon,
} from "lucide-react";

export interface CliPreset {
    id: string;
    label: string;
    icon: LucideIcon;
    commandId: string;
    args?: string[];
    flags?: Record<string, string | boolean>;
}

export const CLI_PRESETS: CliPreset[] = [
    { id: "init", label: "Start a project", icon: Rocket, commandId: "init" },
    {
        id: "primitives",
        label: "Add components",
        icon: Boxes,
        commandId: "add",
        args: ["button", "card", "dialog", "tabs"],
    },
    {
        id: "form",
        label: "A form",
        icon: FormInput,
        commandId: "add",
        args: ["forms/forms-contact"],
    },
    {
        id: "table",
        label: "A data table",
        icon: Table2,
        commandId: "add",
        args: ["tables/tables-server-crm"],
    },
    {
        id: "kanban",
        label: "A kanban board",
        icon: Kanban,
        commandId: "add",
        args: ["kanban/kanban-sprint-board"],
    },
    {
        id: "tree",
        label: "A tree or graph",
        icon: Network,
        commandId: "add",
        args: ["tree/tree-org"],
    },
    {
        id: "chart",
        label: "A chart",
        icon: BarChart3,
        commandId: "add",
        args: ["charts/bar/grouped"],
    },
    {
        id: "dnd",
        label: "Drag & drop",
        icon: MousePointer2,
        commandId: "add",
        args: ["dnd/sortable-list"],
    },
    {
        id: "transport",
        label: "Switch to axios",
        icon: Database,
        commandId: "transport",
        args: ["tables/tables-server-crm"],
        flags: { httpClient: "axios" },
    },
    {
        id: "list",
        label: "See what exists",
        icon: List,
        commandId: "list",
        args: ["variants"],
    },
    { id: "doctor", label: "Health check", icon: Stethoscope, commandId: "doctor" },
];
