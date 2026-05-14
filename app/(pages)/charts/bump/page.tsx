import { ChartVariantGallery } from "@/components/lab/charts/ChartVariantGallery";
import { bumpChartSource } from "@/components/lab/charts/chartVariantSources";
import { BumpChart } from "@/components/ui/charts";
import { BumpVariant } from "@/components/ui/charts/bump";

export default function BumpChartsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Bump chart variants</h1>
        <p className="text-sm text-muted-foreground">Ranking flow variants for movement across stages.</p>
      </div>
      <ChartVariantGallery<BumpVariant>
        source={bumpChartSource}
        component={BumpChart}
      />
    </div>
  );
}
