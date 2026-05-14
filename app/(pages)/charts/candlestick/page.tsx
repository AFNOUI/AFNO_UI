import { ChartVariantGallery } from "@/components/lab/charts/ChartVariantGallery";
import { candlestickChartSource } from "@/components/lab/charts/chartVariantSources";
import type { CandleDataInput } from "@/components/ui/chart-primitives";
import { CandlestickChart, CandlestickVariant } from "@/components/ui/charts/candlestick";

export default function CandlestickChartsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Candlestick chart variants</h1>
        <p className="text-sm text-muted-foreground">OHLC candlestick variants for financial charting.</p>
      </div>
      
      <ChartVariantGallery<CandlestickVariant, CandleDataInput>
        source={candlestickChartSource}
        component={CandlestickChart}
      />
    </div>
  );
}
