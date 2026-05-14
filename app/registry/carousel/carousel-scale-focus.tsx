export const data = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-orange-500 to-red-500",
  "from-emerald-500 to-teal-500",
  "from-indigo-500 to-blue-800",
];

export const code = `import React from "react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const gradients = ${JSON.stringify(data, null, 2)};

export default function ScaleFocusCarouselExample() {
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
}
`;