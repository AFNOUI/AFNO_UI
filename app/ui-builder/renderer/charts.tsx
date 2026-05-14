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
  ScatterChart,
  TreemapChart,
  WaterfallChart,
} from "@/components/ui/charts";

import type { CategoryRenderer } from "./types";

/**
 * Renders every chart node type. Each chart component shares the same
 * `{ data, variant, title, className }` prop shape so the switch cases
 * collapse to a single mapping.
 */
export const renderChartNode: CategoryRenderer = (node, classes) => {
  const p = node.props;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const common: any = {
    data: p.data as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variant: p.variant as any,
    title: p.title as string,
    className: classes,
  };

  switch (node.type) {
    case "bar-chart":
      return <BarChart {...common} />;
    case "line-chart":
      return <LineChart {...common} />;
    case "pie-chart":
      return <PieChart {...common} />;
    case "area-chart":
      return <AreaChart {...common} />;
    case "radar-chart":
      return <RadarChart {...common} />;
    case "scatter-chart":
      return <ScatterChart {...common} />;
    case "gauge-chart":
      return <GaugeChart {...common} />;
    case "funnel-chart":
      return <FunnelChart {...common} />;
    case "treemap-chart":
      return <TreemapChart {...common} />;
    case "candlestick-chart":
      return <CandlestickChart {...common} />;
    case "waterfall-chart":
      return <WaterfallChart {...common} />;
    case "heatmap-chart":
      return <HeatmapChart {...common} />;
    case "polar-area-chart":
      return <PolarAreaChart {...common} />;
    case "radial-bar-chart":
      return <RadialBarChart {...common} />;
    case "bump-chart":
      return <BumpChart {...common} />;
    default:
      return null;
  }
};
