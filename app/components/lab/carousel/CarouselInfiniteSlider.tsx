"use client";

import {
  Carousel,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselContent,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { CarouselEngineBehavior } from "@/components/lab/carousel/CarouselEngineBehavior";
import { code, data } from "@/registry/carousel/carousel-infinite-slider";

export function CarouselInfiniteSlider() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<Carousel opts={{ loop: true }} className="w-full max-w-full">
  <CarouselContent>
    {data.map((item, index) => (
      <CarouselItem key={index}>
        <Card>
          <CardContent className="flex flex-col aspect-video items-center justify-center p-6">
            <span className="text-3xl font-bold">{item.title}</span>
            <span className="text-muted-foreground mt-2">
              {item.subtitle}
            </span>
          </CardContent>
        </Card>
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
  <CarouselDots />
</Carousel>
`;

  return (
    <ComponentInstall category="carousel" variant="carousel-infinite-slider" title="Infinite Slider" code={snippet} fullCode={code}>
      <div className="w-full space-y-0">
        <Carousel opts={{ loop: true }} className="w-full">
          <CarouselContent>
            {data.map((item, index) => (
              <CarouselItem key={index}>
                <Card>
                  <CardContent className="flex flex-col aspect-video items-center justify-center p-3 sm:p-6">
                    <span className="text-xl sm:text-2xl md:text-3xl font-bold">{item.title}</span>
                    <span className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
                      {item.subtitle}
                    </span>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
          <CarouselDots />
        </Carousel>
        <CarouselEngineBehavior
          items={[
            { label: "Default Slide Logic" },
            { label: "Looping", value: "Yes" },
          ]}
        />
      </div>
    </ComponentInstall>
  );
}