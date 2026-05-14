"use client";

import { useState, type ComponentType } from "react";
import CodePreview from "@/components/lab/CodePreview";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  chartVariantSources,
  buildChartSectionFullCode,
} from "@/components/lab/charts/chartVariantSources";
import { getChartUiFullSource } from "@/components/lab/charts/chartUiFullSourceGenerated";
import type {
  CandleDataInput,
  DataInput,
} from "@/components/ui/chart-primitives";
import {
  AreaChart,
  BarChart,
  BumpChart,
  CandlestickChart,
  FunnelChart,
  GaugeChart,
  HeatmapChart,
  LineChart,
  PieChart,
  PolarAreaChart,
  RadarChart,
  RadialBarChart,
  SankeyChart,
  DonutProgressChart,
  ScatterChart,
  TreemapChart,
  WaterfallChart,
} from "@/components/ui/charts";

const formatChartTitle = (chartName: string): string =>
  chartName.replace(/Chart$/, " Chart").replace(/([a-z0-9])([A-Z])/g, "$1 $2");

type Direction = "ltr" | "rtl";
type ChartComponentProps = {
  title?: string;
  variant?: string;
  direction?: Direction;
  data: DataInput | CandleDataInput;
};

const chartComponents: Record<string, ComponentType<ChartComponentProps>> = {
  bar: BarChart as ComponentType<ChartComponentProps>,
  line: LineChart as ComponentType<ChartComponentProps>,
  pie: PieChart as ComponentType<ChartComponentProps>,
  area: AreaChart as ComponentType<ChartComponentProps>,
  radar: RadarChart as ComponentType<ChartComponentProps>,
  scatter: ScatterChart as ComponentType<ChartComponentProps>,
  gauge: GaugeChart as ComponentType<ChartComponentProps>,
  funnel: FunnelChart as ComponentType<ChartComponentProps>,
  treemap: TreemapChart as ComponentType<ChartComponentProps>,
  candlestick: CandlestickChart as ComponentType<ChartComponentProps>,
  waterfall: WaterfallChart as ComponentType<ChartComponentProps>,
  heatmap: HeatmapChart as ComponentType<ChartComponentProps>,
  "polar-area": PolarAreaChart as ComponentType<ChartComponentProps>,
  "radial-bar": RadialBarChart as ComponentType<ChartComponentProps>,
  bump: BumpChart as ComponentType<ChartComponentProps>,
  sankey: SankeyChart as ComponentType<ChartComponentProps>,
  "donut-progress": DonutProgressChart as ComponentType<ChartComponentProps>,
};

export default function ChartsVariantsPage() {
  const [direction, setDirection] = useState<Direction>("ltr");

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Chart variants</h1>
        <p className="text-muted-foreground text-sm max-w-3xl">
          Live preview of all chart types and all variants in one page.
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Switch text direction for RTL/LTR preview.
        </p>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={direction === "ltr" ? "default" : "outline"}
            onClick={() => setDirection("ltr")}
            className="h-7 text-xs"
          >
            LTR
          </Button>
          <Button
            size="sm"
            variant={direction === "rtl" ? "default" : "outline"}
            onClick={() => setDirection("rtl")}
            className="h-7 text-xs"
          >
            RTL
          </Button>
        </div>
      </div>

      {chartVariantSources.map((chart) => {
        const ChartComponent = chartComponents[chart.chartSlug];
        if (!ChartComponent) {
          return null;
        }

        return (
          <CodePreview
            key={chart.chartSlug}
            code={buildChartSectionFullCode(chart)}
            fullCode={getChartUiFullSource(chart.importFile)}
            title={`${formatChartTitle(chart.chartName)} (${chart.variants.length} variants)`}
          >
            <div
              className={cn(
                "grid gap-6",
                chart.variants.length > 1 ? "md:grid-cols-2" : "grid-cols-1",
              )}
            >
              {chart.variants.map((variant) => (
                <ChartComponent
                  key={variant.value}
                  data={chart.data}
                  variant={variant.value}
                  title={variant.label}
                  direction={direction}
                />
              ))}
            </div>
          </CodePreview>
        );
      })}
    </div>
  );
}
