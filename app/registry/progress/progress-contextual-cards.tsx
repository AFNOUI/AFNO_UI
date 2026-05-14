export const data = {
  cards: [
    { icon: "Download", title: "Downloading...", subtitle: "project-assets.zip", progressKey: "animated", color: "primary" },
    { icon: "Upload", title: "Uploading...", subtitle: "3 of 5 files", value: 60, color: "success" },
    { icon: "Zap", title: "Storage Used", subtitle: "7.5 GB of 10 GB", value: 75, height: "h-2", color: "warning" },
    { type: "profile" as const, title: "Profile Completion", stepsLabel: "4/5 steps", value: 80, segments: 5 },
  ],
};

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { useState, useEffect } from "react";
import { Download, Upload, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { SegmentedProgress } from "@/components/lab/progress/progress-shared";

const data = ${dataStr};

export default function ProgressContextualCardsExample() {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimatedValue(75), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {data.cards.map((card, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-3">
          {"type" in card && card.type === "profile" ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{card.title}</p>
                <span className="text-sm text-muted-foreground">{card.stepsLabel}</span>
              </div>
              <SegmentedProgress value={card.value} segments={card.segments} />
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className={\`p-2 rounded-lg \${card.icon === "Download" ? "bg-primary/10" : card.icon === "Upload" ? "bg-[hsl(var(--progress-success))]/10" : "bg-[hsl(var(--progress-warning))]/10"}\`}>
                  {card.icon === "Download" && <Download className="w-4 h-4 text-primary" />}
                  {card.icon === "Upload" && <Upload className="w-4 h-4 text-[hsl(var(--progress-success))]" />}
                  {card.icon === "Zap" && <Zap className="w-4 h-4 text-[hsl(var(--progress-warning))]" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{card.title}</p>
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                </div>
                <span className="text-sm font-medium">
                  {"value" in card ? card.value : animatedValue}%
                </span>
              </div>
              <Progress
                value={"value" in card ? card.value : animatedValue}
                className={card.height || "h-1.5"}
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
`;
