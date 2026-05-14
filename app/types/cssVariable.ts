export interface CSSVariable {
  name: string;
  value: string;
  label: string;
  unit?: string;
  category: "color" | "spacing" | "radius" | "typography" | "effect" | "component";
}
