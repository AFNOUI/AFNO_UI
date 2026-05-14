import { BarVariant } from "@/components/ui/charts/bar";
import { PieVariant } from "@/components/ui/charts/pie";
import { LineVariant } from "@/components/ui/charts/line";
import { BumpVariant } from "@/components/ui/charts/bump";
import { AreaVariant } from "@/components/ui/charts/area";
import { RadarVariant } from "@/components/ui/charts/radar";
import { GaugeVariant } from "@/components/ui/charts/gauge";
import { SankeyVariant } from "@/components/ui/charts/sankey";
import { FunnelVariant } from "@/components/ui/charts/funnel";
import { ScatterVariant } from "@/components/ui/charts/scatter";
import { TreemapVariant } from "@/components/ui/charts/treemap";
import { HeatmapVariant } from "@/components/ui/charts/heatmap";
import { WaterfallVariant } from "@/components/ui/charts/waterfall";
import { PolarAreaVariant } from "@/components/ui/charts/polar-area";
import { RadialBarVariant } from "@/components/ui/charts/radial-bar";
import { CandlestickVariant } from "@/components/ui/charts/candlestick";
import { DonutProgressVariant } from "@/components/ui/charts/donut-progress";
import type { CandleDataInput, DataInput } from "@/components/ui/chart-primitives";

export type ChartVariantItem<V extends string = string> = {
  value: V;
  label: string;
};

export type ChartVariantSource<V extends string = string, D extends DataInput | CandleDataInput = DataInput> = {
  chartSlug: string;
  chartName: string;
  importFile: string;
  data: D;
  variants: readonly ChartVariantItem<V>[];
};

/** Lab overview + registry iterate mixed chart kinds; `data` widens to both input shapes. */
export type AnyChartVariantSource = ChartVariantSource<string, DataInput | CandleDataInput>;

export const barChartSource: ChartVariantSource<BarVariant> = {
  chartSlug: "bar",
  chartName: "BarChart",
  importFile: "bar",
  data: "Jan\n120\nFeb\n200\nMar\n150\nApr\n280\nMay\n220\nJun\n310",
  variants: [
    { value: "default", label: "Default" },
    { value: "stacked", label: "Stacked" },
    { value: "horizontal", label: "Horizontal" },
    { value: "grouped", label: "Grouped" },
    { value: "rounded", label: "Rounded" },
    { value: "gradient", label: "Gradient" },
    { value: "striped", label: "Striped" },
    { value: "glass", label: "Glass" },
    { value: "neon", label: "Neon" },
  ],
} as const;

export const lineChartSource: ChartVariantSource<LineVariant> = {
  chartSlug: "line",
  chartName: "LineChart",
  importFile: "line",
  data: "Mon\n40\nTue\n65\nWed\n50\nThu\n80\nFri\n95\nSat\n60\nSun\n75",
  variants: [
    { value: "default", label: "Default" },
    { value: "smooth", label: "Smooth" },
    { value: "dashed", label: "Dashed" },
    { value: "area", label: "Area" },
    { value: "dots", label: "Dots" },
    { value: "gradient-area", label: "Gradient Area" },
    { value: "multi-color", label: "Multi Color" },
    { value: "glow", label: "Glow" },
    { value: "stepped", label: "Stepped" },
  ],
} as const;

export const pieChartSource: ChartVariantSource<PieVariant> = {
  chartSlug: "pie",
  chartName: "PieChart",
  importFile: "pie",
  data: "Desktop\n55\nMobile\n30\nTablet\n15",
  variants: [
    { value: "default", label: "Default" },
    { value: "donut", label: "Donut" },
    { value: "half", label: "Half" },
    { value: "labeled", label: "Labeled" },
    { value: "nested", label: "Nested" },
    { value: "exploded", label: "Exploded" },
    { value: "rose", label: "Rose" },
  ],
} as const;

export const areaChartSource: ChartVariantSource<AreaVariant> = {
  chartSlug: "area",
  chartName: "AreaChart",
  importFile: "area",
  data: "Jan\n30\nFeb\n45\nMar\n38\nApr\n60\nMay\n55\nJun\n72",
  variants: [
    { value: "default", label: "Default" },
    { value: "gradient", label: "Gradient" },
    { value: "stacked", label: "Stacked" },
    { value: "stepped", label: "Stepped" },
    { value: "sparkline", label: "Sparkline" },
    { value: "range", label: "Range" },
    { value: "glow", label: "Glow" },
  ],
} as const;

export const radarChartSource: ChartVariantSource<RadarVariant> = {
  chartSlug: "radar",
  chartName: "RadarChart",
  importFile: "radar",
  // data: "Speed\n80\nReliability\n95\nSecurity\n88\nScalability\n92\nUX\n76",
  data: [
    { label: "Speed", value: 80 },
    { label: "Reliability", value: 90 },
    { label: "Comfort", value: 60 },
    { label: "Safety", value: 95 },
    { label: "Efficiency", value: 70 },
    { label: "Design", value: 85 },
  ] as const,
  variants: [
    { value: "default", label: "Default" },
    { value: "filled", label: "Filled" },
    { value: "dots", label: "Dots" },
    { value: "multi", label: "Multi" },
    { value: "rounded", label: "Rounded" },
    { value: "glow", label: "Glow" },
  ],
} as const;

export const scatterChartSource: ChartVariantSource<ScatterVariant> = {
  chartSlug: "scatter",
  chartName: "ScatterChart",
  importFile: "scatter",
  data: "A\n20\nB\n40\nC\n35\nD\n60\nE\n85",
  variants: [
    { value: "default", label: "Default" },
    { value: "bubble", label: "Bubble" },
    { value: "colored", label: "Colored" },
    { value: "line-connected", label: "Line Connected" },
    { value: "clustered", label: "Clustered" },
    { value: "glow", label: "Glow" },
  ],
} as const;

export const gaugeChartSource: ChartVariantSource<GaugeVariant> = {
  chartSlug: "gauge",
  chartName: "GaugeChart",
  importFile: "gauge",
  // data: "Usage\n72\nmax\n100",
  data: [
    { label: "Revenue", value: 85 },
    { label: "Growth", value: 62 },
    { label: "Retention", value: 91 },
    { label: "Max", value: 100 },
  ] as const,
  variants: [
    { value: "default", label: "Default" },
    { value: "gradient", label: "Gradient" },
    { value: "segmented", label: "Segmented" },
    { value: "mini", label: "Mini" },
    { value: "multi-ring", label: "Multi Ring" },
    { value: "speedometer", label: "Speedometer" },
  ],
} as const;

export const funnelChartSource: ChartVariantSource<FunnelVariant> = {
  chartSlug: "funnel",
  chartName: "FunnelChart",
  importFile: "funnel",
  data: "Visitors\n1200\nLeads\n640\nQualified\n280\nCustomers\n92",
  variants: [
    { value: "default", label: "Default" },
    { value: "smooth", label: "Smooth" },
    { value: "striped", label: "Striped" },
    { value: "gradient", label: "Gradient" },
    { value: "flat", label: "Flat" },
    { value: "pyramid", label: "Pyramid" },
  ],
} as const;

export const treemapChartSource: ChartVariantSource<TreemapVariant> = {
  chartSlug: "treemap",
  chartName: "TreemapChart",
  importFile: "treemap",
  data: "Chrome\n64\nSafari\n18\nEdge\n9\nFirefox\n7\nOther\n2",
  variants: [
    { value: "default", label: "Default" },
    { value: "rounded", label: "Rounded" },
    { value: "gradient", label: "Gradient" },
    { value: "bordered", label: "Bordered" },
    { value: "labeled", label: "Labeled" },
  ],
} as const;

export const candlestickChartSource: ChartVariantSource<CandlestickVariant, CandleDataInput> = {
  chartSlug: "candlestick",
  chartName: "CandlestickChart",
  importFile: "candlestick",
  data: "Mon\n100,110,115,95\nTue\n110,105,118,102\nWed\n105,120,124,103\nThu\n120,116,125,112",
  variants: [
    { value: "default", label: "Default" },
    { value: "hollow", label: "Hollow" },
    { value: "colored", label: "Colored" },
    { value: "minimal", label: "Minimal" },
    { value: "heikin-ashi", label: "Heikin Ashi" },
  ],
} as const;

export const waterfallChartSource: ChartVariantSource<WaterfallVariant> = {
  chartSlug: "waterfall",
  chartName: "WaterfallChart",
  importFile: "waterfall",
  data: "Start\n100\nSales\n45\nReturns\n-20\nDiscounts\n-10\nNet\n30",
  variants: [
    { value: "default", label: "Default" },
    { value: "colored", label: "Colored" },
    { value: "stacked", label: "Stacked" },
    { value: "bridge", label: "Bridge" },
  ],
} as const;

export const heatmapChartSource: ChartVariantSource<HeatmapVariant> = {
  chartSlug: "heatmap",
  chartName: "HeatmapChart",
  importFile: "heatmap",
  data: "Mon\n12\nTue\n8\nWed\n15\nThu\n20\nFri\n7\nSat\n3\nSun\n10",
  variants: [
    { value: "default", label: "Default" },
    { value: "rounded", label: "Rounded" },
    { value: "gradient", label: "Gradient" },
    { value: "labeled", label: "Labeled" },
  ],
} as const;

export const polarAreaChartSource: ChartVariantSource<PolarAreaVariant> = {
  chartSlug: "polar-area",
  chartName: "PolarAreaChart",
  importFile: "polar-area",
  data: "North\n55\nEast\n70\nSouth\n42\nWest\n63",
  variants: [
    { value: "default", label: "Default" },
    { value: "outlined", label: "Outlined" },
    { value: "gradient", label: "Gradient" },
    { value: "spaced", label: "Spaced" },
  ],
} as const;

export const radialBarChartSource: ChartVariantSource<RadialBarVariant> = {
  chartSlug: "radial-bar",
  chartName: "RadialBarChart",
  importFile: "radial-bar",
  data: "A\n60\nB\n45\nC\n80\nD\n30",
  variants: [
    { value: "default", label: "Default" },
    { value: "gradient", label: "Gradient" },
    { value: "rounded", label: "Rounded" },
    { value: "thin", label: "Thin" },
  ],
} as const;

export const bumpChartSource: ChartVariantSource<BumpVariant> = {
  chartSlug: "bump",
  chartName: "BumpChart",
  importFile: "bump",
  // data: "Team A\n92\nTeam B\n86\nTeam C\n77\nTeam D\n70",
  data: [
    { label: "Alpha", value: 95 }, { label: "Beta", value: 72 }, { label: "Gamma", value: 88 },
    { label: "Delta", value: 56 }, { label: "Epsilon", value: 81 },
  ] as const,
  variants: [
    { value: "default", label: "Default" },
    { value: "smooth", label: "Smooth" },
    { value: "dots", label: "Dots" },
    { value: "thick", label: "Thick" },
  ],
} as const;

export const sankeyChartSource: ChartVariantSource<SankeyVariant> = {
  chartSlug: "sankey",
  chartName: "SankeyChart",
  importFile: "sankey",
  data: "Inbound\n120\nStage A\n85\nStage B\n95\nOutbound\n72\nReturns\n28",
  variants: [
    { value: "default", label: "Default" },
    { value: "curved", label: "Curved" },
    { value: "gradient", label: "Gradient" },
  ],
} as const;

export const donutProgressChartSource: ChartVariantSource<DonutProgressVariant> = {
  chartSlug: "donut-progress",
  chartName: "DonutProgressChart",
  importFile: "donut-progress",
  data: [
    { label: "Complete", value: 65 },
    { label: "In Progress", value: 20 },
    { label: "Pending", value: 15 },
    { label: "Max", value: 100 },
  ] as const,
  variants: [
    { value: "default", label: "Default" },
    { value: "gradient", label: "Gradient" },
    { value: "thin", label: "Thin" },
    { value: "thick", label: "Thick" },
  ],
} as const;

export const chartVariantSources = [
  barChartSource,
  lineChartSource,
  pieChartSource,
  areaChartSource,
  radarChartSource,
  scatterChartSource,
  gaugeChartSource,
  funnelChartSource,
  treemapChartSource,
  candlestickChartSource,
  waterfallChartSource,
  heatmapChartSource,
  polarAreaChartSource,
  radialBarChartSource,
  bumpChartSource,
  sankeyChartSource,
  donutProgressChartSource,
] as const;

function toPascalCase(value: string): string {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function toSafeComponentName(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "");
}

/** Full file example for `/charts` overview CodePreview "Component" tab. */
export function buildChartSectionFullCode(source: AnyChartVariantSource): string {
  const variantsLiteral = JSON.stringify(source.variants, null, 2);
  const componentName = `${toSafeComponentName(source.chartName)}AllVariantsExample`;
  return `import { ${source.chartName} } from "@/components/ui/charts/${source.importFile}";

const data = ${JSON.stringify(source.data)};
const variants = ${variantsLiteral};

export default function ${componentName}() {
  return (
    <div className="w-full p-4 md:p-8">
      <div className="grid gap-6 md:grid-cols-2">
        {variants.map((variant) => (
          <${source.chartName}
            key={variant.value}
            data={data}
            variant={variant.value}
            title={variant.label}
          />
        ))}
      </div>
    </div>
  );
}
`;
}

/**
 * Small installable example for `public/registry/variants/charts/...` (CLI `afnoui add charts/...`).
 * The in-app chart gallery "Component" tab shows the full `components/ui/charts/<importFile>.tsx`
 * source via `getChartUiFullSource` instead — see `ChartVariantGallery.tsx`.
 */
export function buildChartVariantCode(source: AnyChartVariantSource, variantValue: string): string {
  const exampleName = `${source.chartName}${toPascalCase(variantValue)}Example`;
  const variant = source.variants.find((item) => item.value === variantValue);
  const title = variant?.label ?? variantValue;

  // Installed variant path: `app/charts/<type>/<variant>Chart.tsx`
  // Installed base chart path: `app/components/charts/<type>.tsx`
  // So we want: `../../components/charts/<type>`
  return `import { ${source.chartName} } from "../../components/charts/${source.importFile}";

const data = ${JSON.stringify(source.data)};

export default function ${exampleName}() {
  return <${source.chartName} data={data} variant="${variantValue}" title="${title}" />;
}`;
}
