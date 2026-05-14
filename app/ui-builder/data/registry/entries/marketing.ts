import {
    CreditCard, Footprints, Hash, HelpCircle, LayoutGrid, Mail, Megaphone, Quote, Star,
} from "lucide-react";

import type { ComponentRegistryEntry } from "../types";

/** Marketing category: hero, CTA, testimonials, pricing, FAQ, newsletter, footer. */
export const MARKETING_ENTRIES: ComponentRegistryEntry[] = [
    {
        type: "hero",
        label: "Hero Section",
        icon: Star,
        category: "marketing",
        isContainer: true,
        defaultProps: {},
        editableProps: [],
        defaultStyles: { base: { padding: "py-20 px-6", textAlign: "text-center" } },
        defaultChildren: [
            { type: "badge", props: { text: "✨ Introducing v2.0", variant: "secondary" }, styles: { base: { margin: "mb-4" } }, children: [] },
            { type: "heading", props: { text: "Build Something Amazing", level: "h1" }, styles: { base: { fontSize: "text-5xl", fontWeight: "font-extrabold", color: "text-foreground", margin: "mb-4" } }, children: [] },
            { type: "text", props: { text: "The all-in-one platform for modern teams to ship faster." }, styles: { base: { fontSize: "text-xl", color: "text-muted-foreground", maxWidth: "max-w-2xl", margin: "mx-auto mb-8" } }, children: [] },
            { type: "button", props: { text: "Get Started Free", variant: "default" }, styles: { base: {} }, children: [] },
        ],
    },
    {
        type: "cta",
        label: "CTA Banner",
        icon: Megaphone,
        category: "marketing",
        isContainer: true,
        defaultProps: {},
        editableProps: [],
        defaultStyles: { base: { padding: "p-10", borderRadius: "rounded-2xl", background: "bg-primary/5", textAlign: "text-center", border: "border border-primary/20" } },
        defaultChildren: [
            { type: "heading", props: { text: "Ready to get started?", level: "h3" }, styles: { base: { fontSize: "text-2xl", fontWeight: "font-bold", color: "text-foreground", margin: "mb-3" } }, children: [] },
            { type: "text", props: { text: "Join thousands of teams already using our platform." }, styles: { base: { color: "text-muted-foreground", margin: "mb-6" } }, children: [] },
            { type: "button", props: { text: "Start Free Trial", variant: "default" }, styles: { base: {} }, children: [] },
        ],
    },
    {
        type: "testimonial",
        label: "Testimonial",
        icon: Quote,
        category: "marketing",
        isContainer: true,
        isComposite: true,
        defaultProps: { quote: "This product changed how our team works. Highly recommend!", author: "Jane Doe", role: "CEO at Acme" },
        defaultStyles: { base: { padding: "p-6", border: "border", borderRadius: "rounded-xl", background: "bg-card" } },
        editableProps: [
            { key: "quote", label: "Quote", type: "textarea" },
            { key: "author", label: "Author", type: "text" },
            { key: "role", label: "Role", type: "text" },
        ],
    },
    {
        type: "pricing",
        label: "Pricing Card",
        icon: CreditCard,
        category: "marketing",
        isContainer: true,
        isComposite: true,
        defaultProps: { title: "Pro", price: "$29", period: "/month", features: "Unlimited projects\n10 team members\nPriority support\nCustom integrations", cta: "Get Started", highlighted: true },
        defaultStyles: { base: { padding: "p-8", border: "border", borderRadius: "rounded-xl", background: "bg-card" } },
        editableProps: [
            { key: "title", label: "Plan Name", type: "text" },
            { key: "price", label: "Price", type: "text" },
            { key: "period", label: "Period", type: "text" },
            { key: "features", label: "Features (one per line)", type: "textarea" },
            { key: "cta", label: "CTA Text", type: "text" },
            { key: "highlighted", label: "Highlighted", type: "boolean" },
        ],
    },
    {
        type: "feature-grid",
        label: "Feature Grid",
        icon: LayoutGrid,
        category: "marketing",
        isContainer: true,
        isComposite: true,
        defaultProps: {
            features: "Blazing Fast\nOptimized for speed and performance\nSecure\nEnterprise-grade security built-in\nScalable\nGrows with your business needs\nReliable\n99.9% uptime guaranteed",
        },
        defaultStyles: { base: { display: "grid", gridCols: "grid-cols-2", gap: "gap-6" }, sm: { gridCols: "grid-cols-1" } },
        editableProps: [
            { key: "features", label: "Features (title\\ndesc alternating)", type: "textarea" },
        ],
    },
    {
        type: "stats-counter",
        label: "Stats Counter",
        icon: Hash,
        category: "marketing",
        isContainer: true,
        isComposite: true,
        defaultProps: {
            stats: "10K+\nUsers\n99.9%\nUptime\n50+\nIntegrations\n24/7\nSupport",
        },
        defaultStyles: { base: { display: "grid", gridCols: "grid-cols-4", gap: "gap-6", textAlign: "text-center" }, sm: { gridCols: "grid-cols-2" } },
        editableProps: [
            { key: "stats", label: "Stats (value\\nlabel alternating)", type: "textarea" },
        ],
    },
    {
        type: "faq",
        label: "FAQ Section",
        icon: HelpCircle,
        category: "marketing",
        isContainer: true,
        isComposite: true,
        defaultProps: {
            title: "Frequently Asked Questions",
            items: "What is this?\nA professional page builder for creating beautiful UIs.\nHow does it work?\nDrag and drop components onto the canvas.\nIs it free?\nYes, completely free and open source.",
        },
        defaultStyles: { base: { padding: "py-12 px-6", maxWidth: "max-w-3xl", margin: "mx-auto" } },
        editableProps: [
            { key: "title", label: "Title", type: "text" },
            { key: "items", label: "Q&A pairs (alternating lines)", type: "textarea" },
        ],
    },
    {
        type: "newsletter",
        label: "Newsletter Signup",
        icon: Mail,
        category: "marketing",
        isContainer: true,
        isComposite: true,
        defaultProps: { title: "Stay Updated", description: "Get the latest news delivered to your inbox.", buttonText: "Subscribe" },
        defaultStyles: { base: { padding: "p-8", borderRadius: "rounded-xl", background: "bg-card", border: "border", textAlign: "text-center" } },
        editableProps: [
            { key: "title", label: "Title", type: "text" },
            { key: "description", label: "Description", type: "text" },
            { key: "buttonText", label: "Button Text", type: "text" },
        ],
    },
    {
        type: "footer",
        label: "Footer",
        icon: Footprints,
        category: "marketing",
        isContainer: true,
        isComposite: true,
        defaultProps: {
            brand: "Acme Inc",
            links: "About\nBlog\nCareers\nContact\nPrivacy\nTerms",
            copyright: "© 2026 Acme Inc. All rights reserved.",
        },
        defaultStyles: { base: { padding: "py-12 px-6", background: "bg-muted", borderRadius: "rounded-none" } },
        editableProps: [
            { key: "brand", label: "Brand Name", type: "text" },
            { key: "links", label: "Links (one per line)", type: "textarea" },
            { key: "copyright", label: "Copyright Text", type: "text" },
        ],
    },
];
