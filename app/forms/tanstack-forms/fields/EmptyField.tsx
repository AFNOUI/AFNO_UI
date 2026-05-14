import type { EmptyFieldConfig } from "@/forms/types/types";

export function EmptyField({ config }: { config: EmptyFieldConfig }) {
  return (
    <div
      className={config.className}
      style={{ height: config.height || "auto" }}
      aria-hidden="true"
    />
  );
}
