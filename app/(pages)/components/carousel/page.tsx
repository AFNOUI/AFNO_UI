"use client";

import * as React from "react";
import Fade from "embla-carousel-fade";
import { Activity, Box } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
// import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import {
  Carousel,
  CarouselItem,
  CarouselNext,
  CarouselDots,
  CarouselContent,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

import CodePreview from "@/components/lab/CodePreview";
import { SectionTitle } from "@/components/lab/SectionTitle";

export default function CarouselPage() {
  // const { t } = useTranslation();

  // Plugin Refs
  const autoplay = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );
  const fade = React.useRef(Fade());
  const autoplayProgress = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );
  const autoplayMomentum = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false })
  );
  const autoplayNews = React.useRef(
    Autoplay({ delay: 2500, stopOnInteraction: false })
  );

  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => setCurrent(api.selectedScrollSnap() + 1));
  }, [api]);

  const carouselTypes = [
    {
      id: "01",
      name: "Premium Fade",
      description: "Slow Cross-Dissolve Effect",
      behavior: "Opacity Transition",
      loop: "Yes",
      render: (
        <Carousel
          opts={{ loop: true }}
          plugins={[autoplay.current, fade.current]}
          className="w-full"
        >
          <CarouselContent>
            {[1, 2, 3].map((i) => (
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
      ),
      code: `import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselDots,
} from "@/components/ui/carousel";

export default function PremiumFadeCarousel() {
  return (
    <Carousel 
      opts={{ loop: true }} 
      plugins={[Autoplay({ delay: 3000 }), Fade()]}
    >
      <CarouselContent>
        {[1, 2, 3].map((i) => (
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
}`,
    },
    {
      id: "02",
      name: "Product Row",
      description: "Multi-item grid display",
      behavior: "Basis-1/3 Align Start",
      loop: "No",
      render: (
        <Carousel opts={{ align: "start" }} className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CarouselItem key={i} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="flex aspect-square items-center justify-center p-4">
                    <span className="text-3xl">Product {i}</span>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-end gap-2 mt-4">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </Carousel>
      ),
      code: `import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

export default function ProductRowCarousel() {
  return (
    <Carousel opts={{ align: "start" }} className="w-full">
      <CarouselContent className="-ml-2 md:-ml-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CarouselItem key={i} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="flex aspect-square items-center justify-center p-4">
                <span className="text-3xl">Product {i}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-end gap-2 mt-4">
        <CarouselPrevious className="static translate-y-0" />
        <CarouselNext className="static translate-y-0" />
      </div>
    </Carousel>
  );
}`,
    },
    {
      id: "03",
      name: "Infinite Slider",
      description: "Standard sliding movement",
      behavior: "Default Slide Logic",
      loop: "Yes",
      render: (
        <Carousel opts={{ loop: true }} className="w-full">
          <CarouselContent>
            {["First", "Second", "Third"].map((text, i) => (
              <CarouselItem key={i}>
                <Card>
                  <CardContent className="flex flex-col aspect-video items-center justify-center p-6">
                    <span className="text-3xl font-bold">{text}</span>
                    <span className="text-muted-foreground mt-2">
                      Standard sliding effect
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
      ),
      code: `import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

export default function InfiniteSliderCarousel() {
  return (
    <Carousel opts={{ loop: true }} className="w-full">
      <CarouselContent>
        {["First", "Second", "Third"].map((text, i) => (
          <CarouselItem key={i}>
            <Card>
              <CardContent className="flex flex-col aspect-video items-center justify-center p-6">
                <span className="text-3xl font-bold">{text}</span>
                <span className="text-muted-foreground mt-2">
                  Standard sliding effect
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
}`,
    },
    {
      id: "04",
      name: "Scale Focus",
      description: "Center-aligned zoom effect",
      behavior: "Conditional Opacity/Scale",
      loop: "Yes",
      render: (
        <Carousel opts={{ loop: true, align: "center" }} className="w-full">
          <CarouselContent>
            {[
              "from-blue-500 to-cyan-500",
              "from-purple-500 to-pink-500",
              "from-orange-500 to-red-500",
              "from-emerald-500 to-teal-500",
              "from-indigo-500 to-blue-800",
            ].map((gradient, i) => (
              <CarouselItem key={i} className="basis-1/2 md:basis-1/3">
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
      ),
      code: `import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const gradients = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-orange-500 to-red-500",
  "from-emerald-500 to-teal-500",
  "from-indigo-500 to-blue-800",
];

export default function ScaleFocusCarousel() {
  return (
    <Carousel opts={{ loop: true, align: "center" }} className="w-full">
      <CarouselContent>
        {gradients.map((gradient, i) => (
          <CarouselItem key={i} className="basis-1/2 md:basis-1/3">
            <div className={cn(
              "aspect-square rounded-xl flex items-center justify-center text-white text-2xl font-bold bg-linear-to-br",
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
}`,
    },
    {
      id: "05",
      name: "Progress Bar",
      description: "Visual navigation indicator",
      behavior: "State Driven Width",
      loop: "Yes",
      render: (
        <Carousel
          opts={{ loop: true }}
          setApi={setApi}
          plugins={[autoplayProgress.current]}
          className="w-full"
        >
          <CarouselContent>
            {["bg-rose-500", "bg-amber-500", "bg-lime-500", "bg-sky-500"].map(
              (color, i) => (
                <CarouselItem key={i}>
                  <div className={cn("aspect-video rounded-xl flex items-center justify-center text-white text-3xl font-bold", color)}>
                    Slide {i + 1}
                  </div>
                </CarouselItem>
              )
            )}
          </CarouselContent>
          <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(current / count) * 100}%` }}
            />
          </div>
        </Carousel>
      ),
      code: `import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const colors = ["bg-rose-500", "bg-amber-500", "bg-lime-500", "bg-sky-500"];

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

  return (
    <Carousel 
      opts={{ loop: true }} 
      setApi={setApi}
      plugins={[Autoplay({ delay: 3000 })]}
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
}`,
    },
    {
      id: "06",
      name: "Momentum Gallery",
      description: "Free-drag variable width",
      behavior: "dragFree: true",
      loop: "Yes",
      render: (
        <Carousel
          opts={{ loop: true, dragFree: true }}
          plugins={[autoplayMomentum.current]}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {[40, 60, 30, 70].map((width, i) => (
              <CarouselItem key={i} className="pl-2" style={{ flexBasis: `${width}%` }}>
                <div className="aspect-video rounded-xl bg-muted/50 border border-border p-4 flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground font-mono">
                    ASSET_ID: 00{i}
                  </span>
                  <p className="font-semibold">Dynamic Width {width}%</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ),
      code: `import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const items = [
  { width: 40, id: 0 },
  { width: 60, id: 1 },
  { width: 30, id: 2 },
  { width: 70, id: 3 },
];

export default function MomentumGalleryCarousel() {
  return (
    <Carousel 
      opts={{ loop: true, dragFree: true }}
      plugins={[Autoplay({ delay: 2000 })]}
    >
      <CarouselContent className="-ml-2">
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
}`,
    },
    {
      id: "07",
      name: "Horizontal Feed",
      description: "Horizontal alert ticker",
      behavior: "axis: 'x'",
      loop: "Yes",
      render: (
        <Carousel
          opts={{ loop: true }}
          plugins={[autoplayNews.current]}
          className="w-full"
        >
          <CarouselContent>
            {[
              { t: "Success", c: "bg-green-500" },
              { t: "Warning", c: "bg-yellow-500" },
              { t: "Error", c: "bg-red-500" },
              { t: "Info", c: "bg-blue-500" },
            ].map((item, i) => (
              <CarouselItem key={i}>
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full", item.c)} />
                    <span className="font-medium">
                      System Alert: {item.t} Level
                    </span>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ),
      code: `import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const alerts = [
  { text: "Success", color: "bg-green-500" },
  { text: "Warning", color: "bg-yellow-500" },
  { text: "Error", color: "bg-red-500" },
  { text: "Info", color: "bg-blue-500" },
];

export default function HorizontalFeedCarousel() {
  return (
    <Carousel 
      opts={{ loop: true }}
      plugins={[Autoplay({ delay: 2500 })]}
    >
      <CarouselContent>
        {alerts.map((item, i) => (
          <CarouselItem key={i}>
            <div className="p-4 rounded-xl bg-card border">
              <div className="flex items-center gap-3">
                <div className={cn("w-3 h-3 rounded-full", item.color)} />
                <span className="font-medium">System Alert: {item.text} Level</span>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}`,
    },
  ];

  return (
    <div className="space-y-8 overflow-x-auto">
      <SectionTitle>Carousel Lab</SectionTitle>

      {/* Lab Header */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-semibold">Carousel Lab</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Properties sync audit v1.0
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Box className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-muted-foreground">
            {carouselTypes.length} Scenarios Loaded
          </span>
        </div>
      </div>

      {/* Carousel Types - Using CodePreview for consistency */}
      {carouselTypes.map((c) => (
        <CodePreview
          key={c.id}
          title={`${c.id}. ${c.name} - ${c.description}`}
          code={c.code}
        >
          <div className="w-full min-w-0">
            {c.render}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Engine Behavior</span>
                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                  {c.behavior}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Looping</span>
                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                  {c.loop}
                </span>
              </div>
            </div>
          </div>
        </CodePreview>
      ))}
    </div>
  );
}
