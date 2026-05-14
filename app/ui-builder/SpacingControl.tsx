import { cn } from "@/lib/utils";

const SPACING_OPTIONS = ["0", "1", "2", "3", "4", "5", "6", "8", "10", "12", "16", "20"];

interface SpacingControlProps {
  label: string;
  prefix: "p" | "m";
  values: { top: string; right: string; bottom: string; left: string };
  onChange: (side: string, value: string) => void;
}

export function SpacingControl({ label, prefix, values, onChange }: SpacingControlProps) {
  const sides = [
    { key: "top", short: "T", pos: "top-0 left-1/2 -translate-x-1/2" },
    { key: "right", short: "R", pos: "right-0 top-1/2 -translate-y-1/2" },
    { key: "bottom", short: "B", pos: "bottom-0 left-1/2 -translate-x-1/2" },
    { key: "left", short: "L", pos: "left-0 top-1/2 -translate-y-1/2" },
  ];

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="relative w-full aspect-[2/1.2] border border-dashed border-border rounded-lg bg-muted/20 flex items-center justify-center">
        <div className="w-1/2 h-1/2 bg-muted/40 border border-border rounded text-[10px] text-muted-foreground flex items-center justify-center">
          content
        </div>
        {sides.map(({ key, short, pos }) => (
          <div key={key} className={cn("absolute", pos)}>
            <select
              value={values[key as keyof typeof values] || "0"}
              onChange={(e) => onChange(key, e.target.value)}
              className="w-10 h-6 text-[10px] bg-background border border-border rounded text-center appearance-none cursor-pointer"
              title={`${prefix}-${short}`}
            >
              {SPACING_OPTIONS.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

// Parse Tailwind spacing classes from node styles
export function parseSpacing(styles: Record<string, string>, prefix: "p" | "m"): { top: string; right: string; bottom: string; left: string } {
  const result = { top: "0", right: "0", bottom: "0", left: "0" };
  const all = styles.padding || styles.margin || "";
  
  // Check individual sides
  const tokens = all.split(" ").filter(Boolean);
  for (const t of tokens) {
    const match = t.match(new RegExp(`^${prefix}([trblxy])?-(\\d+)$`));
    if (match) {
      const [, side, val] = match;
      if (!side) { result.top = result.right = result.bottom = result.left = val; }
      else if (side === "t") result.top = val;
      else if (side === "r") result.right = val;
      else if (side === "b") result.bottom = val;
      else if (side === "l") result.left = val;
      else if (side === "x") { result.left = val; result.right = val; }
      else if (side === "y") { result.top = val; result.bottom = val; }
    }
  }
  return result;
}

export function buildSpacingClass(prefix: "p" | "m", values: { top: string; right: string; bottom: string; left: string }): string {
  const { top, right, bottom, left } = values;
  if (top === right && right === bottom && bottom === left) {
    return top === "0" ? "" : `${prefix}-${top}`;
  }
  const parts: string[] = [];
  if (top !== "0") parts.push(`${prefix}t-${top}`);
  if (right !== "0") parts.push(`${prefix}r-${right}`);
  if (bottom !== "0") parts.push(`${prefix}b-${bottom}`);
  if (left !== "0") parts.push(`${prefix}l-${left}`);
  return parts.join(" ");
}
