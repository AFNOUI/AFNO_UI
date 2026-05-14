"use client";

import React, { useState, useEffect, useRef } from "react";
import Autoplay from "embla-carousel-autoplay";

import {
    Carousel,
    CarouselItem,
    CarouselContent,
    type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { CarouselEngineBehavior } from "@/components/lab/carousel/CarouselEngineBehavior";
import { code, data } from "@/registry/carousel/carousel-progress-bar";

export function CarouselProgressBar() {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!api) return;
        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);
        api.on("select", () => setCurrent(api.selectedScrollSnap() + 1));
    }, [api]);

    const autoplay = useRef(
        Autoplay({ delay: 3000, stopOnInteraction: false })
    );

    const snippet = `import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const colors = ${JSON.stringify(data, null, 2)};

export default function ProgressBarCarousel() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => setCurrent(api.selectedScrollSnap() + 1));
  }, [api]);

  const autoplay = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  return (
    <Carousel 
      opts={{ loop: true }} 
      setApi={setApi}
      plugins={[autoplay.current]}
      className="w-full max-w-full"
    >
      <CarouselContent>
        {colors.map((color, i) => (
          <CarouselItem key={i}>
            <div className={cn("aspect-video rounded-xl flex items-center justify-center text-white text-3xl font-bold", color)}>
              Slide {i + 1}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: \`\${(current / count) * 100}%\` }}
        />
      </div>
    </Carousel>
  );
}`;

    return (
        <ComponentInstall category="carousel" variant="carousel-progress-bar" title="Progress Bar" code={snippet} fullCode={code}>
            <div className="w-full space-y-0">
                <Carousel
                    opts={{ loop: true }}
                    setApi={setApi}
                    plugins={[autoplay.current]}
                    className="w-full"
                >
                    <CarouselContent>
                        {data.map((color, i) => (
                            <CarouselItem key={i}>
                                <div className={cn("aspect-video rounded-xl flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl font-bold", color)}>
                                    Slide {i + 1}
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${(current / count) * 100}%` }}
                        />
                    </div>
                </Carousel>
                <CarouselEngineBehavior
                    items={[
                        { label: "State Driven Width" },
                        { label: "Looping", value: "Yes" },
                    ]}
                />
            </div>
        </ComponentInstall>
    );
}