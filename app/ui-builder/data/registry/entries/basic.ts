import {
    AlertTriangle, AlignLeft, Badge as BadgeIcon, CircleUser, Code2, Gauge,
    Image, Link, List, Minus, MousePointer, MoveVertical, Type, Video,
} from "lucide-react";

import type { ComponentRegistryEntry } from "../types";

/** Basic category: everyday content primitives (heading, text, button, etc.). */
export const BASIC_ENTRIES: ComponentRegistryEntry[] = [
    {
        type: "heading",
        label: "Heading",
        icon: Type,
        category: "basic",
        isContainer: false,
        defaultProps: { text: "Heading", level: "h2" },
        defaultStyles: { base: { fontSize: "text-3xl", fontWeight: "font-bold", color: "text-foreground" } },
        editableProps: [
            { key: "text", label: "Text", type: "text", placeholder: "Enter heading..." },
            { key: "level", label: "Level", type: "select", options: [
                { label: "H1", value: "h1" }, { label: "H2", value: "h2" },
                { label: "H3", value: "h3" }, { label: "H4", value: "h4" },
            ]},
        ],
    },
    {
        type: "text",
        label: "Paragraph",
        icon: AlignLeft,
        category: "basic",
        isContainer: false,
        defaultProps: { text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
        defaultStyles: { base: { fontSize: "text-base", color: "text-muted-foreground", lineHeight: "leading-relaxed" } },
        editableProps: [
            { key: "text", label: "Text", type: "textarea", placeholder: "Enter text..." },
        ],
    },
    {
        type: "image",
        label: "Image",
        icon: Image,
        category: "basic",
        isContainer: false,
        defaultProps: { src: "https://placehold.co/600x400/1a1a2e/e0e0e0?text=Image", alt: "Placeholder" },
        defaultStyles: { base: { width: "w-full", borderRadius: "rounded-lg" } },
        editableProps: [
            { key: "src", label: "Image URL", type: "url", placeholder: "https://..." },
            { key: "alt", label: "Alt Text", type: "text", placeholder: "Describe the image" },
        ],
    },
    {
        type: "button",
        label: "Button",
        icon: MousePointer,
        category: "basic",
        isContainer: false,
        defaultProps: { text: "Click Me", variant: "default", size: "default" },
        defaultStyles: { base: {} },
        editableProps: [
            { key: "text", label: "Label", type: "text", placeholder: "Button text" },
            { key: "variant", label: "Variant", type: "select", options: [
                { label: "Default", value: "default" }, { label: "Secondary", value: "secondary" },
                { label: "Outline", value: "outline" }, { label: "Ghost", value: "ghost" },
                { label: "Destructive", value: "destructive" }, { label: "Link", value: "link" },
            ]},
            { key: "size", label: "Size", type: "select", options: [
                { label: "Small", value: "sm" }, { label: "Default", value: "default" },
                { label: "Large", value: "lg" }, { label: "Icon", value: "icon" },
            ]},
        ],
    },
    {
        type: "divider",
        label: "Divider",
        icon: Minus,
        category: "basic",
        isContainer: false,
        defaultProps: {},
        defaultStyles: { base: { margin: "my-6" } },
        editableProps: [],
    },
    {
        type: "spacer",
        label: "Spacer",
        icon: MoveVertical,
        category: "basic",
        isContainer: false,
        defaultProps: { height: "40" },
        defaultStyles: { base: {} },
        editableProps: [
            { key: "height", label: "Height (px)", type: "number", placeholder: "40" },
        ],
    },
    {
        type: "badge",
        label: "Badge",
        icon: BadgeIcon,
        category: "basic",
        isContainer: false,
        defaultProps: { text: "New", variant: "default" },
        defaultStyles: { base: {} },
        editableProps: [
            { key: "text", label: "Text", type: "text" },
            { key: "variant", label: "Variant", type: "select", options: [
                { label: "Default", value: "default" }, { label: "Secondary", value: "secondary" },
                { label: "Outline", value: "outline" }, { label: "Destructive", value: "destructive" },
            ]},
        ],
    },
    {
        type: "link",
        label: "Link",
        icon: Link,
        category: "basic",
        isContainer: false,
        defaultProps: { text: "Learn More →", href: "#" },
        defaultStyles: { base: { color: "text-primary", fontWeight: "font-medium" } },
        editableProps: [
            { key: "text", label: "Text", type: "text" },
            { key: "href", label: "URL", type: "url", placeholder: "https://..." },
        ],
    },
    {
        type: "list",
        label: "List",
        icon: List,
        category: "basic",
        isContainer: false,
        defaultProps: { items: "Feature one\nFeature two\nFeature three", ordered: false },
        defaultStyles: { base: { padding: "pl-5", color: "text-muted-foreground" } },
        editableProps: [
            { key: "items", label: "Items (one per line)", type: "textarea" },
            { key: "ordered", label: "Ordered", type: "boolean" },
        ],
    },
    {
        type: "avatar",
        label: "Avatar",
        icon: CircleUser,
        category: "basic",
        isContainer: false,
        defaultProps: { src: "https://placehold.co/100x100/1a1a2e/e0e0e0?text=JD", fallback: "JD" },
        defaultStyles: { base: {} },
        editableProps: [
            { key: "src", label: "Image URL", type: "url" },
            { key: "fallback", label: "Fallback Text", type: "text" },
        ],
    },
    {
        type: "alert",
        label: "Alert",
        icon: AlertTriangle,
        category: "basic",
        isContainer: false,
        defaultProps: { title: "Heads up!", description: "This is an important message for users.", variant: "default" },
        defaultStyles: { base: {} },
        editableProps: [
            { key: "title", label: "Title", type: "text" },
            { key: "description", label: "Description", type: "textarea" },
            { key: "variant", label: "Variant", type: "select", options: [
                { label: "Default", value: "default" }, { label: "Destructive", value: "destructive" },
            ]},
        ],
    },
    {
        type: "code-block",
        label: "Code Block",
        icon: Code2,
        category: "basic",
        isContainer: false,
        defaultProps: { code: "const hello = 'world';\nconsole.log(hello);", language: "javascript" },
        defaultStyles: { base: {} },
        editableProps: [
            { key: "code", label: "Code", type: "textarea" },
            { key: "language", label: "Language", type: "text", placeholder: "javascript" },
        ],
    },
    {
        type: "progress",
        label: "Progress Bar",
        icon: Gauge,
        category: "basic",
        isContainer: false,
        defaultProps: { value: 60, label: "Loading..." },
        defaultStyles: { base: {} },
        editableProps: [
            { key: "value", label: "Value (0-100)", type: "number" },
            { key: "label", label: "Label", type: "text" },
        ],
    },
    {
        type: "video",
        label: "Video Embed",
        icon: Video,
        category: "basic",
        isContainer: false,
        defaultProps: { src: "https://www.youtube.com/embed/dQw4w9WgXcQ", aspectRatio: "16/9" },
        defaultStyles: { base: { width: "w-full", borderRadius: "rounded-lg", overflow: "overflow-hidden" } },
        editableProps: [
            { key: "src", label: "Embed URL", type: "url" },
            { key: "aspectRatio", label: "Aspect Ratio", type: "select", options: [
                { label: "16:9", value: "16/9" }, { label: "4:3", value: "4/3" }, { label: "1:1", value: "1/1" },
            ]},
        ],
    },
];
