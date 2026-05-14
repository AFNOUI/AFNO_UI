export const data = {
  initialBattery: 75,
  initialWifi: 3,
  initialVolume: 60,
};

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { useState } from "react";
import { Battery, Wifi, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BatteryIndicator, WifiIndicator, VolumeIndicator } from "@/components/lab/progress/progress-shared";

const data = ${dataStr};

export default function ProgressSystemIndicatorsExample() {
  const [battery, setBattery] = useState(data.initialBattery);
  const [wifi, setWifi] = useState<0 | 1 | 2 | 3>(data.initialWifi as 0 | 1 | 2 | 3);
  const [volume, setVolume] = useState(data.initialVolume);

  return (
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
        <Button size="sm" variant="outline" onClick={() => setBattery((b) => Math.max(0, b - 25))}>
          Battery -
        </Button>
        <Button size="sm" variant="outline" onClick={() => setBattery((b) => Math.min(100, b + 25))}>
          Battery +
        </Button>
        <Button size="sm" variant="outline" onClick={() => setWifi((w) => Math.max(0, w - 1) as 0 | 1 | 2 | 3)}>
          WiFi -
        </Button>
        <Button size="sm" variant="outline" onClick={() => setWifi((w) => Math.min(3, w + 1) as 0 | 1 | 2 | 3)}>
          WiFi +
        </Button>
        <Button size="sm" variant="outline" onClick={() => setVolume((v) => Math.max(0, v - 20))}>
          Vol -
        </Button>
        <Button size="sm" variant="outline" onClick={() => setVolume((v) => Math.min(100, v + 20))}>
          Vol +
        </Button>
      </div>
    </div>
  );
}
`;
