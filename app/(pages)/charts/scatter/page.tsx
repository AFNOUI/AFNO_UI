import { ChartVariantGallery } from "@/components/lab/charts/ChartVariantGallery";
import { scatterChartSource } from "@/components/lab/charts/chartVariantSources";
import { ScatterChart } from "@/components/ui/charts";
import { ScatterVariant } from "@/components/ui/charts/scatter";

export default function ScatterChartsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Scatter chart variants</h1>
        <p className="text-sm text-muted-foreground">Scatter and bubble chart variants for distribution analysis.</p>
      </div>
      <ChartVariantGallery<ScatterVariant>
        source={scatterChartSource}
        component={ScatterChart}
      />
    </div>
  );
}
