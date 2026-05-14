"use client";

import {
  Carousel,
  CarouselItem,
  CarouselNext,
  CarouselContent,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { CarouselEngineBehavior } from "@/components/lab/carousel/CarouselEngineBehavior";
import { code, data } from "@/registry/carousel/carousel-product-row";

export function CarouselProductRow() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<Carousel opts={{ align: "start" }} className="w-full max-w-full">
  <CarouselContent className="-ms-2 md:-ms-4">
    {data.map((i) => (
      <CarouselItem key={i} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="flex aspect-square items-center justify-center p-4">
            <span className="text-3xl">Product {i}</span>
          </CardContent>
        </Card>
      </CarouselItem>
    ))}
  </CarouselContent>
  <div className="flex justify-end gap-2 mt-4">
    <CarouselPrevious className="static translate-y-0" />
    <CarouselNext className="static translate-y-0" />
  </div>
</Carousel>
`;

  return (
    <ComponentInstall category="carousel" variant="carousel-product-row" title="Product Row" code={snippet} fullCode={code}>
      <div className="w-full space-y-0">
        <Carousel opts={{ align: "start" }} className="w-full px-2 md:px-4">
          <CarouselContent className="-ms-2 md:-ms-4">
            {data.map((i) => (
              <CarouselItem key={i} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="flex aspect-square items-center justify-center p-2 sm:p-4">
                    <span className="text-lg sm:text-2xl md:text-3xl">Product {i}</span>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-end gap-2 mt-4">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </Carousel>
        <CarouselEngineBehavior
          items={[
            { label: "Basis-1/3 Align Start" },
            { label: "Looping", value: "No" },
          ]}
        />
      </div>
    </ComponentInstall>
  );
}