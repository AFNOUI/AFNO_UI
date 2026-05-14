import { ChartVariantGallery } from "@/components/lab/charts/ChartVariantGallery";
import { gaugeChartSource } from "@/components/lab/charts/chartVariantSources";
import { GaugeChart } from "@/components/ui/charts";
import { GaugeVariant } from "@/components/ui/charts/gauge";

export default function GaugeChartsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Gauge chart variants</h1>
        <p className="text-sm text-muted-foreground">Gauge chart styles including segmented, mini, and speedometer.</p>
      </div>
      <ChartVariantGallery<GaugeVariant>
        source={gaugeChartSource}
        component={GaugeChart}
      />
    </div>
  );
}
