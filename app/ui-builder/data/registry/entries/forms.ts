import {
    CalendarDays, CircleDot, FormInput, ListChecks, TextCursorInput,
    ToggleLeft, ToggleRight, Upload,
} from "lucide-react";

import type { ComponentRegistryEntry } from "../types";

/** Forms category: primitive inputs, selects, switches, radios, pickers. */
export const FORM_ENTRIES: ComponentRegistryEntry[] = [
    {
        type: "input",
        label: "Input",
        icon: FormInput,
        category: "forms",
        isContainer: false,
        defaultProps: { label: "Email", placeholder: "you@example.com", inputType: "email" },
        defaultStyles: { base: {} },
        editableProps: [
            { key: "label", label: "Label", type: "text" },
            { key: "placeholder", label: "Placeholder", type: "text" },
            { key: "inputType", label: "Type", type: "select", options: [
                { label: "Text", value: "text" }, { label: "Email", value: "email" },
                { label: "Password", value: "password" }, { label: "Number", value: "number" },
            ]},
        ],
    },
    {
        type: "textarea",
        label: "Textarea",
        icon: TextCursorInput,
        category: "forms",
        isContainer: false,
        defaultProps: { label: "Message", placeholder: "Type your message...", rows: 4 },
        defaultStyles: { base: {} },
        editableProps: [
            { key: "label", label: "Label", type: "text" },
            { key: "placeholder", label: "Placeholder", type: "text" },
            { key: "rows", label: "Rows", type: "number" },
        ],
    },
    {
        type: "select",
        label: "Select",
        icon: ListChecks,
        category: "forms",
        isContainer: false,
        defaultProps: { label: "Country", options: "United States\nCanada\nUnited Kingdom\nGermany" },
        defaultStyles: { base: {} },
        editableProps: [
            { key: "label", label: "Label", type: "text" },
            { key: "options", label: "Options (one per line)", type: "textarea" },
        ],
    },
    {
        type: "checkbox",
        label: "Checkbox",
        icon: ToggleLeft,
        category: "forms",
        isContainer: false,
        defaultProps: { label: "I agree to the terms and conditions" },
        defaultStyles: { base: {} },
        editableProps: [
            { key: "label", label: "Label", type: "text" },
        ],
    },
    {
        type: "switch",
        label: "Switch",
        icon: ToggleRight,
        category: "forms",
        isContainer: false,
        defaultProps: { label: "Enable notifications", defaultChecked: false },
        defaultStyles: { base: {} },
        editableProps: [
            { key: "label", label: "Label", type: "text" },
            { key: "defaultChecked", label: "Default Checked", type: "boolean" },
        ],
    },
    {
        type: "radio-group",
        label: "Radio Group",
        icon: CircleDot,
        category: "forms",
        isContainer: false,
        defaultProps: { label: "Select an option", options: "Option A\nOption B\nOption C" },
        defaultStyles: { base: {} },
        editableProps: [
            { key: "label", label: "Label", type: "text" },
            { key: "options", label: "Options (one per line)", type: "textarea" },
        ],
    },
    {
        type: "date-picker",
        label: "Date Picker",
        icon: CalendarDays,
        category: "forms",
        isContainer: false,
        defaultProps: { label: "Select date" },
        defaultStyles: { base: {} },
        editableProps: [
            { key: "label", label: "Label", type: "text" },
        ],
    },
    {
        type: "file-upload",
        label: "File Upload",
        icon: Upload,
        category: "forms",
        isContainer: false,
        defaultProps: { label: "Upload file", accept: "*", description: "Drag & drop or click to browse" },
        defaultStyles: { base: {} },
        editableProps: [
            { key: "label", label: "Label", type: "text" },
            { key: "accept", label: "Accept", type: "text", placeholder: ".pdf,.jpg,.png" },
            { key: "description", label: "Description", type: "text" },
        ],
    },
];
