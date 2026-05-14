import { ChartVariantGallery } from "@/components/lab/charts/ChartVariantGallery";
import { polarAreaChartSource } from "@/components/lab/charts/chartVariantSources";
import { PolarAreaChart } from "@/components/ui/charts";
import { PolarAreaVariant } from "@/components/ui/charts/polar-area";

export default function PolarAreaChartsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Polar area chart variants</h1>
        <p className="text-sm text-muted-foreground">Polar area variants including outlined and spaced segments.</p>
      </div>
      <ChartVariantGallery<PolarAreaVariant>
        source={polarAreaChartSource}
        component={PolarAreaChart}
      />
    </div>
  );
}
