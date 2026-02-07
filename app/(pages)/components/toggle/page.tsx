"use client";

// import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  Play, Pause, SkipBack, SkipForward, Repeat, Shuffle,
  List, ListOrdered, Grid, LayoutList, Sun, Moon, Monitor, Wifi, Volume2,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
} from "lucide-react";

import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import CodePreview from "@/components/lab/CodePreview";
import { SectionTitle } from "@/components/lab/SectionTitle";

export default function TogglePage() {
  // const { t } = useTranslation();

  const [theme, setTheme] = useState("system");
  const [isPlaying, setIsPlaying] = useState(false);
  const [alignment, setAlignment] = useState("left");
  const [boldPressed, setBoldPressed] = useState(false);

  const basicCode = `import { Toggle } from "@/components/ui/toggle";
import { Bold } from "lucide-react";

<Toggle aria-label="Toggle bold">
  <Bold className="h-4 w-4" />
</Toggle>

// With state
const [pressed, setPressed] = useState(false);
<Toggle pressed={pressed} onPressedChange={setPressed}>
  <Bold className="h-4 w-4" />
</Toggle>`;

  const toggleGroupCode = `import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

<ToggleGroup type="single" defaultValue="left">
  <ToggleGroupItem value="left" aria-label="Align left">
    <AlignLeft className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="center" aria-label="Align center">
    <AlignCenter className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="right" aria-label="Align right">
    <AlignRight className="h-4 w-4" />
  </ToggleGroupItem>
</ToggleGroup>`;

  return (
    <div className="space-y-6">
      <SectionTitle>Toggle & Toggle Group</SectionTitle>

      <CodePreview title="Basic Toggle" code={basicCode}>
        <div className="flex flex-wrap gap-4">
          <Toggle aria-label="Toggle bold">
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle aria-label="Toggle italic">
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle aria-label="Toggle underline">
            <Underline className="h-4 w-4" />
          </Toggle>
        </div>
      </CodePreview>

      <CodePreview title="Toggle Variants" code={`// Default and outline variants`}>
        <div className="flex flex-wrap gap-4">
          <Toggle variant="default" aria-label="Toggle bold">
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle variant="outline" aria-label="Toggle italic">
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle disabled aria-label="Toggle underline">
            <Underline className="h-4 w-4" />
          </Toggle>
        </div>
      </CodePreview>

      <CodePreview title="Toggle Sizes" code={`// Small, default, and large sizes`}>
        <div className="flex flex-wrap items-center gap-4">
          <Toggle size="sm" aria-label="Toggle small">
            <Bold className="h-3 w-3" />
          </Toggle>
          <Toggle size="default" aria-label="Toggle default">
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle size="lg" aria-label="Toggle large">
            <Bold className="h-5 w-5" />
          </Toggle>
        </div>
      </CodePreview>

      <CodePreview title="With Text" code={`// Toggle with text label`}>
        <div className="flex flex-wrap gap-4">
          <Toggle variant="outline" aria-label="Toggle wifi" className="gap-2">
            <Wifi className="h-4 w-4" />
            WiFi
          </Toggle>
          <Toggle variant="outline" aria-label="Toggle sound" className="gap-2">
            <Volume2 className="h-4 w-4" />
            Sound
          </Toggle>
        </div>
      </CodePreview>

      <CodePreview title="Controlled Toggle" code={`// Controlled state example`}>
        <div className="flex flex-col gap-4">
          <Toggle
            pressed={boldPressed}
            onPressedChange={setBoldPressed}
            aria-label="Toggle bold"
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <p className="text-sm text-muted-foreground">
            Bold is {boldPressed ? "on" : "off"}
          </p>
        </div>
      </CodePreview>

      <CodePreview title="Text Alignment Toggle Group" code={toggleGroupCode}>
        <ToggleGroup type="single" value={alignment} onValueChange={(v) => v && setAlignment(v)}>
          <ToggleGroupItem value="left" aria-label="Align left">
            <AlignLeft className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <AlignCenter className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <AlignRight className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="justify" aria-label="Justify">
            <AlignJustify className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </CodePreview>

      <CodePreview title="Multiple Selection" code={`// Toggle group with multiple selection`}>
        <ToggleGroup type="multiple" defaultValue={["bold", "italic"]}>
          <ToggleGroupItem value="bold" aria-label="Toggle bold">
            <Bold className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Toggle italic">
            <Italic className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Toggle underline">
            <Underline className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </CodePreview>

      <CodePreview title="View Switcher" code={`// Grid/List view toggle`}>
        <ToggleGroup type="single" defaultValue="grid" variant="outline">
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <Grid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <LayoutList className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </CodePreview>

      <CodePreview title="Theme Switcher" code={`// Theme selection toggle group`}>
        <ToggleGroup
          type="single"
          value={theme}
          onValueChange={(v) => v && setTheme(v)}
          variant="outline"
        >
          <ToggleGroupItem value="light" aria-label="Light theme" className="gap-2">
            <Sun className="h-4 w-4" />
            Light
          </ToggleGroupItem>
          <ToggleGroupItem value="dark" aria-label="Dark theme" className="gap-2">
            <Moon className="h-4 w-4" />
            Dark
          </ToggleGroupItem>
          <ToggleGroupItem value="system" aria-label="System theme" className="gap-2">
            <Monitor className="h-4 w-4" />
            System
          </ToggleGroupItem>
        </ToggleGroup>
      </CodePreview>

      <CodePreview title="List Type Toggle" code={`// Bulleted/numbered list toggle`}>
        <ToggleGroup type="single" defaultValue="bullet">
          <ToggleGroupItem value="bullet" aria-label="Bullet list" className="gap-2">
            <List className="h-4 w-4" />
            Bullet
          </ToggleGroupItem>
          <ToggleGroupItem value="numbered" aria-label="Numbered list" className="gap-2">
            <ListOrdered className="h-4 w-4" />
            Numbered
          </ToggleGroupItem>
        </ToggleGroup>
      </CodePreview>

      <CodePreview title="Media Player Controls" code={`// Media player toggle controls`}>
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
      </CodePreview>

      <CodePreview title="Toggle Group Sizes" code={`// Different sizes for toggle groups`}>
        <div className="space-y-4">
          <ToggleGroup type="single" defaultValue="a" size="sm">
            <ToggleGroupItem value="a">A</ToggleGroupItem>
            <ToggleGroupItem value="b">B</ToggleGroupItem>
            <ToggleGroupItem value="c">C</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup type="single" defaultValue="a" size="default">
            <ToggleGroupItem value="a">A</ToggleGroupItem>
            <ToggleGroupItem value="b">B</ToggleGroupItem>
            <ToggleGroupItem value="c">C</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup type="single" defaultValue="a" size="lg">
            <ToggleGroupItem value="a">A</ToggleGroupItem>
            <ToggleGroupItem value="b">B</ToggleGroupItem>
            <ToggleGroupItem value="c">C</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CodePreview>
    </div>
  );
}
