import { ChartVariantGallery } from "@/components/lab/charts/ChartVariantGallery";
import { lineChartSource } from "@/components/lab/charts/chartVariantSources";
import { LineChart } from "@/components/ui/charts";
import { LineVariant } from "@/components/ui/charts/line";

export default function LineChartsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Line chart variants</h1>
        <p className="text-sm text-muted-foreground">
          Full line chart variants including glow, stepped, multi-color, and gradient area.
        </p>
      </div>

      <ChartVariantGallery<LineVariant>
        source={lineChartSource}
        component={LineChart}
      />
    </div>
  );
}
