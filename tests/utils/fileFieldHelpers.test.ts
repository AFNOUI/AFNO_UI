import { describe, expect, it } from "vitest";

import {
  formatFileSize,
  matchesAcceptedType,
} from "@/forms/utils/fileFieldHelpers";

describe("fileFieldHelpers / formatFileSize", () => {
  it("0 (and other falsy bytes) → '0 Bytes'", () => {
    expect(formatFileSize(0)).toBe("0 Bytes");
  });

  it("formats Bytes / KB / MB / GB", () => {
    expect(formatFileSize(512)).toBe("512 Bytes");
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1500)).toBe("1.46 KB");
    expect(formatFileSize(1024 * 1024)).toBe("1 MB");
    expect(formatFileSize(1024 * 1024 * 1024)).toBe("1 GB");
  });

  it("trims trailing zeros via parseFloat (1.50 → 1.5)", () => {
    expect(formatFileSize(1024 * 1.5)).toBe("1.5 KB");
  });

  it("clamps to GB for sizes > 1024 GB (no out-of-range index)", () => {
    const huge = 5 * Math.pow(1024, 4); // 5 TB
    expect(formatFileSize(huge).endsWith(" GB")).toBe(true);
  });
});

const fakeFile = (name: string, type: string): File =>
  new File([new Blob(["x"])], name, { type });

describe("fileFieldHelpers / matchesAcceptedType", () => {
  it("extension match (case-insensitive)", () => {
    const f = fakeFile("photo.PNG", "image/png");
    expect(matchesAcceptedType(f, ".png")).toBe(true);
    expect(matchesAcceptedType(f, ".PNG")).toBe(true);
    expect(matchesAcceptedType(f, ".jpg")).toBe(false);
  });

  it("exact MIME match", () => {
    const f = fakeFile("doc.pdf", "application/pdf");
    expect(matchesAcceptedType(f, "application/pdf")).toBe(true);
    expect(matchesAcceptedType(f, "image/png")).toBe(false);
  });

  it("wildcard MIME match (image/*)", () => {
    const png = fakeFile("a.png", "image/png");
    const jpg = fakeFile("a.jpg", "image/jpeg");
    const pdf = fakeFile("a.pdf", "application/pdf");
    expect(matchesAcceptedType(png, "image/*")).toBe(true);
    expect(matchesAcceptedType(jpg, "image/*")).toBe(true);
    expect(matchesAcceptedType(pdf, "image/*")).toBe(false);
  });
});
