import { ChartVariantGallery } from "@/components/lab/charts/ChartVariantGallery";
import { radialBarChartSource } from "@/components/lab/charts/chartVariantSources";
import { RadialBarChart } from "@/components/ui/charts";
import { RadialBarVariant } from "@/components/ui/charts/radial-bar";

export default function RadialBarChartsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Radial bar chart variants</h1>
        <p className="text-sm text-muted-foreground">Radial bar variants with rounded and thin ring options.</p>
      </div>
      <ChartVariantGallery<RadialBarVariant>
        source={radialBarChartSource}
        component={RadialBarChart}
      />
    </div>
  );
}
