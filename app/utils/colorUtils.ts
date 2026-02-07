// Color format types
export type ColorFormat = "hsl" | "hex" | "rgb" | "oklch";

export interface ColorValue {
  h: number;
  s: number;
  l: number;
}

// Parse HSL string "h s% l%" to ColorValue
export function parseHsl(hslString: string): ColorValue {
  const parts = hslString.trim().split(/\s+/);
  return {
    h: parseFloat(parts[0]) || 0,
    s: parseFloat(parts[1]) || 0,
    l: parseFloat(parts[2]) || 0,
  };
}

// Format ColorValue to HSL string "h s% l%"
export function formatHslString(color: ColorValue): string {
  return `${Math.round(color.h)} ${Math.round(color.s)}% ${Math.round(color.l)}%`;
}

// Convert HSL string "h s% l%" to hex
export function hslToHex(hslString: string): string {
  const { h, s, l } = parseHsl(hslString);
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert hex to HSL string "h s% l%"
export function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 0% 0%";

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Convert HSL string to RGB string "rgb(r, g, b)"
export function hslToRgb(hslString: string): string {
  const hex = hslToHex(hslString);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "rgb(0, 0, 0)";
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgb(${r}, ${g}, ${b})`;
}

// Convert RGB string to HSL string
export function rgbToHsl(rgbString: string): string {
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return "0 0% 0%";
  
  const r = parseInt(match[1]) / 255;
  const g = parseInt(match[2]) / 255;
  const b = parseInt(match[3]) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Convert HSL to OKLCH (approximate)
export function hslToOklch(hslString: string): string {
  const { h, s, l } = parseHsl(hslString);
  // Approximate conversion - OKLCH uses different lightness scale
  const L = l / 100;
  const C = (s / 100) * 0.4 * (1 - Math.abs(2 * L - 1));
  const H = h;
  return `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(3)} ${H.toFixed(1)})`;
}

// Format color based on format type
export function formatColor(hslString: string, format: ColorFormat): string {
  switch (format) {
    case "hsl":
      return `hsl(${hslString})`;
    case "hex":
      return hslToHex(hslString);
    case "rgb":
      return hslToRgb(hslString);
    case "oklch":
      return hslToOklch(hslString);
    default:
      return hslString;
  }
}

// Parse any color format to HSL string
export function parseToHsl(colorString: string): string {
  const trimmed = colorString.trim().toLowerCase();
  
  // Already HSL format without wrapper
  if (/^\d+\s+\d+%?\s+\d+%?$/.test(trimmed)) {
    return trimmed;
  }
  
  // HSL with wrapper: hsl(h, s%, l%) or hsl(h s% l%)
  if (trimmed.startsWith("hsl(")) {
    const inner = trimmed.slice(4, -1);
    const parts = inner.split(/[,\s]+/).filter(Boolean);
    if (parts.length >= 3) {
      const h = parseFloat(parts[0]);
      const s = parseFloat(parts[1]);
      const l = parseFloat(parts[2]);
      return `${h} ${s}% ${l}%`;
    }
  }
  
  // Hex format
  if (trimmed.startsWith("#")) {
    return hexToHsl(trimmed);
  }
  
  // RGB format
  if (trimmed.startsWith("rgb(")) {
    return rgbToHsl(trimmed);
  }
  
  return "0 0% 0%";
}

// Parse radius value
export function parseRadius(value: string): number {
  const match = value.match(/^([\d.]+)/);
  return match ? parseFloat(match[1]) : 0.5;
}

export function formatRadius(value: number): string {
  return `${value}rem`;
}

// Get contrasting text color
export function getContrastColor(hslString: string): "light" | "dark" {
  const { l } = parseHsl(hslString);
  return l > 50 ? "dark" : "light";
}
