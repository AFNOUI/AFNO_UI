import { describe, expect, it } from "vitest";

import type { BuilderNode } from "@/ui-builder/data/uiBuilderRegistry";
import { generateCleanCode } from "@/ui-builder/utils/uiBuilderCodeGen";

/**
 * Characterization snapshots for the UI Builder code generator.
 *
 * These lock in byte-for-byte output of `generateCleanCode` so we can safely
 * modularise `uiBuilderCodeGen.ts` (node renderers, import builder, escape/
 * responsive helpers) without regressing the emitted React source.
 *
 * Node fixtures stay intentionally minimal and stable — prefer editing an
 * existing case to adding a new one unless you're asserting a new branch.
 */

let nodeIdCounter = 0;
function node(partial: Partial<BuilderNode> & { type: string }): BuilderNode {
    nodeIdCounter += 1;
    return {
        id: `test_${nodeIdCounter}`,
        type: partial.type,
        props: partial.props ?? {},
        styles: partial.styles ?? { base: {} },
        children: partial.children ?? [],
    };
}

describe("generateCleanCode", () => {
    it("emits the placeholder comment when the canvas is empty", () => {
        expect(generateCleanCode([])).toBe("// Empty canvas — drag components to get started");
    });

    it("renders a simple text-only page without any shadcn imports", () => {
        const nodes = [
            node({
                type: "heading",
                props: { level: "h1", text: "Welcome" },
                styles: { base: { fontSize: "text-4xl" } },
            }),
            node({
                type: "text",
                props: { text: "Hello world." },
                styles: { base: { color: "text-muted-foreground" } },
            }),
        ];
        expect(generateCleanCode(nodes)).toMatchSnapshot();
    });

    it("collapses heading without a level prop to the default h2", () => {
        const nodes = [node({ type: "heading", props: { text: "Default level" } })];
        expect(generateCleanCode(nodes)).toMatchSnapshot();
    });

    it("deduplicates and groups shadcn imports by source file (card, button, separator)", () => {
        const nodes = [
            node({
                type: "card",
                props: { variant: "elevated" },
                styles: { base: { padding: "p-6" } },
                children: [
                    node({ type: "heading", props: { level: "h3", text: "Card title" } }),
                    node({ type: "button", props: { text: "Click", variant: "outline", size: "sm" } }),
                ],
            }),
            node({ type: "divider", styles: { base: { margin: "my-8" } } }),
            node({ type: "button", props: { text: "Again", variant: "default", size: "default" } }),
        ];
        expect(generateCleanCode(nodes)).toMatchSnapshot();
    });

    it("renders responsive styles with sm: and md: prefixes", () => {
        const nodes = [
            node({
                type: "text",
                props: { text: "Responsive" },
                styles: {
                    base: { fontSize: "text-sm" },
                    sm: { fontSize: "text-base" },
                    md: { fontSize: "text-lg" },
                },
            }),
        ];
        expect(generateCleanCode(nodes)).toMatchSnapshot();
    });

    it("escapes angle brackets and curly braces in user text to HTML entities", () => {
        const nodes = [
            node({
                type: "text",
                props: { text: "Use <Foo> and {bar} carefully" },
            }),
        ];
        expect(generateCleanCode(nodes)).toMatchSnapshot();
    });

    it("renders containers, sections, flex and columns as plain <div>s", () => {
        const nodes = [
            node({
                type: "container",
                styles: { base: { padding: "p-4" } },
                children: [
                    node({
                        type: "section",
                        children: [
                            node({
                                type: "flex",
                                children: [
                                    node({
                                        type: "columns",
                                        children: [node({ type: "text", props: { text: "Col A" } })],
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),
        ];
        expect(generateCleanCode(nodes)).toMatchSnapshot();
    });

    it("renders a grid with child cards", () => {
        const nodes = [
            node({
                type: "grid",
                styles: { base: { display: "grid", gridCols: "grid-cols-3", gap: "gap-4" } },
                children: [
                    node({
                        type: "card",
                        props: { variant: "default" },
                        children: [node({ type: "text", props: { text: "One" } })],
                    }),
                    node({
                        type: "card",
                        props: { variant: "ghost" },
                        children: [node({ type: "text", props: { text: "Two" } })],
                    }),
                ],
            }),
        ];
        expect(generateCleanCode(nodes)).toMatchSnapshot();
    });

    it("renders list (ordered/unordered), image, link, badge, alert, avatar, progress, code-block, video", () => {
        const nodes = [
            node({ type: "list", props: { items: "Alpha\nBeta", ordered: false } }),
            node({ type: "list", props: { items: "One\nTwo", ordered: true } }),
            node({ type: "image", props: { src: "/hero.png", alt: "Hero" } }),
            node({ type: "link", props: { href: "/docs", text: "Docs" } }),
            node({ type: "badge", props: { text: "New", variant: "secondary" } }),
            node({
                type: "alert",
                props: { variant: "destructive", title: "Heads up", description: "Something happened" },
            }),
            node({ type: "avatar", props: { src: "/a.jpg", fallback: "AB" } }),
            node({ type: "progress", props: { label: "Loading", value: 42 } }),
            node({ type: "code-block", props: { code: "const x = 1;" } }),
            node({ type: "video", props: { src: "/v.mp4", aspectRatio: "4/3" } }),
            node({ type: "spacer", props: { height: 24 } }),
        ];
        expect(generateCleanCode(nodes)).toMatchSnapshot();
    });

    it("renders tabs-container and accordion-container with correct item indexing", () => {
        const nodes = [
            node({
                type: "tabs-container",
                props: { tabs: "First\nSecond\nThird" },
            }),
            node({
                type: "accordion-container",
                props: { items: "Q1\nA1\nQ2\nA2" },
            }),
        ];
        expect(generateCleanCode(nodes)).toMatchSnapshot();
    });

    it("renders every form control: input, textarea, select, checkbox, switch, radio-group, date-picker, file-upload", () => {
        const nodes = [
            node({
                type: "input",
                props: { label: "Name", inputType: "text", placeholder: "Jane" },
            }),
            node({ type: "textarea", props: { label: "Bio", placeholder: "About you", rows: 5 } }),
            node({
                type: "select",
                props: { label: "Country", options: "US\nNP\nJP" },
            }),
            node({ type: "checkbox", props: { label: "Accept terms" } }),
            node({ type: "switch", props: { label: "Notifications" } }),
            node({ type: "radio-group", props: { label: "Plan", options: "Free\nPro" } }),
            node({ type: "date-picker", props: { label: "Birthday" } }),
            node({
                type: "file-upload",
                props: { label: "Avatar", description: "PNG or JPG up to 2 MB" },
            }),
        ];
        expect(generateCleanCode(nodes)).toMatchSnapshot();
    });

    it("renders the marketing family: testimonial, pricing, feature-grid, stats-counter, faq, newsletter, footer, hero, cta", () => {
        const nodes = [
            node({
                type: "testimonial",
                props: { quote: "Love it", author: "Ada", role: "Engineer" },
            }),
            node({
                type: "pricing",
                props: {
                    title: "Pro",
                    price: "$29",
                    period: "/mo",
                    features: "SSO\nAudit logs\nSupport",
                    cta: "Upgrade",
                    highlighted: true,
                },
            }),
            node({
                type: "feature-grid",
                props: { features: "Fast\nBlazing quick\nSafe\nType-checked" },
            }),
            node({ type: "stats-counter", props: { stats: "10k\nUsers\n99.9%\nUptime" } }),
            node({
                type: "faq",
                props: { title: "FAQ", items: "Why?\nBecause.\nHow?\nLike so." },
            }),
            node({
                type: "newsletter",
                props: { title: "Subscribe", description: "Weekly updates", buttonText: "Join" },
            }),
            node({
                type: "footer",
                props: { brand: "Acme", links: "About\nBlog\nContact", copyright: "© 2026" },
            }),
            node({
                type: "hero",
                children: [node({ type: "heading", props: { level: "h1", text: "Big hero" } })],
            }),
            node({
                type: "cta",
                children: [node({ type: "button", props: { text: "Go", variant: "default", size: "default" } })],
            }),
        ];
        expect(generateCleanCode(nodes)).toMatchSnapshot();
    });

    it("renders data widgets: stat-card, data-table, metric-widget", () => {
        const nodes = [
            node({
                type: "stat-card",
                props: { variant: "highlight", title: "MRR", value: "$12k", change: "+5%" },
            }),
            node({
                type: "data-table",
                props: {
                    headers: "Name\nRole\nStatus",
                    rows: "Ada\nEng\nActive\nBob\nPM\nAway",
                },
            }),
            node({ type: "metric-widget", props: { label: "Users", value: "1,024" } }),
        ];
        expect(generateCleanCode(nodes)).toMatchSnapshot();
    });

    it("renders every chart type with the shared `@/components/ui/charts` import", () => {
        const charts: BuilderNode[] = [
            "bar-chart",
            "line-chart",
            "pie-chart",
            "area-chart",
            "radar-chart",
            "scatter-chart",
            "gauge-chart",
            "funnel-chart",
            "treemap-chart",
            "candlestick-chart",
            "waterfall-chart",
            "heatmap-chart",
            "polar-area-chart",
            "radial-bar-chart",
            "bump-chart",
        ].map((type) =>
            node({
                type,
                props: { data: "a,1\nb,2", variant: "default", title: type },
            }),
        );
        expect(generateCleanCode(charts)).toMatchSnapshot();
    });

    it("falls back to a placeholder div for unknown node types", () => {
        const nodes = [
            node({
                type: "definitely-not-a-real-type",
                styles: { base: { padding: "p-4" } },
            }),
        ];
        expect(generateCleanCode(nodes)).toMatchSnapshot();
    });
});
