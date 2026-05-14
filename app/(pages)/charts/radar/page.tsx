import { ChartVariantGallery } from "@/components/lab/charts/ChartVariantGallery";
import { radarChartSource } from "@/components/lab/charts/chartVariantSources";
import { RadarChart } from "@/components/ui/charts";
import { RadarVariant } from "@/components/ui/charts/radar";

export default function RadarChartsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Radar chart variants</h1>
        <p className="text-sm text-muted-foreground">Radar chart styles for capability and score comparisons.</p>
      </div>
      <ChartVariantGallery<RadarVariant>
        source={radarChartSource}
        component={RadarChart}
      />
    </div>
  );
}
