export const data = {
  volume: { label: "Volume", default: 75, max: 100, step: 1 },
  zoom: { label: "Zoom Level", default: 100, min: 25, max: 200, step: 25, minLabel: "25%", midLabel: "100%", maxLabel: "200%" },
};

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const data = ${dataStr};

export default function PopoverSliderExample() {
  return (
    <div className="flex flex-wrap gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            Volume <ChevronDown className="ms-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{data.volume.label}</Label>
              <span className="text-sm text-muted-foreground">{data.volume.default}%</span>
            </div>
            <Slider defaultValue={[data.volume.default]} max={data.volume.max} step={data.volume.step} />
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            Zoom <ChevronDown className="ms-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{data.zoom.label}</Label>
              <span className="text-sm text-muted-foreground">{data.zoom.default}%</span>
            </div>
            <Slider defaultValue={[data.zoom.default]} min={data.zoom.min} max={data.zoom.max} step={data.zoom.step} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{data.zoom.minLabel}</span>
              <span>{data.zoom.midLabel}</span>
              <span>{data.zoom.maxLabel}</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
`;
