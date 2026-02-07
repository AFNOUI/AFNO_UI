"use client";

// import { useTranslation } from "react-i18next";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

import CodePreview from "@/components/lab/CodePreview";
import { SectionTitle } from "@/components/lab/SectionTitle";

export default function SliderPage() {
  // const { t } = useTranslation();

  const sliderCode = `import { Slider } from "@/components/ui/slider";

<Slider defaultValue={[50]} max={100} step={1} />

// Range slider
<Slider defaultValue={[25, 75]} max={100} step={1} />`;

  return (
    <div className="space-y-6">
      <SectionTitle>Slider</SectionTitle>

      <CodePreview title="Slider Component" code={sliderCode}>
        <div className="space-y-6 max-w-sm">
          <div className="space-y-2">
            <Label>Volume</Label>
            <Slider defaultValue={[50]} max={100} step={1} />
          </div>
          <div className="space-y-2">
            <Label>Price Range</Label>
            <Slider defaultValue={[25, 75]} max={100} step={1} />
          </div>
        </div>
      </CodePreview>
    </div>
  );
}
