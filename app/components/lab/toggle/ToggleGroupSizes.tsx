"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code } from "@/registry/toggle/toggle-group-sizes";

export function ToggleGroupSizes() {
  return (
    <ComponentInstall
      category="toggle"
      variant="toggle-group-sizes"
      title="Toggle Group Sizes"
      code={code}
      fullCode={code}
    >
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
    </ComponentInstall>
  );
}
