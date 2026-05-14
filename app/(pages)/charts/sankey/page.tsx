import { ChartVariantGallery } from "@/components/lab/charts/ChartVariantGallery";
import { sankeyChartSource } from "@/components/lab/charts/chartVariantSources";
import { SankeyChart, SankeyVariant } from "@/components/ui/charts/sankey";

export default function SankeyChartsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Sankey chart variants</h1>
        <p className="text-sm text-muted-foreground">Sankey chart variants for flow analysis.</p>
      </div>
      
      <ChartVariantGallery<SankeyVariant>
        source={sankeyChartSource}
        component={SankeyChart}
      />
    </div>
  );
}
