"use client";

import { useState, useEffect } from "react";
// import { useTranslation } from "react-i18next";
import { Loader2, Check, Download, Upload, Zap, RefreshCw, Wifi, Battery, Volume2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import CodePreview from "@/components/lab/CodePreview";
import { SectionTitle } from "@/components/lab/SectionTitle";

function CircularProgress({
  value,
  size = 80,
  className,
  strokeWidth = 8,
  showValue = true,
  variant = "primary"
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

// Semi-circular Progress using CSS variables
function SemiCircularProgress({ value, size = 120 }: { value: number; size?: number }) {
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

function IndeterminateSpinner({ size = 40 }: { size?: number }) {
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

function GradientProgress({ value }: { value: number }) {
  return (
    <div className="h-(--progress-height) w-full rounded-(--progress-radius) bg-[hsl(var(--progress-track))] overflow-hidden">
      <div
        className="h-full rounded-(--progress-radius) bg-linear-to-r from-[hsl(var(--progress-indicator))] via-[hsl(280_80%_50%)] to-[hsl(330_80%_55%)] transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function StripedProgress({ value, animated = true }: { value: number; animated?: boolean }) {
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
          backgroundSize: "1rem 1rem"
        }}
      />
    </div>
  );
}

function SegmentedProgress({ value, segments = 5 }: { value: number; segments?: number }) {
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

function StepProgress({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
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

function RingProgress({ value, size = 100, thickness = 12 }: { value: number; size?: number; thickness?: number }) {
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

function BatteryIndicator({ value }: { value: number }) {
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

function WifiIndicator({ strength }: { strength: 0 | 1 | 2 | 3 }) {
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

function VolumeIndicator({ level }: { level: number }) {
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

export default function ProgressPage() {
  // const { t } = useTranslation();

  const [step, setStep] = useState(1);
  const [volume, setVolume] = useState(60);
  const [battery, setBattery] = useState(75);
  const [progress, setProgress] = useState(33);
  const [wifi, setWifi] = useState<0 | 1 | 2 | 3>(3);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(75), 500);
    return () => clearTimeout(timer);
  }, []);

  const basicCode = `import { Progress } from "@/components/ui/progress";

<Progress value={33} />
<Progress value={66} />
<Progress value={100} />`;

  const circularCode = `function CircularProgress({ value, size = 80, variant = "primary" }) {
  const radius = (size - 8) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} 
        fill="none" strokeWidth={8} 
        className="stroke-[hsl(var(--progress-track))]" />
      <circle cx={size/2} cy={size/2} r={radius}
        fill="none" strokeWidth={8} 
        className="stroke-[hsl(var(--progress-indicator))]"
        strokeDasharray={circumference} strokeDashoffset={offset} />
    </svg>
  );
}`;

  const styledCode = `// CSS Variables used:
// --progress-height, --progress-radius
// --progress-track, --progress-indicator
// --progress-success, --progress-warning, --progress-error

<GradientProgress value={75} />
<StripedProgress value={75} animated />
<SegmentedProgress value={75} segments={5} />`;

  return (
    <div className="space-y-8">
      <SectionTitle>Progress</SectionTitle>

      {/* Linear Progress */}
      <CodePreview title="Linear Progress" code={basicCode}>
        <div className="space-y-6 max-w-md">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Loading...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <div className="space-y-2">
            <Label>Different Heights</Label>
            <Progress value={25} className="h-1" />
            <Progress value={50} className="h-2" />
            <Progress value={75} className="h-3" />
            <Progress value={100} className="h-4" />
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setProgress(Math.max(0, progress - 10))}>
              - 10%
            </Button>
            <Button size="sm" variant="outline" onClick={() => setProgress(Math.min(100, progress + 10))}>
              + 10%
            </Button>
            <Button size="sm" variant="outline" onClick={() => setProgress(0)}>
              Reset
            </Button>
          </div>
        </div>
      </CodePreview>

      {/* Circular Progress */}
      <CodePreview title="Circular Progress" code={circularCode}>
        <div className="flex flex-wrap gap-8 items-center justify-center py-4">
          <div className="text-center space-y-2">
            <CircularProgress value={25} size={60} />
            <p className="text-xs text-muted-foreground">Small</p>
          </div>
          <div className="text-center space-y-2">
            <CircularProgress value={50} size={80} />
            <p className="text-xs text-muted-foreground">Medium</p>
          </div>
          <div className="text-center space-y-2">
            <CircularProgress value={75} size={100} />
            <p className="text-xs text-muted-foreground">Large</p>
          </div>
          <div className="text-center space-y-2">
            <CircularProgress value={100} size={100} variant="success" />
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>
      </CodePreview>

      {/* Colored Circular Progress */}
      <CodePreview title="Colored Circular Progress" code={`<CircularProgress value={75} variant="success" />`}>
        <div className="flex flex-wrap gap-8 items-center justify-center py-4">
          <div className="text-center space-y-2">
            <CircularProgress value={animatedProgress} size={80} variant="primary" />
            <p className="text-xs text-muted-foreground">Primary</p>
          </div>
          <div className="text-center space-y-2">
            <CircularProgress value={animatedProgress} size={80} variant="success" />
            <p className="text-xs text-muted-foreground">Success</p>
          </div>
          <div className="text-center space-y-2">
            <CircularProgress value={animatedProgress} size={80} variant="warning" />
            <p className="text-xs text-muted-foreground">Warning</p>
          </div>
          <div className="text-center space-y-2">
            <CircularProgress value={animatedProgress} size={80} variant="error" />
            <p className="text-xs text-muted-foreground">Error</p>
          </div>
        </div>
      </CodePreview>

      {/* Ring Progress */}
      <CodePreview title="Ring/Donut Progress" code={`<RingProgress value={75} size={120} thickness={14} />`}>
        <div className="flex flex-wrap gap-12 items-center justify-center py-4">
          <RingProgress value={animatedProgress} size={100} thickness={10} />
          <RingProgress value={animatedProgress} size={120} thickness={14} />
          <RingProgress value={100} size={100} thickness={10} />
        </div>
      </CodePreview>

      {/* Semi-circular and Indeterminate */}
      <CodePreview title="Semi-circular & Indeterminate" code={`<SemiCircularProgress value={65} />`}>
        <div className="flex flex-wrap gap-12 items-end justify-center py-4">
          <div className="text-center space-y-2">
            <SemiCircularProgress value={65} />
            <p className="text-xs text-muted-foreground">Semi-circular</p>
          </div>
          <div className="text-center space-y-2">
            <IndeterminateSpinner size={60} />
            <p className="text-xs text-muted-foreground">Indeterminate</p>
          </div>
          <div className="text-center space-y-2">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Spinner Icon</p>
          </div>
          <div className="text-center space-y-2">
            <RefreshCw className="w-10 h-10 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Refresh Spin</p>
          </div>
        </div>
      </CodePreview>

      {/* Styled Progress Bars */}
      <CodePreview title="Styled Progress Bars" code={styledCode}>
        <div className="space-y-6 max-w-md">
          <div className="space-y-2">
            <Label>Gradient</Label>
            <GradientProgress value={animatedProgress} />
          </div>
          <div className="space-y-2">
            <Label>Striped (Animated)</Label>
            <StripedProgress value={animatedProgress} animated />
          </div>
          <div className="space-y-2">
            <Label>Segmented (5)</Label>
            <SegmentedProgress value={animatedProgress} segments={5} />
          </div>
          <div className="space-y-2">
            <Label>Segmented (10)</Label>
            <SegmentedProgress value={animatedProgress} segments={10} />
          </div>
        </div>
      </CodePreview>

      {/* Step Progress */}
      <CodePreview title="Step Progress" code={`<StepProgress currentStep={2} totalSteps={4} />`}>
        <div className="space-y-6">
          <StepProgress currentStep={step} totalSteps={4} />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
              Previous
            </Button>
            <Button size="sm" onClick={() => setStep(Math.min(4, step + 1))} disabled={step === 4}>
              Next
            </Button>
          </div>
        </div>
      </CodePreview>

      {/* System Indicators */}
      <CodePreview title="System Indicators" code={`<BatteryIndicator value={75} />\n<WifiIndicator strength={3} />\n<VolumeIndicator level={60} />`}>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-8 items-center">
            <div className="flex items-center gap-3">
              <Battery className="h-5 w-5 text-muted-foreground" />
              <BatteryIndicator value={battery} />
              <span className="text-sm">{battery}%</span>
            </div>
            <div className="flex items-center gap-3">
              <Wifi className="h-5 w-5 text-muted-foreground" />
              <WifiIndicator strength={wifi} />
            </div>
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-muted-foreground" />
              <VolumeIndicator level={volume} />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => setBattery(Math.max(0, battery - 25))}>
              Battery -
            </Button>
            <Button size="sm" variant="outline" onClick={() => setBattery(Math.min(100, battery + 25))}>
              Battery +
            </Button>
            <Button size="sm" variant="outline" onClick={() => setWifi(Math.max(0, wifi - 1) as 0 | 1 | 2 | 3)}>
              WiFi -
            </Button>
            <Button size="sm" variant="outline" onClick={() => setWifi(Math.min(3, wifi + 1) as 0 | 1 | 2 | 3)}>
              WiFi +
            </Button>
            <Button size="sm" variant="outline" onClick={() => setVolume(Math.max(0, volume - 20))}>
              Vol -
            </Button>
            <Button size="sm" variant="outline" onClick={() => setVolume(Math.min(100, volume + 20))}>
              Vol +
            </Button>
          </div>
        </div>
      </CodePreview>

      {/* Contextual Progress Cards */}
      <CodePreview title="Contextual Progress Cards" code={`// Progress with context`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Download className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Downloading...</p>
                <p className="text-xs text-muted-foreground">project-assets.zip</p>
              </div>
              <span className="text-sm font-medium">{animatedProgress}%</span>
            </div>
            <Progress value={animatedProgress} className="h-1.5" />
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--progress-success))]/10">
                <Upload className="w-4 h-4 text-[hsl(var(--progress-success))]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Uploading...</p>
                <p className="text-xs text-muted-foreground">3 of 5 files</p>
              </div>
              <span className="text-sm font-medium">60%</span>
            </div>
            <Progress value={60} className="h-1.5" />
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--progress-warning))]/10">
                <Zap className="w-4 h-4 text-[hsl(var(--progress-warning))]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Storage Used</p>
                <p className="text-xs text-muted-foreground">7.5 GB of 10 GB</p>
              </div>
            </div>
            <Progress value={75} className="h-2" />
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Profile Completion</p>
              <span className="text-sm text-muted-foreground">4/5 steps</span>
            </div>
            <SegmentedProgress value={80} segments={5} />
          </div>
        </div>
      </CodePreview>
    </div>
  );
}
