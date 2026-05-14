import * as React from "react";

import { cn } from "@/lib/utils";

export function HeaderlessMonth({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const arr = React.Children.toArray(children);
  return (
    <div className={cn("space-y-4", className)}>
      {arr[arr.length - 1] ?? null}
    </div>
  );
}
