import { ChartVariantGallery } from "@/components/lab/charts/ChartVariantGallery";
import { treemapChartSource } from "@/components/lab/charts/chartVariantSources";
import { TreemapChart } from "@/components/ui/charts";
import { TreemapVariant } from "@/components/ui/charts/treemap";

export default function TreemapChartsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Treemap chart variants</h1>
        <p className="text-sm text-muted-foreground">Treemap variants for proportional data visualization.</p>
      </div>
      <ChartVariantGallery<TreemapVariant>
        source={treemapChartSource}
        component={TreemapChart}
      />
    </div>
  );
}
