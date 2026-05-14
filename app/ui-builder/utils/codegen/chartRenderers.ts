import type { BuilderNode } from "@/ui-builder/data/uiBuilderRegistry";
import type { ImportTracker } from "./imports";
import { esc } from "./esc";
import { resolveResponsiveClasses } from "./responsiveClasses";

/**
 * Chart node renderers. Every chart variant emits the same shape — a single
 * self-closing React element with `data` (as a tagged template literal),
 * `variant`, and `title` props — differing only by component name and the
 * default variant. Keeping the list in one table makes it easy to add new
 * chart types without hand-rolling another case in the switch.
 */

export interface ChartRendererSpec {
    type: string;
    component: string;
    defaultVariant: string;
}

export const CHART_RENDERERS: ChartRendererSpec[] = [
    { type: "bar-chart", component: "BarChart", defaultVariant: "default" },
    { type: "line-chart", component: "LineChart", defaultVariant: "default" },
    { type: "pie-chart", component: "PieChart", defaultVariant: "default" },
    { type: "area-chart", component: "AreaChart", defaultVariant: "gradient" },
    { type: "radar-chart", component: "RadarChart", defaultVariant: "default" },
    { type: "scatter-chart", component: "ScatterChart", defaultVariant: "default" },
    { type: "gauge-chart", component: "GaugeChart", defaultVariant: "default" },
    { type: "funnel-chart", component: "FunnelChart", defaultVariant: "default" },
    { type: "treemap-chart", component: "TreemapChart", defaultVariant: "default" },
    { type: "candlestick-chart", component: "CandlestickChart", defaultVariant: "default" },
    { type: "waterfall-chart", component: "WaterfallChart", defaultVariant: "default" },
    { type: "heatmap-chart", component: "HeatmapChart", defaultVariant: "default" },
    { type: "polar-area-chart", component: "PolarAreaChart", defaultVariant: "default" },
    { type: "radial-bar-chart", component: "RadialBarChart", defaultVariant: "default" },
    { type: "bump-chart", component: "BumpChart", defaultVariant: "default" },
];

const CHART_BY_TYPE: Record<string, ChartRendererSpec> = Object.fromEntries(CHART_RENDERERS.map((c) => [c.type, c]));

export function getChartRenderer(type: string): ChartRendererSpec | undefined {
    return CHART_BY_TYPE[type];
}

export function renderChart(node: BuilderNode, imports: ImportTracker, indent: number, spec: ChartRendererSpec): string {
    const pad = " ".repeat(indent);
    const classes = resolveResponsiveClasses(node.styles);
    const classAttr = classes ? ` className="${classes}"` : "";
    const p = node.props;
    imports.charts.add(spec.component);
    return `${pad}<${spec.component} data={\`${esc(p.data as string)}\`} variant="${p.variant || spec.defaultVariant}" title="${esc(p.title as string)}"${classAttr} />`;
}
