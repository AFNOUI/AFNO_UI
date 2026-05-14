import { ChartVariantGallery } from "@/components/lab/charts/ChartVariantGallery";
import { pieChartSource } from "@/components/lab/charts/chartVariantSources";
import { PieChart } from "@/components/ui/charts";
import { PieVariant } from "@/components/ui/charts/pie";

export default function PieChartsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Pie chart variants</h1>
        <p className="text-sm text-muted-foreground">
          Full pie chart variants including rose, exploded, nested and half views.
        </p>
      </div>

      <ChartVariantGallery<PieVariant>
        source={pieChartSource}
        component={PieChart}
      />
    </div>
  );
}
