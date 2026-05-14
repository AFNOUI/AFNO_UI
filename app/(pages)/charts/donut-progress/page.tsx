import { DonutProgressChart } from "@/components/ui/charts";
import { ChartVariantGallery } from "@/components/lab/charts/ChartVariantGallery";
import { donutProgressChartSource } from "@/components/lab/charts/chartVariantSources";
import { DonutProgressVariant } from "@/components/ui/charts/donut-progress";

export default function DonutProgressChartsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Donut progress chart variants</h1>
        <p className="text-sm text-muted-foreground">Donut progress variants for progress tracking.</p>
      </div>

      <ChartVariantGallery<DonutProgressVariant>
        source={donutProgressChartSource}
        component={DonutProgressChart}
      />
    </div>
  );
}
