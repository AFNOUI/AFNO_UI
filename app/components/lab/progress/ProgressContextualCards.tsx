"use client";

import { useState, useEffect } from "react";
import { Download, Upload, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { SegmentedProgress } from "./progress-shared";
import { cn } from "@/lib/utils";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/progress/progress-contextual-cards";

export function ProgressContextualCards() {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimatedValue(75), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <ComponentInstall
      category="progress"
      variant="progress-contextual-cards"
      title="Contextual Progress Cards"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n// Cards with progress`}
      fullCode={code}
    >
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
                  <div className={cn(
                    "p-2 rounded-lg",
                    card.icon === "Download" && "bg-primary/10",
                    card.icon === "Upload" && "bg-[hsl(var(--progress-success))]/10",
                    card.icon === "Zap" && "bg-[hsl(var(--progress-warning))]/10"
                  )}>
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
                  className={card.height ?? "h-1.5"}
                />
              </>
            )}
          </div>
        ))}
      </div>
    </ComponentInstall>
  );
}
