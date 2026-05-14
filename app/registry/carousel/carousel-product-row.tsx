export const data = [1, 2, 3, 4, 5, 6];

export const code = `import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

const data = ${JSON.stringify(data, null, 2)};

export default function ProductRowCarouselExample() {
  return (
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
  );
}
`;