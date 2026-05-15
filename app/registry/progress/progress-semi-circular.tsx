export const code = `"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { SemiCircularProgress, IndeterminateSpinner } from "@/components/ui/progress-shared";

export default function ProgressSemiCircularExample() {
  return (
    <div className="flex flex-wrap gap-12 items-end justify-center py-4">
      <div className="text-center space-y-2">
        <SemiCircularProgress value={65} />
        <p className="text-xs text-muted-foreground">Semi-circular</p>
      </div>
      <div className="text-center space-y-2">
        <IndeterminateSpinner size={60} />
        <p className="text-xs text-muted-foreground">Indeterminate</p>
      </div>
      <div className="text-center space-y-2">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Spinner Icon</p>
      </div>
      <div className="text-center space-y-2">
        <RefreshCw className="w-10 h-10 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Refresh Spin</p>
      </div>
    </div>
  );
}
`;
