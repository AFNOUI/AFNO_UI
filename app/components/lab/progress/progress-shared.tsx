"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function CircularProgress({
  value,
  size = 80,
  className,
  strokeWidth = 8,
  showValue = true,
  variant = "primary",
}: {
  value: number;
  size?: number;
  className?: string;
  showValue?: boolean;
  strokeWidth?: number;
  variant?: "primary" | "success" | "warning" | "error";
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const variantClasses = {
    error: "stroke-[hsl(var(--progress-error))]",
    success: "stroke-[hsl(var(--progress-success))]",
    warning: "stroke-[hsl(var(--progress-warning))]",
    primary: "stroke-[hsl(var(--progress-indicator))]",
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-[hsl(var(--progress-track))]"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-500 ease-out", variantClasses[variant])}
        />
      </svg>
      {showValue && (
        <span className="absolute text-sm font-semibold">
          {Math.round(value)}%
        </span>
      )}
    </div>
  );
}

export function SemiCircularProgress({ value, size = 120 }: { value: number; size?: number }) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-end justify-center" style={{ width: size, height: size / 2 + 20 }}>
      <svg width={size} height={size / 2 + strokeWidth} className="overflow-visible">
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-[hsl(var(--progress-track))]"
        />
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="stroke-[hsl(var(--progress-indicator))] transition-all duration-500"
        />
      </svg>
      <span className="absolute bottom-0 text-lg font-bold">{Math.round(value)}%</span>
    </div>
  );
}

export function IndeterminateSpinner({ size = 40 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24">
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          strokeWidth="3"
          className="stroke-[hsl(var(--progress-track))]"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          strokeWidth="3"
          strokeDasharray="32"
          strokeLinecap="round"
          className="stroke-[hsl(var(--progress-indicator))]"
        />
      </svg>
    </div>
  );
}

export function GradientProgress({ value }: { value: number }) {
  return (
    <div className="h-(--progress-height) w-full rounded-(--progress-radius) bg-[hsl(var(--progress-track))] overflow-hidden">
      <div
        className="h-full rounded-(--progress-radius) bg-linear-to-r from-[hsl(var(--progress-indicator))] via-[hsl(280_80%_50%)] to-[hsl(330_80%_55%)] transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function StripedProgress({ value, animated = true }: { value: number; animated?: boolean }) {
  return (
    <div className="h-4 w-full rounded-(--progress-radius) bg-[hsl(var(--progress-track))] overflow-hidden">
      <div
        className={cn(
          "h-full rounded-(--progress-radius) bg-[hsl(var(--progress-indicator))] transition-all duration-500",
          animated && "animate-stripe"
        )}
        style={{
          width: `${value}%`,
          backgroundImage: "linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)",
          backgroundSize: "1rem 1rem",
        }}
      />
    </div>
  );
}

export function SegmentedProgress({ value, segments = 5 }: { value: number; segments?: number }) {
  const filledSegments = Math.round((value / 100) * segments);

  return (
    <div className="flex gap-1.5">
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-3 flex-1 rounded-sm transition-all duration-300",
            i < filledSegments ? "bg-[hsl(var(--progress-indicator))]" : "bg-[hsl(var(--progress-track))]"
          )}
        />
      ))}
    </div>
  );
}

export function StepProgress({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
              i < currentStep
                ? "bg-primary text-primary-foreground"
                : i === currentStep
                  ? "bg-primary/20 text-primary border-2 border-primary"
                  : "bg-muted text-muted-foreground"
            )}
          >
            {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div
              className={cn(
                "w-12 h-1 mx-1 rounded transition-all",
                i < currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function RingProgress({ value, size = 100, thickness = 12 }: { value: number; size?: number; thickness?: number }) {
  const radius = (size - thickness) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          className="stroke-[hsl(var(--progress-track))]"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="stroke-[hsl(var(--progress-indicator))] transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{Math.round(value)}</span>
        <span className="text-xs text-muted-foreground">percent</span>
      </div>
    </div>
  );
}

export function BatteryIndicator({ value }: { value: number }) {
  const getColor = () => {
    if (value <= 20) return "bg-[hsl(var(--progress-error))]";
    if (value <= 50) return "bg-[hsl(var(--progress-warning))]";
    return "bg-[hsl(var(--progress-success))]";
  };

  return (
    <div className="flex items-center gap-1">
      <div className="relative w-12 h-6 border-2 border-muted-foreground rounded-sm">
        <div
          className={cn("h-full transition-all duration-300 rounded-[1px]", getColor())}
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="w-1 h-3 bg-muted-foreground rounded-r-sm" />
    </div>
  );
}

export function WifiIndicator({ strength }: { strength: 0 | 1 | 2 | 3 }) {
  return (
    <div className="flex items-end gap-0.5 h-5">
      {[0, 1, 2, 3].map((level) => (
        <div
          key={level}
          className={cn(
            "w-1 rounded-t-sm transition-all",
            level <= strength ? "bg-[hsl(var(--progress-indicator))]" : "bg-[hsl(var(--progress-track))]"
          )}
          style={{ height: `${(level + 1) * 25}%` }}
        />
      ))}
    </div>
  );
}

export function VolumeIndicator({ level }: { level: number }) {
  const bars = 10;
  const filled = Math.round((level / 100) * bars);

  return (
    <div className="flex items-end gap-0.5 h-5">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1.5 rounded-sm transition-all",
            i < filled ? "bg-[hsl(var(--progress-indicator))]" : "bg-[hsl(var(--progress-track))]"
          )}
          style={{ height: `${30 + (i * 7)}%` }}
        />
      ))}
    </div>
  );
}
