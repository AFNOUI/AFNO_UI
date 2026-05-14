export const data = [
  { title: "First", subtitle: "Standard sliding effect" },
  { title: "Second", subtitle: "Standard sliding effect" },
  { title: "Third", subtitle: "Standard sliding effect" },
];

export const code = `import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

const data = ${JSON.stringify(data, null, 2)};

export default function InfiniteSliderCarouselExample() {
  return (
    <Carousel opts={{ loop: true }} className="w-full">
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
  );
}
`;