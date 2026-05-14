export const data = [1, 2, 3];

export const code = `import React, { useRef } from "react";
import Fade from "embla-carousel-fade";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselItem,
  CarouselDots,
  CarouselContent,
} from "@/components/ui/carousel";

const data = ${JSON.stringify(data, null, 2)};

export default function PremiumFadeCarouselExample() {
  const autoplay = useRef(Autoplay({ delay: 3000, stopOnInteraction: false }));
  const fade = useRef(Fade());

  return (
    <Carousel
      opts={{ loop: true }}
      plugins={[autoplay.current, fade.current]}
      className="w-full"
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
  );
}
`;