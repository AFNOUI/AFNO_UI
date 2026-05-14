import { ChartVariantGallery } from "@/components/lab/charts/ChartVariantGallery";
import { barChartSource } from "@/components/lab/charts/chartVariantSources";
import { BarChart } from "@/components/ui/charts";
import { BarVariant } from "@/components/ui/charts/bar";

export default function BarChartsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Bar chart variants</h1>
        <p className="text-sm text-muted-foreground">
          Complete bar chart set including horizontal, gradient, glass, striped, and neon styles.
        </p>
      </div>

      <ChartVariantGallery<BarVariant>
        source={barChartSource}
        component={BarChart}
      />
    </div>
  );
}
