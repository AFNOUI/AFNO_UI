"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface DataPoint {
  label: string;
  value: string;
}

function parseData(raw: string): DataPoint[] {
  const lines = raw.split("\n").filter(Boolean);
  const points: DataPoint[] = [];
  for (let i = 0; i < lines.length; i += 2) {
    points.push({ label: lines[i], value: lines[i + 1] || "0" });
  }
  return points.length > 0 ? points : [{ label: "Item 1", value: "100" }];
}

function serializeData(points: DataPoint[]): string {
  return points.map(p => `${p.label}\n${p.value}`).join("\n");
}

interface ChartDataEditorProps {
  value: string;
  onChange: (v: string) => void;
}

export function ChartDataEditor({ value, onChange }: ChartDataEditorProps) {
  const [points, setPoints] = useState<DataPoint[]>(() => parseData(value));

  useEffect(() => {
    setPoints(parseData(value));
  }, [value]);

  const update = (newPoints: DataPoint[]) => {
    setPoints(newPoints);
    onChange(serializeData(newPoints));
  };

  const updatePoint = (index: number, field: "label" | "value", val: string) => {
    const next = [...points];
    next[index] = { ...next[index], [field]: val };
    update(next);
  };

  const addPoint = () => {
    update([...points, { label: `Item ${points.length + 1}`, value: "0" }]);
  };

  const removePoint = (index: number) => {
    if (points.length <= 1) return;
    update(points.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Label className="text-[11px]">Chart Data</Label>
      <div className="space-y-1.5 max-h-48 overflow-auto">
        <div className="grid grid-cols-[1fr_80px_28px] gap-1 text-[10px] text-muted-foreground font-medium px-0.5">
          <span>Label</span>
          <span>Value</span>
          <span></span>
        </div>
        {points.map((p, i) => (
          <div key={i} className="grid grid-cols-[1fr_80px_28px] gap-1 items-center">
            <Input
              value={p.label}
              onChange={e => updatePoint(i, "label", e.target.value)}
              className="h-7 text-xs"
              placeholder="Label"
            />
            <Input
              value={p.value}
              onChange={e => updatePoint(i, "value", e.target.value)}
              className="h-7 text-xs"
              placeholder="0"
              type="number"
            />
            <button
              onClick={() => removePoint(i)}
              className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              disabled={points.length <= 1}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={addPoint} className="w-full h-7 text-xs gap-1">
        <Plus className="h-3 w-3" /> Add Data Point
      </Button>
    </div>
  );
}
