export const data = {
  totalSteps: 4,
};

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StepProgress } from "@/components/lab/progress/progress-shared";

const data = ${dataStr};

export default function ProgressStepExample() {
  const [step, setStep] = useState(1);

  return (
    <div className="space-y-6">
      <StepProgress currentStep={step} totalSteps={data.totalSteps} />
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Previous
        </Button>
        <Button
          size="sm"
          onClick={() => setStep((s) => Math.min(data.totalSteps, s + 1))}
          disabled={step === data.totalSteps}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
`;
