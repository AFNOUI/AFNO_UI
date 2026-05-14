import { CarouselScaleFocus } from "@/components/lab/carousel/CarouselScaleFocus";
import { CarouselProductRow } from "@/components/lab/carousel/CarouselProductRow";
import { CarouselProgressBar } from "@/components/lab/carousel/CarouselProgressBar";
import { CarouselPremiumFade } from "@/components/lab/carousel/CarouselPremiumFade";
import { CarouselInfiniteSlider } from "@/components/lab/carousel/CarouselInfiniteSlider";
import { CarouselHorizontalFeed } from "@/components/lab/carousel/CarouselHorizontalFeed";
import { CarouselMomentumGallery } from "@/components/lab/carousel/CarouselMomentumGallery";

export default function CarouselPage() {
  return (
    <div className="space-y-6 sm:space-y-8 w-full min-w-0 max-w-full">
      <CarouselPremiumFade />
      <CarouselProductRow />
      <CarouselInfiniteSlider />
      <CarouselScaleFocus />
      <CarouselProgressBar />
      <CarouselMomentumGallery />
      <CarouselHorizontalFeed />
    </div>
  );
}
