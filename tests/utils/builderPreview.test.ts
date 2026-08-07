import { describe, expect, it } from "vitest";

import {
  findPreset,
  matchPreset,
  snapPreviewWidth,
  availablePresets,
  clampPreviewWidth,
  PREVIEW_PRESETS,
  MIN_PREVIEW_WIDTH,
} from "@/components/shared/builder-preview";

describe("presets", () => {
  it("exposes the four documented widths", () => {
    expect(PREVIEW_PRESETS.map((p) => p.width)).toEqual([375, 768, 1280, null]);
  });

  it("looks presets up by id", () => {
    expect(findPreset("tablet")?.width).toBe(768);
    expect(findPreset("full")?.width).toBeNull();
  });

  it("hides presets the container cannot honour", () => {
    // A "1280" button on a 800px container would visibly ignore the click —
    // the clamp folds it straight back to the container width.
    expect(availablePresets(800).map((p) => p.id)).toEqual(["phone", "tablet", "full"]);
    expect(availablePresets(400).map((p) => p.id)).toEqual(["phone", "full"]);
    expect(availablePresets(null)).toHaveLength(PREVIEW_PRESETS.length);
  });
});

describe("clampPreviewWidth", () => {
  it("keeps the width inside the container", () => {
    expect(clampPreviewWidth(2000, 900)).toBe(900);
    expect(clampPreviewWidth(500, 900)).toBe(500);
  });

  it("never goes below the minimum", () => {
    expect(clampPreviewWidth(10, 900)).toBe(MIN_PREVIEW_WIDTH);
    // Even when the container itself is narrower than the minimum.
    expect(clampPreviewWidth(10, 100)).toBe(MIN_PREVIEW_WIDTH);
  });

  it("rounds to whole pixels", () => {
    expect(clampPreviewWidth(500.6, 900)).toBe(501);
  });
});

describe("snapPreviewWidth", () => {
  it("snaps onto a nearby preset", () => {
    expect(snapPreviewWidth(770)).toBe(768);
    expect(snapPreviewWidth(380)).toBe(375);
  });

  it("leaves a genuinely custom width alone", () => {
    expect(snapPreviewWidth(600)).toBe(600);
  });
});

describe("matchPreset", () => {
  it("maps exact widths to their preset", () => {
    expect(matchPreset(375, 1600)).toBe("phone");
    expect(matchPreset(null, 1600)).toBe("full");
  });

  it("reports a dragged width as custom", () => {
    expect(matchPreset(600, 1600)).toBeNull();
  });

  it("reports a constraint the container cannot reach as full", () => {
    // It renders identically to full width, so calling it anything else would
    // be a distinction the user can see is false.
    expect(matchPreset(1280, 900)).toBe("full");
  });

  it("still names a preset that exactly fills the container", () => {
    expect(matchPreset(375, 375)).toBe("phone");
  });
});
