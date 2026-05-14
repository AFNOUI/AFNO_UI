import type { EmptyFieldConfig } from "../../types/types.js";

interface EmptyFieldProps {
  config: EmptyFieldConfig;
}

/**
 * EmptyField — a spacer/placeholder that occupies grid space but renders no visible content.
 * Useful for aligning fields in multi-column layouts.
 */
export function EmptyField({ config }: EmptyFieldProps) {
  return (
    <div
      className={config.className}
      style={{ height: config.height || 'auto' }}
      aria-hidden="true"
    />
  );
}
