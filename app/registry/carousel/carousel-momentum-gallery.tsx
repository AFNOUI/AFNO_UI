export const data = [
  { width: 40, id: 0 },
  { width: 60, id: 1 },
  { width: 30, id: 2 },
  { width: 70, id: 3 },
];

export const code = `import React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const items = ${JSON.stringify(data, null, 2)};

export default function MomentumGalleryCarouselExample() {
  return (
    <Carousel 
      opts={{ loop: true, dragFree: true }}
      plugins={[Autoplay({ delay: 2000 })]}
      className="w-full"
    >
      <CarouselContent className="-ms-2">
        {items.map((item) => (
          <CarouselItem key={item.id} className="pl-2" style={{ flexBasis: \`\${item.width}%\` }}>
            <div className="aspect-video rounded-xl bg-muted/50 border p-4 flex flex-col justify-between">
              <span className="text-xs text-muted-foreground font-mono">
                ASSET_ID: 00{item.id}
              </span>
              <p className="font-semibold">Dynamic Width {item.width}%</p>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
`;