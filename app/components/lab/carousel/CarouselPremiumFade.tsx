"use client";

import { useRef } from "react";
import Fade from "embla-carousel-fade";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselItem,
  CarouselDots,
  CarouselContent,
} from "@/components/ui/carousel";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { CarouselEngineBehavior } from "@/components/lab/carousel/CarouselEngineBehavior";
import { code, data } from "@/registry/carousel/carousel-premium-fade";

export function CarouselPremiumFade() {
  const autoplay = useRef(Autoplay({ delay: 3000, stopOnInteraction: false }));
  const fade = useRef(Fade());

  const snippet = `import Fade from "embla-carousel-fade";
import Autoplay from "embla-carousel-autoplay";

const data = ${JSON.stringify(data, null, 2)};

<Carousel
  opts={{ loop: true }}
  plugins={[Autoplay({ delay: 3000 }), Fade()]}
>
  <CarouselContent>
    {data.map((i) => (
      <CarouselItem key={i}>
        <div className="aspect-video rounded-xl bg-linear-to-br from-primary/30 to-primary/60 flex items-center justify-center">
          <span className="text-4xl font-bold text-primary-foreground">
            Slide {i}
          </span>
        </div>
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselDots />
</Carousel>
`;

  return (
    <ComponentInstall category="carousel" variant="carousel-premium-fade" title="Premium Fade" code={snippet} fullCode={code}>
      <div className="w-full space-y-0">
        <Carousel
          className="w-full"
          opts={{ loop: true }}
          plugins={[autoplay.current, fade.current]}
        >
          <CarouselContent>
            {data.map((i) => (
              <CarouselItem key={i}>
                <div className="aspect-video rounded-xl bg-linear-to-br from-primary/30 to-primary/60 flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground">
                    Slide {i}
                  </span>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselDots />
        </Carousel>
        <CarouselEngineBehavior
          items={[
            { label: "Opacity Transition" },
            { label: "Looping", value: "Yes" },
          ]}
        />
      </div>
    </ComponentInstall>
  );
}