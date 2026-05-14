"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StepProgress } from "./progress-shared";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/progress/progress-step";

export function ProgressStep() {
  const [step, setStep] = useState(1);

  return (
    <ComponentInstall
      category="progress"
      variant="progress-step"
      title="Step Progress"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n<StepProgress currentStep={step} totalSteps={data.totalSteps} />`}
      fullCode={code}
    >
      <div className="space-y-6">
        <StepProgress currentStep={step} totalSteps={4} />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            Previous
          </Button>
          <Button size="sm" onClick={() => setStep(Math.min(data.totalSteps, step + 1))} disabled={step === data.totalSteps}>
            Next
          </Button>
        </div>
      </div>
    </ComponentInstall>
  );
}
