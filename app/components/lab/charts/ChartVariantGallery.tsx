"use client";

import { useState, type ComponentType } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import type {
  BaseChartProps as UiBaseChartProps,
  CandleDataInput,
  DataInput,
} from "@/components/ui/chart-primitives";
import {
  buildChartVariantCode,
  type ChartVariantSource,
} from "@/components/lab/charts/chartVariantSources";
import { getChartUiFullSource } from "@/components/lab/charts/chartUiFullSourceGenerated";

type Direction = "ltr" | "rtl";

type GalleryChartProps<
  V extends string,
  D extends DataInput | CandleDataInput,
> = { data: D; variant?: V } & UiBaseChartProps;

type ChartComponent<
  V extends string,
  D extends DataInput | CandleDataInput = DataInput,
> = ComponentType<GalleryChartProps<V, D>>;

export function ChartVariantGallery<
  V extends string,
  D extends DataInput | CandleDataInput = DataInput,
>({
  source,
  component: Component,
}: {
  source: ChartVariantSource<V, D>;
  component: ChartComponent<V, D>;
}) {
  const [direction, setDirection] = useState<Direction>("ltr");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Switch direction for RTL/LTR rendering.
        </p>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={direction === "ltr" ? "default" : "outline"}
            onClick={() => setDirection("ltr")}
            className="h-7 text-xs"
          >
            LTR
          </Button>
          <Button
            size="sm"
            variant={direction === "rtl" ? "default" : "outline"}
            onClick={() => setDirection("rtl")}
            className="h-7 text-xs"
          >
            RTL
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "grid gap-6",
          source.variants.length > 1 ? "md:grid-cols-2" : "grid-cols-1",
        )}
      >
        {source.variants.map((variant) => {
          const variantSlug = `${source.chartSlug}/${variant.value}`;

          return (
            <ComponentInstall
              category="charts"
              key={variant.value}
              variant={variantSlug}
              title={`${source.chartName} - ${variant.label}`}
              fullCode={getChartUiFullSource(source.importFile)}
              code={buildChartVariantCode(source, variant.value)}
            >
              <Component
                data={source.data}
                title={variant.label}
                direction={direction}
                variant={variant.value}
              />
            </ComponentInstall>
          );
        })}
      </div>
    </div>
  );
}
