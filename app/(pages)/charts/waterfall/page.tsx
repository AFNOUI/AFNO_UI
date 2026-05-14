import { ChartVariantGallery } from "@/components/lab/charts/ChartVariantGallery";
import { waterfallChartSource } from "@/components/lab/charts/chartVariantSources";
import { WaterfallChart } from "@/components/ui/charts";
import { WaterfallVariant } from "@/components/ui/charts/waterfall";

export default function WaterfallChartsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Waterfall chart variants</h1>
        <p className="text-sm text-muted-foreground">Waterfall variants for cumulative increase/decrease analysis.</p>
      </div>
      <ChartVariantGallery<WaterfallVariant>
        source={waterfallChartSource}
        component={WaterfallChart}
      />
    </div>
  );
}
