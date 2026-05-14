export const data = [
  { text: "Success", c: "bg-green-500" },
  { text: "Warning", c: "bg-yellow-500" },
  { text: "Error", c: "bg-red-500" },
  { text: "Info", c: "bg-blue-500" },
];

export const code = `import React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const alerts = ${JSON.stringify(data, null, 2)};

export default function HorizontalFeedCarouselExample() {
  return (
    <Carousel
      opts={{ loop: true }}
      plugins={[Autoplay({ delay: 2500 })]}
      className="w-full"
    >
      <CarouselContent>
        {alerts.map((item, i) => (
          <CarouselItem key={i}>
            <div className="p-4 rounded-xl bg-card border">
              <div className="flex items-center gap-3">
                <div className={cn("w-3 h-3 rounded-full", item.c)} />
                <span className="font-medium">
                  System Alert: {item.text} Level
                </span>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
`;