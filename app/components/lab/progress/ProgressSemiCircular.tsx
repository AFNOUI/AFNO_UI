"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { SemiCircularProgress, IndeterminateSpinner } from "./progress-shared";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code } from "@/registry/progress/progress-semi-circular";

export function ProgressSemiCircular() {
  return (
    <ComponentInstall
      category="progress"
      variant="progress-semi-circular"
      title="Semi-circular & Indeterminate"
      code="<SemiCircularProgress value={65} />"
      fullCode={code}
    >
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
    </ComponentInstall>
  );
}
