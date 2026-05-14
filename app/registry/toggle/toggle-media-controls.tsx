export const data = {};

export const code = `"use client";

import { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

export default function ToggleMediaControlsExample() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="flex items-center gap-2 p-4 rounded-lg bg-muted">
      <Toggle size="sm" aria-label="Shuffle">
        <Shuffle className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" aria-label="Previous">
        <SkipBack className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={isPlaying}
        onPressedChange={setIsPlaying}
        size="lg"
        aria-label={isPlaying ? "Pause" : "Play"}
        className="rounded-full"
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </Toggle>
      <Toggle size="sm" aria-label="Next">
        <SkipForward className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" aria-label="Repeat">
        <Repeat className="h-4 w-4" />
      </Toggle>
    </div>
  );
}
`;

