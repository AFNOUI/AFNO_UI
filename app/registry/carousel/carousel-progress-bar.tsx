export const data = [
  { color: "bg-rose-500" },
  { color: "bg-amber-500" },
  { color: "bg-lime-500" },
  { color: "bg-sky-500" },
];

export const code = `import React, { useState, useEffect, useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const colors = ${JSON.stringify(data, null, 2)};

export default function ProgressBarCarouselExample() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const autoplay = useRef(Autoplay({ delay: 3000, stopOnInteraction: false }));

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => setCurrent(api.selectedScrollSnap() + 1));
  }, [api]);

  return (
    <Carousel 
      opts={{ loop: true }} 
      setApi={setApi}
      plugins={[autoplay.current]}
      className="w-full"
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
}
`;