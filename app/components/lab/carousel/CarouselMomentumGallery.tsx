"use client";

import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselItem,
  CarouselContent,
} from "@/components/ui/carousel";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { CarouselEngineBehavior } from "@/components/lab/carousel/CarouselEngineBehavior";
import { code, data } from "@/registry/carousel/carousel-momentum-gallery";

export function CarouselMomentumGallery() {
  const snippet = `import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const items = ${JSON.stringify(data, null, 2)};

export default function MomentumGalleryCarousel() {
  return (
    <Carousel 
      opts={{ loop: true, dragFree: true }}
      plugins={[Autoplay({ delay: 2000 })]}
      className="w-full max-w-full"
    >
      <CarouselContent className="-ms-2">
        {items.map((item) => (
          <CarouselItem key={item.id} className="pl-2" style={{ flexBasis: \`\${item.width}%\` }}>
            <div className="aspect-video rounded-xl bg-muted/50 border border-border p-4 flex flex-col justify-between">
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
}`;

  return (
    <ComponentInstall category="carousel" variant="carousel-momentum-gallery" title="Momentum Gallery" code={snippet} fullCode={code}>
      <div className="w-full space-y-0">
        <Carousel
          opts={{ loop: true, dragFree: true }}
          plugins={[Autoplay({ delay: 2000 })]}
          className="w-full px-2"
        >
          <CarouselContent className="-ms-2">
            {data.map((item) => (
              <CarouselItem
                key={item.id}
                className="pl-2"
                style={{ flexBasis: `${item.width}%` }}
              >
                <div className="aspect-video rounded-xl bg-muted/50 border border-border p-2 sm:p-4 flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground font-mono truncate">
                    ASSET_ID: 00{item.id}
                  </span>
                  <p className="font-semibold truncate">Dynamic Width {item.width}%</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <CarouselEngineBehavior
          items={[
            { label: "dragFree: true" },
            { label: "Looping", value: "Yes" },
          ]}
        />
      </div>
    </ComponentInstall>
  );
}