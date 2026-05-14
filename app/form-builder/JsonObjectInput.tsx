import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

/**
 * Stable JSON-object editor: keeps in-progress raw text locally so the user
 * can type intermediate (invalid) JSON without losing characters, and only
 * propagates the parsed value upward when JSON is valid (or empty).
 */
export function JsonObjectInput({
  value,
  onChange,
  className,
  placeholder,
}: {
  value: Record<string, unknown> | undefined;
  onChange: (next: Record<string, unknown> | undefined) => void;
  className?: string;
  placeholder?: string;
}) {
  const externalText = value ? JSON.stringify(value) : "";
  const [raw, setRaw] = useState<string>(externalText);
  const lastSyncedExternal = useRef<string>(externalText);

  useEffect(() => {
    if (lastSyncedExternal.current === externalText) return;
    lastSyncedExternal.current = externalText;
    let same = false;
    if (raw.trim() === "") {
      same = externalText === "";
    } else {
      try {
        same = JSON.stringify(JSON.parse(raw)) === externalText;
      } catch {
        same = false;
      }
    }
    if (!same) setRaw(externalText);
  }, [externalText, raw]);

  const isInvalid = (() => {
    const trimmed = raw.trim();
    if (trimmed === "") return false;
    try {
      const parsed = JSON.parse(trimmed);
      return !parsed || typeof parsed !== "object" || Array.isArray(parsed);
    } catch {
      return true;
    }
  })();

  return (
    <Input
      value={raw}
      onChange={(e) => {
        const next = e.target.value;
        setRaw(next);
        const trimmed = next.trim();
        if (trimmed === "") {
          onChange(undefined);
          return;
        }
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            onChange(parsed as Record<string, unknown>);
          }
        } catch {
          // keep typing; do not propagate invalid JSON
        }
      }}
      className={cn("h-8 text-sm font-mono", isInvalid && "border-destructive focus-visible:ring-destructive", className)}
      placeholder={placeholder}
      spellCheck={false}
      autoComplete="off"
    />
  );
}
