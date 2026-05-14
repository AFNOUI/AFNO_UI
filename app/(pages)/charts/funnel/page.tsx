import { ChartVariantGallery } from "@/components/lab/charts/ChartVariantGallery";
import { funnelChartSource } from "@/components/lab/charts/chartVariantSources";
import { FunnelChart } from "@/components/ui/charts";
import { FunnelVariant } from "@/components/ui/charts/funnel";

export default function FunnelChartsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Funnel chart variants</h1>
        <p className="text-sm text-muted-foreground">Conversion funnel and pyramid style variants.</p>
      </div>
      <ChartVariantGallery<FunnelVariant>
        source={funnelChartSource}
        component={FunnelChart}
      />
    </div>
  );
}
