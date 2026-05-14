import { AreaChart } from "@/components/ui/charts";
import { AreaVariant } from "@/components/ui/charts/area";
import { areaChartSource } from "@/components/lab/charts/chartVariantSources";
import { ChartVariantGallery } from "@/components/lab/charts/ChartVariantGallery";

export default function AreaChartsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Area chart variants</h1>
        <p className="text-sm text-muted-foreground">
          Full area chart variants including sparkline, range, stepped, stacked, and glow.
        </p>
      </div>

      <ChartVariantGallery<AreaVariant>
        source={areaChartSource}
        component={AreaChart}
      />
    </div>
  );
}
