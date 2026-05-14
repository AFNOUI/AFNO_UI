"use client";

import {
  Carousel,
  CarouselItem,
  CarouselNext,
  CarouselContent,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { CarouselEngineBehavior } from "@/components/lab/carousel/CarouselEngineBehavior";
import { code, data } from "@/registry/carousel/carousel-scale-focus";

export function CarouselScaleFocus() {
  const snippet = `import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const gradients = ${JSON.stringify(data, null, 2)};

export default function ScaleFocusCarousel() {
  return (
    <Carousel opts={{ loop: true, align: "center" }} className="w-full max-w-full">
      <CarouselContent>
        {gradients.map((gradient, i) => (
          <CarouselItem key={i} className="basis-full sm:basis-1/2 md:basis-1/3">
            <div className={cn(
              "aspect-square rounded-xl flex items-center justify-center text-white text-2xl font-bold bg-linear-to-br transition-all duration-300",
              gradient
            )}>
              {i + 1}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}`;

  return (
    <ComponentInstall category="carousel" variant="carousel-scale-focus" title="Scale Focus" code={snippet} fullCode={code}>
      <div className="w-full space-y-0">
        <Carousel opts={{ loop: true, align: "center" }} className="w-full">
          <CarouselContent>
            {data.map((gradient, i) => (
              <CarouselItem key={i} className="basis-full sm:basis-1/2 md:basis-1/3">
                <div
                  className={cn(
                    "aspect-square rounded-xl flex items-center justify-center text-white text-lg sm:text-xl md:text-2xl font-bold bg-linear-to-br transition-all duration-300",
                    gradient,
                  )}
                >
                  {i + 1}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <CarouselEngineBehavior
          items={[
            { label: "Conditional Opacity/Scale" },
            { label: "Looping", value: "Yes" },
          ]}
        />
      </div>
    </ComponentInstall>
  );
}