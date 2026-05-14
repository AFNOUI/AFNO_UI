import { ChartVariantGallery } from "@/components/lab/charts/ChartVariantGallery";
import { heatmapChartSource } from "@/components/lab/charts/chartVariantSources";
import { HeatmapChart } from "@/components/ui/charts";
import { HeatmapVariant } from "@/components/ui/charts/heatmap";

export default function HeatmapChartsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Heatmap chart variants</h1>
        <p className="text-sm text-muted-foreground">Heatmap variants for intensity-based distributions.</p>
      </div>
      <ChartVariantGallery<HeatmapVariant>
        source={heatmapChartSource}
        component={HeatmapChart}
      />
    </div>
  );
}
