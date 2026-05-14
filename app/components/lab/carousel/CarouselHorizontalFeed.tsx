"use client";

import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselItem,
  CarouselContent,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { CarouselEngineBehavior } from "@/components/lab/carousel/CarouselEngineBehavior";
import { code, data } from "@/registry/carousel/carousel-horizontal-feed";

export function CarouselHorizontalFeed() {
  const snippet = `import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const alerts = ${JSON.stringify(data, null, 2)};

export default function HorizontalFeedCarousel() {
  return (
    <Carousel
      opts={{ loop: true }}
      plugins={[Autoplay({ delay: 2500 })]}
      className="w-full max-w-full"
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
}`;

  return (
    <ComponentInstall category="carousel" variant="carousel-horizontal-feed" title="Horizontal Feed" code={snippet} fullCode={code}>
      <div className="w-full space-y-0">
        <Carousel
          opts={{ loop: true }}
          plugins={[Autoplay({ delay: 2500 })]}
          className="w-full"
        >
          <CarouselContent>
            {data.map((item, i) => (
              <CarouselItem key={i}>
                <div className="p-3 sm:p-4 rounded-xl bg-card border">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={cn("w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0", item.c)} />
                    <span className="font-medium text-sm sm:text-base truncate">
                      System Alert: {item.text} Level
                    </span>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <CarouselEngineBehavior
          items={[
            { label: "Autoplay" },
            { label: "Looping", value: "Yes" },
          ]}
        />
      </div>
    </ComponentInstall>
  );
}