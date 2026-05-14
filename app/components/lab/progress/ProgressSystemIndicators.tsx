"use client";

import { useState } from "react";
import { Battery, Wifi, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BatteryIndicator, WifiIndicator, VolumeIndicator } from "./progress-shared";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/progress/progress-system-indicators";

export function ProgressSystemIndicators() {
  const [battery, setBattery] = useState(data.initialBattery);
  const [wifi, setWifi] = useState<0 | 1 | 2 | 3>(data.initialWifi as 0 | 1 | 2 | 3);
  const [volume, setVolume] = useState(data.initialVolume);

  return (
    <ComponentInstall
      category="progress"
      variant="progress-system-indicators"
      title="System Indicators"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n<BatteryIndicator /> <WifiIndicator /> <VolumeIndicator />`}
      fullCode={code}
    >
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
    </ComponentInstall>
  );
}
